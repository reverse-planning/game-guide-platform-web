import axios from "axios";
import { apiClient, AppError } from "./apiClient";

export type ListGuidesErrorCode = "RATE_LIMITED" | "NETWORK" | "SERVER" | "UNKNOWN";

export class ListGuidesError extends Error {
  code: ListGuidesErrorCode;
  constructor(code: ListGuidesErrorCode, message?: string) {
    super(message ?? code);
    this.name = "ListGuidesError";
    this.code = code;
  }
}

export type GuideItem = {
  id: number;
  title: string;
  excerpt: string;
  game: string;
  author: string;
  updatedAt: string;
};

export type ListGuidesResponse = {
  items: GuideItem[];
  nextPage: number | null;
};

export async function listGuides(params: { q: string; page: number }): Promise<ListGuidesResponse> {
  try {
    const res = await apiClient.get<ListGuidesResponse>("/api/guides", {
      params: { q: params.q, page: params.page },
    });
    return res.data;
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
