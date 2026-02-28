import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useSessionStore } from "@/stores/sessionSlice";

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

/* =========================
 * 1. 요청 인터셉터: AT 자동 주입
 * ========================= */
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { accessToken } = useSessionStore.getState();

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
  (err: AxiosError) => {
    const status = err.response?.status;

    if (status === 401) {
      useSessionStore.getState().resetViewer();
      return Promise.reject(new AppError("UNAUTHORIZED", "UNAUTHORIZED", 401));
    }

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
