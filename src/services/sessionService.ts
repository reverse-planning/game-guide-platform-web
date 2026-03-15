// src/services/sessionService.ts
import axios from "axios";
import { apiClient, AppError, requestWithAuthRetry } from "./apiClient";
import type { CreateSessionResponseDto, GetSessionResponseDto } from "@/types/session";
import { useSessionStore } from "@/stores/sessionSlice";
import { clearAccessToken, setAccessToken } from "./tokenStorage";
import { AuthRequiredError } from "./authErrors";
import { ResponseShapeError } from "./responseErrors";
import { assertCreateSessionResponse, assertGetSessionResponse } from "@/types/sessionGuards";

export type CreateSessionErrorCode = "NICKNAME_DUPLICATE" | "UNKNOWN";

export class CreateSessionError extends Error {
  code: CreateSessionErrorCode;
  constructor(code: CreateSessionErrorCode, message?: string) {
    super(message ?? code);
    this.name = "CreateSessionError";
    this.code = code;
  }
}

export async function createSession(nickname: string): Promise<CreateSessionResponseDto> {
  try {
    const res = await apiClient.post<unknown>("/api/session", { nickname });
    assertCreateSessionResponse(res.data);

    // AT 저장
    setAccessToken(res.data.accessToken);
    useSessionStore.getState().setViewer({ nickname: res.data.nickname });

    return res.data;
  } catch (err) {
    if (err instanceof AppError) throw err;

    if (err instanceof ResponseShapeError) {
      throw err;
    }

    if (axios.isAxiosError(err)) {
      if (err.response?.status === 409 && err.response.data?.message === "NICKNAME_DUPLICATE")
        throw new CreateSessionError("NICKNAME_DUPLICATE");
      throw new CreateSessionError("UNKNOWN");
    }

    throw new CreateSessionError("UNKNOWN");
  }
}

export async function getSession(): Promise<GetSessionResponseDto> {
  try {
    const res = await requestWithAuthRetry<unknown>({
      url: "/api/session",
      method: "get",
    });
    assertGetSessionResponse(res.data);

    useSessionStore.getState().setViewer({ nickname: res.data.nickname });
    return res.data;
  } catch (err) {
    if (err instanceof AppError && err.code === "UNAUTHORIZED") {
      throw new AuthRequiredError();
    }

    if (err instanceof ResponseShapeError) {
      throw err;
    }

    throw err;
  }
}

export async function deleteSession(): Promise<void> {
  try {
    await apiClient.post("/api/logout");
    clearAccessToken();
    useSessionStore.getState().resetSessionCache();
  } catch (err) {
    if (err instanceof AppError && err.code === "UNAUTHORIZED") {
      throw new AuthRequiredError();
    }

    throw err;
  }
}
