// src/services/guideUpdateService.ts
import axios from "axios";
import { apiClient, AppError } from "./apiClient";
import type { UpdateGuideRequestDto, UpdateGuideResponseDto } from "@/types/guide";
import type { GuideId } from "@/types/id";
import { SessionRequiredError } from "@/services/sessionResolver";

export type UpdateGuideErrorCode = "BAD_REQUEST" | "NOT_FOUND" | "UNKNOWN";

export class UpdateGuideError extends Error {
  code: UpdateGuideErrorCode;
  constructor(code: UpdateGuideErrorCode, message?: string) {
    super(message ?? code);
    this.name = "UpdateGuideError";
    this.code = code;
  }
}

export type UpdateGuideBody = Pick<UpdateGuideRequestDto, "title" | "game" | "body">;

export async function updateGuide(
  guideId: GuideId,
  body: UpdateGuideBody,
): Promise<UpdateGuideResponseDto> {
  try {
    const req: UpdateGuideRequestDto = {
      ...body,
    };

    const res = await apiClient.patch<UpdateGuideResponseDto>(`/api/guides/${guideId}`, req);
    return res.data;
  } catch (err) {
    // 요청 전 세션 누락은 "도메인 실패"가 아니라 "흐름 위반" → 그대로 올림
    if (err instanceof SessionRequiredError) throw err;
    // 전역(AppError)은 그대로
    if (err instanceof AppError) throw err;
    // 4xx 의미 해석
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 400) throw new UpdateGuideError("BAD_REQUEST");
      if (err.response?.status === 404) throw new UpdateGuideError("NOT_FOUND");
      // 그 외 4xx는 도메인에서 미정의 → UNKNOWN으로
      throw new UpdateGuideError("UNKNOWN");
    }

    throw new UpdateGuideError("UNKNOWN");
  }
}
