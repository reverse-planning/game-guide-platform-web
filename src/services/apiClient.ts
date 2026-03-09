// src/services/apiClient.ts
import axios, { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import { useSessionStore } from "@/stores/sessionSlice";
import { clearAccessToken, getAccessToken, setAccessToken } from "./tokenStorage";
import type { ReissueResponseDto } from "@/types/session";

export type AppErrorCode = "UNAUTHORIZED" | "NETWORK" | "SERVER" | "UNKNOWN";

export class AppError extends Error {
  code: AppErrorCode;
  status?: number;

  constructor(code: AppErrorCode, message?: string, status?: number) {
    super(message ?? code);
    this.name = "AppError";
    this.code = code;
    this.status = status;
  }
}

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export const apiClient = axios.create({
  withCredentials: true,
});

const refreshClient = axios.create({
  withCredentials: true,
});

function resetAuthState() {
  clearAccessToken();
  useSessionStore.getState().resetSessionCache();
}

/**
 * 동시에 여러 요청이 401이 나더라도
 * refresh는 1번만 수행하고, 나머지는 그 결과를 기다린다.
 */
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<ReissueResponseDto>("/api/reissue")
      .then((res) => {
        const newAccessToken = res.data.accessToken;
        setAccessToken(newAccessToken);
        return newAccessToken;
      })
      .catch(() => {
        resetAuthState();
        throw new AppError("UNAUTHORIZED", "UNAUTHORIZED", 401);
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

/* =========================
 * 1. 요청 인터셉터: AT 자동 주입
 * ========================= */
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const accessToken = getAccessToken();
  const headers = AxiosHeaders.from(config.headers);

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  } else {
    headers.delete("Authorization");
  }

  config.headers = headers;

  return config;
});

/* =========================
 * 2. 응답 인터셉터: 401 → reissue → 재시도
 * ========================= */

apiClient.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const originalRequest = err.config as RetryableRequestConfig | undefined;

    // Network
    if (!err.response) {
      return Promise.reject(new AppError("NETWORK", "NETWORK_ERROR"));
    }

    const status = err.response.status;

    // 401 처리
    if (status === 401 && originalRequest) {
      const url = originalRequest.url ?? "";
      const isReissueRequest = url.includes("/api/reissue");

      // 재발급 자체가 실패했거나 이미 재시도한 요청이면 종료
      if (isReissueRequest || originalRequest._retry) {
        resetAuthState();
        return Promise.reject(new AppError("UNAUTHORIZED", "UNAUTHORIZED", 401));
      }

      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();

        const headers = AxiosHeaders.from(originalRequest.headers);
        headers.set("Authorization", `Bearer ${newAccessToken}`);
        originalRequest.headers = headers;

        return apiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    // Server 5xx
    if (status >= 500) {
      return Promise.reject(new AppError("SERVER", "SERVER_ERROR", status));
    }

    // 4xx는 서비스에서 의미 해석 필요 → 그대로
    return Promise.reject(err);
  },
);
