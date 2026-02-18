import axios, { AxiosError } from "axios";
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

export const apiClient = axios.create();

apiClient.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    const status = err.response?.status;

    if (status === 401) {
      useSessionStore.getState().resetSession();
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
