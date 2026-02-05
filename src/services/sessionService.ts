// src/services/sessionService.ts
import axios from "axios";
import { apiClient } from "./apiClient";

export type CreateSessionErrorCode = "NICKNAME_DUPLICATE" | "UNKNOWN";
export class CreateSessionError extends Error {
  code: CreateSessionErrorCode;

  constructor(code: CreateSessionErrorCode, message?: string) {
    super(message ?? code);
    this.name = "CreateSessionError";
    this.code = code;
  }
}

export type SessionResponse = {
  userId: number;
  nickname: string;
};
export async function createSession(nickname: string): Promise<SessionResponse> {
  try {
    const res = await apiClient.post<SessionResponse>("/api/session", { nickname });
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      if (err.response.status === 409 && err.response.data?.message === "NICKNAME_DUPLICATE") {
        throw new CreateSessionError("NICKNAME_DUPLICATE");
      }
    }
    throw new CreateSessionError("UNKNOWN");
  }
}

// 부트스트랩: 현재 세션 조회 (쿠키 기반이면 새로고침 후에도 복구 가능)
export async function getSession(): Promise<SessionResponse> {
  const res = await apiClient.get<SessionResponse>("/api/session");
  return res.data;
}

// (선택) 로그아웃 API가 있다면
export async function deleteSession(): Promise<void> {
  await apiClient.delete("/api/session");
}
