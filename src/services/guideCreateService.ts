// src/services/guideCreateService.ts
import axios from "axios";
import { apiClient, AppError } from "./apiClient";
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

export type CreateGuideBody = Pick<CreateGuideRequestDto, "title" | "game" | "body">;

export async function createGuide(body: CreateGuideBody): Promise<CreateGuideResponseDto> {
  try {
    const req: CreateGuideRequestDto = { ...body };

    const res = await apiClient.post<unknown>("/api/guides", req);
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
