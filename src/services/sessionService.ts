// src/services/sessionService.ts
import axios from "axios";
import { apiClient, AppError } from "./apiClient";
import type { ReissueResponseDto, SessionResponseDto } from "@/types/session";
import { useSessionStore } from "@/stores/sessionSlice";

export type CreateSessionErrorCode = "NICKNAME_DUPLICATE" | "UNKNOWN";

export class CreateSessionError extends Error {
  code: CreateSessionErrorCode;
  constructor(code: CreateSessionErrorCode, message?: string) {
    super(message ?? code);
    this.name = "CreateSessionError";
    this.code = code;
  }
}

export async function createSession(nickname: string): Promise<SessionResponseDto> {
  try {
    const res = await apiClient.post<SessionResponseDto>("/api/session", { nickname });
    // AT 저장
    useSessionStore.getState().setAccessToken(res.data.accessToken);
    useSessionStore.getState().setViewer({
      nickname: res.data.nickname,
    });
    return res.data;
  } catch (err) {
    if (err instanceof AppError) throw err;

    if (axios.isAxiosError(err)) {
      if (err.response?.status === 409 && err.response.data?.message === "NICKNAME_DUPLICATE") {
        throw new CreateSessionError("NICKNAME_DUPLICATE");
      }
    }

    throw new CreateSessionError("UNKNOWN");
  }
}

// 부트스트랩: 현재 세션 조회 (쿠키 기반이면 새로고침 후에도 복구 가능)
export async function getSession(): Promise<SessionResponseDto> {
  const res = await apiClient.get<SessionResponseDto>("/api/session");
  return res.data;
}

// ✅ 토큰 재발급: refreshToken 쿠키 기반
export async function reissue(): Promise<ReissueResponseDto> {
  const res = await apiClient.post<ReissueResponseDto>("/api/reissue");
  return res.data;
}

// (선택) 로그아웃 API가 있다면
export async function deleteSession(): Promise<void> {
  await apiClient.delete("/api/session");
}
