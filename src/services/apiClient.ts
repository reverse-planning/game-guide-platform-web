import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useSessionStore } from "@/stores/sessionSlice";
import { clearAccessToken, getAccessToken, setAccessToken } from "./tokenStorage";

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

/* =========================
 * 1. 요청 인터셉터: AT 자동 주입
 * ========================= */
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const accessToken = getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

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
      const isReissueRequest = originalRequest.url?.includes("/api/reissue");

      if (isReissueRequest || originalRequest._retry) {
        resetAuthState();
        return Promise.reject(new AppError("UNAUTHORIZED", "UNAUTHORIZED", 401));
      }

      originalRequest._retry = true;

      try {
        const refreshRes = await refreshClient.post<{ accessToken: string }>("/api/reissue");
        const newAccessToken = refreshRes.data.accessToken;

        setAccessToken(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return apiClient(originalRequest);
      } catch {
        resetAuthState();
        return Promise.reject(new AppError("UNAUTHORIZED", "UNAUTHORIZED", 401));
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
