import axios from "axios";
import { AppError, requestWithAuthRetry } from "./apiClient";
import {
  toGuideListResult,
  type GuideListQuery,
  type GuideListResponseDto,
  type GuideListResult,
} from "@/types/guide";
import { AuthRequiredError } from "./authErrors";
import { ResponseShapeError } from "./responseErrors";

export type ListGuidesErrorCode = "RATE_LIMITED" | "UNKNOWN";

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
    const res = await requestWithAuthRetry<GuideListResponseDto>({
      url: "/api/guides",
      method: "get",
      params: {
        ...(params.query ? { query: params.query } : {}),
        page: params.page,
        size: params.size,
        sort: params.sort,
      },
    });
    //assertGuideListResponse(res.data);
    console.log("[listGuides] response object", res);
    console.log("[listGuides] status", res.status);
    console.log("[listGuides] headers", res.headers);
    console.log("[listGuides] data", res.data);

    if (
      typeof res !== "object" ||
      res === null ||
      !("data" in res) ||
      typeof res.data !== "object" ||
      res.data === null ||
      !("content" in res.data) ||
      !("hasNext" in res.data) ||
      !("currentPage" in res.data)
    ) {
      throw new ResponseShapeError("INVALID_GUIDE_LIST_RESPONSE");
    }

    return toGuideListResult(res.data);
  } catch (err) {
    console.error("[listGuides] raw catch", err);
    console.log("[listGuides] isAxiosError", axios.isAxiosError(err));
    if (err instanceof AppError) {
      if (err.code === "UNAUTHORIZED") throw new AuthRequiredError();
      throw err;
    }

    if (err instanceof ResponseShapeError) {
      throw err;
    }

    if (axios.isAxiosError(err)) {
      if (err.response?.status === 429) throw new ListGuidesError("RATE_LIMITED");
      console.log("4xx");
      throw new ListGuidesError("UNKNOWN");
    }

    throw new ListGuidesError("UNKNOWN");
  }
}
