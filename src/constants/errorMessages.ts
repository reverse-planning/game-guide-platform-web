// src/constants/errorMessages.ts
import type { CreateSessionErrorCode } from "@/services/sessionService";

export const CREATE_SESSION_ERROR_MESSAGE: Record<CreateSessionErrorCode, string> = {
  NICKNAME_DUPLICATE: "이미 사용 중인 닉네임입니다.",
  UNKNOWN: "로그인에 실패했습니다. 잠시 후 다시 시도해주세요.",
};
