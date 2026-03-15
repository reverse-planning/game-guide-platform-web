// src/services/guideCreateService.ts
import axios from "axios";
import { AppError, requestWithAuthRetry } from "./apiClient";
import type { CreateGuideRequestDto, CreateGuideResponseDto } from "@/types/guide";
import { AuthRequiredError } from "@/services/authErrors";
import { ResponseShapeError } from "./responseErrors";
import { assertCreateGuideResponse } from "@/types/guideGuards";

export type CreateGuideErrorCode = "BAD_REQUEST" | "UNKNOWN";

export class CreateGuideError extends Error {
  code: CreateGuideErrorCode;
  constructor(code: CreateGuideErrorCode, message?: string) {
    super(message ?? code);
    this.name = "CreateGuideError";
    this.code = code;
  }
}

export async function createGuide(body: CreateGuideRequestDto): Promise<CreateGuideResponseDto> {
  try {
    const res = await requestWithAuthRetry<unknown>({
      url: "/api/guides",
      method: "post",
      data: body,
    });
    assertCreateGuideResponse(res.data);

    return res.data;
  } catch (err) {
    if (err instanceof AppError) {
      if (err.code === "UNAUTHORIZED") throw new AuthRequiredError();
      throw err;
    }

    if (err instanceof ResponseShapeError) {
      throw err;
    }

    // 도메인 4xx
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 400) throw new CreateGuideError("BAD_REQUEST");
      throw new CreateGuideError("UNKNOWN");
    }

    throw new CreateGuideError("UNKNOWN");
  }
}
