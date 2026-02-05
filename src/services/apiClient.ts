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

function toHomeWithNext() {
  const next = window.location.pathname + window.location.search;
  window.location.replace(`/?next=${encodeURIComponent(next)}`);
}

apiClient.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      useSessionStore.getState().resetSession();

      // ✅ 이미 홈이면 추가 이동 불필요 (무한 replace 방지)
      if (window.location.pathname !== "/") toHomeWithNext();
      return Promise.reject(err); // ✅ 401도 AxiosError로 유지(서비스가 필요하면 볼 수 있게)
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
