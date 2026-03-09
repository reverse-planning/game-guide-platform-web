// src/services/guideDetailService.ts
import { apiClient, AppError } from "./apiClient";
import axios from "axios";
import type { GuideDetailDto } from "@/types/guide";
import { AuthRequiredError } from "./authErrors";

export type GuideDetailErrorCode = "NOT_FOUND" | "UNKNOWN";

export class GuideDetailError extends Error {
  code: GuideDetailErrorCode;
  constructor(code: GuideDetailErrorCode, message?: string) {
    super(message ?? code);
    this.name = "GuideDetailError";
    this.code = code;
  }
}

export async function getGuideDetail(guideId: number): Promise<GuideDetailDto> {
  try {
    const res = await apiClient.get<GuideDetailDto>(`/api/guides/${guideId}`);
    return res.data;
  } catch (err) {
    if (err instanceof AppError) {
      if (err.code === "UNAUTHORIZED") throw new AuthRequiredError();
      throw err;
    }

    if (axios.isAxiosError(err)) {
      if (err.response?.status === 404) throw new GuideDetailError("NOT_FOUND");
      throw new GuideDetailError("UNKNOWN");
    }

    throw new GuideDetailError("UNKNOWN");
  }
}
