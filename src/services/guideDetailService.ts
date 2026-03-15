// src/services/guideDetailService.ts
import { AppError, requestWithAuthRetry } from "./apiClient";
import axios from "axios";
import type { GuideDetailDto } from "@/types/guide";
import { AuthRequiredError } from "./authErrors";
import type { GuideId } from "@/types/id";
import { assertGuideDetailResponse } from "@/types/guideGuards";
import { ResponseShapeError } from "./responseErrors";

export type GuideDetailErrorCode = "NOT_FOUND" | "UNKNOWN";

export class GuideDetailError extends Error {
  code: GuideDetailErrorCode;
  constructor(code: GuideDetailErrorCode, message?: string) {
    super(message ?? code);
    this.name = "GuideDetailError";
    this.code = code;
  }
}

export async function getGuideDetail(guideId: GuideId): Promise<GuideDetailDto> {
  try {
    const res = await requestWithAuthRetry<unknown>({
      url: `/api/guides/${guideId}`,
      method: "get",
    });
    assertGuideDetailResponse(res.data);

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
      if (err.response?.status === 404) throw new GuideDetailError("NOT_FOUND");
      throw new GuideDetailError("UNKNOWN");
    }

    throw new GuideDetailError("UNKNOWN");
  }
}

export type GuideEditDetailErrorCode = "NOT_FOUND" | "FORBIDDEN" | "UNKNOWN";

export class GuideEditDetailError extends Error {
  code: GuideEditDetailErrorCode;

  constructor(code: GuideEditDetailErrorCode, message?: string) {
    super(message ?? code);
    this.name = "GuideEditDetailError";
    this.code = code;
  }
}

export async function getGuideEditDetail(guideId: GuideId): Promise<GuideDetailDto> {
  try {
    const res = await requestWithAuthRetry<unknown>({
      url: `/api/guides/${guideId}/edit`,
      method: "get",
    });
    assertGuideDetailResponse(res.data);

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
      if (err.response?.status === 404) throw new GuideEditDetailError("NOT_FOUND");
      if (err.response?.status === 403) throw new GuideEditDetailError("FORBIDDEN");
      throw new GuideEditDetailError("UNKNOWN");
    }

    throw new GuideEditDetailError("UNKNOWN");
  }
}
