// src/services/sessionService.ts
import axios from "axios";
import { apiClient, AppError } from "./apiClient";
import type { SessionDto } from "@/types/session";

export type CreateSessionErrorCode = "NICKNAME_DUPLICATE" | "NETWORK" | "SERVER" | "UNKNOWN";

export class CreateSessionError extends Error {
  code: CreateSessionErrorCode;
  constructor(code: CreateSessionErrorCode, message?: string) {
    super(message ?? code);
    this.name = "CreateSessionError";
    this.code = code;
  }
}

export async function createSession(nickname: string): Promise<SessionDto> {
  try {
    const res = await apiClient.post<SessionDto>("/api/session", { nickname });
    return res.data;
  } catch (err) {
    if (err instanceof AppError) {
      if (err.code === "NETWORK") throw new CreateSessionError("NETWORK");
      if (err.code === "SERVER") throw new CreateSessionError("SERVER");
      throw new CreateSessionError("UNKNOWN");
    }

    if (axios.isAxiosError(err)) {
      if (err.response?.status === 409 && err.response.data?.message === "NICKNAME_DUPLICATE") {
        throw new CreateSessionError("NICKNAME_DUPLICATE");
      }
    }
    throw new CreateSessionError("UNKNOWN");
  }
}

// 부트스트랩: 현재 세션 조회 (쿠키 기반이면 새로고침 후에도 복구 가능)
export async function getSession(): Promise<SessionDto> {
  const res = await apiClient.get<SessionDto>("/api/session");
  return res.data;
}

// (선택) 로그아웃 API가 있다면
export async function deleteSession(): Promise<void> {
  await apiClient.delete("/api/session");
}
