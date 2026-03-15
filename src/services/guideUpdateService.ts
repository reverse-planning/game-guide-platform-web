// src/services/guideUpdateService.ts
import axios from "axios";
import { AppError, requestWithAuthRetry } from "./apiClient";
import type { UpdateGuideRequestDto } from "@/types/guide";
import type { GuideId } from "@/types/id";
import { AuthRequiredError } from "@/services/authErrors";

export type UpdateGuideErrorCode = "BAD_REQUEST" | "NOT_FOUND" | "UNKNOWN";

export class UpdateGuideError extends Error {
  code: UpdateGuideErrorCode;
  constructor(code: UpdateGuideErrorCode, message?: string) {
    super(message ?? code);
    this.name = "UpdateGuideError";
    this.code = code;
  }
}

export async function updateGuide(guideId: GuideId, body: UpdateGuideRequestDto): Promise<void> {
  try {
    await requestWithAuthRetry<void>({
      url: `/api/guides/${guideId}`,
      method: "patch",
      data: body,
    });
  } catch (err) {
    if (err instanceof AppError) {
      if (err.code === "UNAUTHORIZED") throw new AuthRequiredError();
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
