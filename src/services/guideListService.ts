import axios from "axios";
import { apiClient, AppError } from "./apiClient";
import {
  toGuideListResult,
  type GuideListQuery,
  type GuideListResponseDto,
  type GuideListResult,
} from "@/types/guide";

export type ListGuidesErrorCode = "RATE_LIMITED" | "NETWORK" | "SERVER" | "UNKNOWN";

export class ListGuidesError extends Error {
  code: ListGuidesErrorCode;
  constructor(code: ListGuidesErrorCode, message?: string) {
    super(message ?? code);
    this.name = "ListGuidesError";
    this.code = code;
  }
}

export async function listGuides(params: GuideListQuery): Promise<GuideListResult> {
  try {
    const res = await apiClient.get<GuideListResponseDto>("/api/guide", {
      params: {
        ...(params.query ? { query: params.query } : {}),
        page: params.page,
        size: params.size,
        sort: params.sort,
      },
    });
    return toGuideListResult(res.data);
  } catch (err) {
    if (err instanceof AppError) {
      if (err.code === "NETWORK") throw new ListGuidesError("NETWORK");
      if (err.code === "SERVER") throw new ListGuidesError("SERVER");
      throw new ListGuidesError("UNKNOWN");
    }

    if (axios.isAxiosError(err)) {
      if (err.response?.status === 429) throw new ListGuidesError("RATE_LIMITED");
    }

    throw new ListGuidesError("UNKNOWN");
  }
}
