// src/services/guideDetailService.ts
import type { GuideItem } from "./guideListService";
import { apiClient, AppError } from "./apiClient";
import axios from "axios";

export type GuideDetailErrorCode = "NOT_FOUND" | "NETWORK" | "SERVER" | "UNKNOWN";

export class GuideDetailError extends Error {
  code: GuideDetailErrorCode;
  constructor(code: GuideDetailErrorCode, message?: string) {
    super(message ?? code);
    this.name = "GuideDetailError";
    this.code = code;
  }
}

export type GuideDetail = GuideItem & {
  content: string;
};

export async function getGuideDetail(guideId: number): Promise<GuideDetail> {
  try {
    const res = await apiClient.get<GuideDetail>(`/api/guides/${guideId}`);
    return res.data;
  } catch (err) {
    if (err instanceof AppError) {
      if (err.code === "NETWORK") throw new GuideDetailError("NETWORK");
      if (err.code === "SERVER") throw new GuideDetailError("SERVER");
      throw new GuideDetailError("UNKNOWN");
    }

    if (axios.isAxiosError(err)) {
      if (err.response?.status === 404) throw new GuideDetailError("NOT_FOUND");
    }

    throw new GuideDetailError("UNKNOWN");
  }
}
