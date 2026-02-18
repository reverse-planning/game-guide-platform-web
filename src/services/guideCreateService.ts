// src/services/guideCreateService.ts
import axios from "axios";
import { apiClient, AppError } from "./apiClient";
import type { CreateGuideRequestDto, CreateGuideResponseDto } from "@/types/guide";
import { getSessionUserIdOrThrow, SessionRequiredError } from "@/services/sessionResolver";

export type CreateGuideErrorCode = "BAD_REQUEST" | "NETWORK" | "SERVER" | "UNKNOWN";

export class CreateGuideError extends Error {
  code: CreateGuideErrorCode;
  constructor(code: CreateGuideErrorCode, message?: string) {
    super(message ?? code);
    this.name = "CreateGuideError";
    this.code = code;
  }
}

export type CreateGuideBody = Pick<CreateGuideRequestDto, "title" | "game" | "body">;

export async function createGuide(body: CreateGuideBody): Promise<CreateGuideResponseDto> {
  try {
    const userId = getSessionUserIdOrThrow();

    const req: CreateGuideRequestDto = {
      ...body,
      userId,
    };

    const res = await apiClient.post<CreateGuideResponseDto>("/api/guides", req);
    return res.data;
  } catch (err) {
    // ✅ 요청 전 세션 누락은 "도메인 실패"가 아니라 "흐름 위반" → 그대로 올림
    if (err instanceof SessionRequiredError) throw err;

    // 공통 분류 에러(Network/Server)
    if (err instanceof AppError) {
      if (err.code === "NETWORK") throw new CreateGuideError("NETWORK");
      if (err.code === "SERVER") throw new CreateGuideError("SERVER");
      // UNAUTHORIZED는 인터셉터가 이동 처리하므로 여기로 잘 안 옴
      throw new CreateGuideError("UNKNOWN");
    }

    // 도메인 4xx
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 400) throw new CreateGuideError("BAD_REQUEST");
    }
    throw new CreateGuideError("UNKNOWN");
  }
}
