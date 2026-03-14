// src/services/guideUpdateService.ts
import axios from "axios";
import { apiClient, AppError } from "./apiClient";
import type { UpdateGuideRequestDto, UpdateGuideResponseDto } from "@/types/guide";
import type { GuideId } from "@/types/id";
import { AuthRequiredError } from "@/services/authErrors";
import { ResponseShapeError } from "./responseErrors";
import { assertUpdateGuideResponse } from "@/types/guideGuards";

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
    const req: UpdateGuideRequestDto = { ...body };

    const res = await apiClient.patch<unknown>(`/api/guides/${guideId}`, req);
    assertUpdateGuideResponse(res.data);

    return res.data;
  } catch (err) {
    if (err instanceof AppError) {
      if (err.code === "UNAUTHORIZED") throw new AuthRequiredError();
      throw err;
    }

    if (err instanceof ResponseShapeError) {
      throw err;
    }

    if (axios.isAxiosError(err)) {
      if (err.response?.status === 400) throw new UpdateGuideError("BAD_REQUEST");
      if (err.response?.status === 404) throw new UpdateGuideError("NOT_FOUND");
      // 그 외 4xx는 도메인에서 미정의 → UNKNOWN으로
      throw new UpdateGuideError("UNKNOWN");
    }

    throw new UpdateGuideError("UNKNOWN");
  }
}
