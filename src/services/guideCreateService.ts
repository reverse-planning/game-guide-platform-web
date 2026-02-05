// src/services/guideCreateService.ts
import axios, { AxiosError } from "axios";
import type { GuideItem } from "./guideListService";

export type CreateGuideBody = {
  title: string;
  game: string;
  excerpt: string;
  content: string;
  author: string;
};

export type CreateGuideResponse = GuideItem & { content: string };

export type CreateGuideErrorCode = "BAD_REQUEST" | "UNAUTHORIZED" | "UNKNOWN";
export class CreateGuideError extends Error {
  code: CreateGuideErrorCode;

  constructor(code: CreateGuideErrorCode, message?: string) {
    super(message ?? code);
    this.name = "CreateGuideError";
    this.code = code;
  }
}

export async function createGuide(body: CreateGuideBody): Promise<CreateGuideResponse> {
  try {
    const res = await axios.post<CreateGuideResponse>("/api/guides", body);
    return res.data;
  } catch (err) {
    if (err instanceof AxiosError && err.response) {
      if (err.response.status === 400) throw new CreateGuideError("BAD_REQUEST");
      if (err.response.status === 401) throw new CreateGuideError("UNAUTHORIZED");
    }
    throw new CreateGuideError("UNKNOWN");
  }
}
