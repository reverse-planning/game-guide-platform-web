// src/services/guideUpdateService.ts
import axios from "axios";
import type { GuideItem } from "./guideListService";
import { apiClient, AppError } from "./apiClient";

export type UpdateGuideErrorCode = "BAD_REQUEST" | "NOT_FOUND" | "NETWORK" | "SERVER" | "UNKNOWN";

export class UpdateGuideError extends Error {
  code: UpdateGuideErrorCode;
  constructor(code: UpdateGuideErrorCode, message?: string) {
    super(message ?? code);
    this.name = "UpdateGuideError";
    this.code = code;
  }
}

export type UpdateGuideBody = {
  title: string;
  game: string;
  excerpt: string;
  content: string;
};

export type UpdateGuideResponse = GuideItem & {
  content: string;
};

export async function updateGuide(
  guideId: number,
  body: UpdateGuideBody,
): Promise<UpdateGuideResponse> {
  try {
    const res = await apiClient.patch<UpdateGuideResponse>(`/api/guides/${guideId}`, body);
    return res.data;
  } catch (err) {
    if (err instanceof AppError) {
      if (err.code === "NETWORK") throw new UpdateGuideError("NETWORK");
      if (err.code === "SERVER") throw new UpdateGuideError("SERVER");
      throw new UpdateGuideError("UNKNOWN");
    }

    if (axios.isAxiosError(err)) {
      if (err.response?.status === 400) throw new UpdateGuideError("BAD_REQUEST");
      if (err.response?.status === 404) throw new UpdateGuideError("NOT_FOUND");
    }
    throw new UpdateGuideError("UNKNOWN");
  }
}
