// src/constants/appErrorMessages.ts
import type { AppErrorCode } from "@/services/apiClient";

export const APP_ERROR_MESSAGE = {
  UNAUTHORIZED: "로그인이 필요합니다.",
  NETWORK: "네트워크가 불안정합니다. 잠시 후 다시 시도해주세요.",
  SERVER: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  UNKNOWN: "알 수 없는 오류가 발생했습니다.",
} satisfies Record<AppErrorCode, string>;
