// src/services/apiClient.ts
import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
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

export const apiClient = axios.create({
  withCredentials: true,
});

const refreshClient = axios.create({
  withCredentials: true,
});

const retryClient = axios.create({
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

export async function refreshAccessToken(): Promise<string> {
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
  const headers = new AxiosHeaders(config.headers as Record<string, string>);

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
  (response) => response,
  (err: AxiosError) => {
    // Network
    if (!err.response) {
      return Promise.reject(new AppError("NETWORK", "NETWORK_ERROR"));
    }

    // Server 5xx
    if (err.response.status >= 500) {
      return Promise.reject(new AppError("SERVER", "SERVER_ERROR", err.response.status));
    }

    // 4xx는 서비스에서 의미 해석 필요 → 그대로
    return Promise.reject(err);
  },
);

export async function requestWithAuthRetry<T>(
  config: AxiosRequestConfig,
): Promise<AxiosResponse<T>> {
  try {
    return await apiClient.request<T>(config);
  } catch (err) {
    if (!axios.isAxiosError(err)) {
      throw err;
    }

    const status = err.response?.status;
    const url = config.url ?? "";
    const method = (config.method ?? "get").toLowerCase();

    const isReissueRequest = url.includes("/api/reissue");
    const isCreateSessionRequest = url.includes("/api/session") && method === "post";
    const isDeleteSessionRequest = url.includes("/api/session") && method === "delete";
    const isLogoutRequest = url.includes("/api/logout") && method === "post";

    if (
      status !== 401 ||
      isReissueRequest ||
      isCreateSessionRequest ||
      isDeleteSessionRequest ||
      isLogoutRequest
    ) {
      throw err;
    }

    const newAccessToken = await refreshAccessToken();

    const headers = new AxiosHeaders(config.headers as Record<string, string>);
    headers.set("Authorization", `Bearer ${newAccessToken}`);

    return retryClient.request<T>({
      url: config.url,
      method: config.method,
      params: config.params,
      data: config.data,
      baseURL: config.baseURL,
      timeout: config.timeout,
      responseType: config.responseType,
      signal: config.signal,
      headers,
    });
  }
}
