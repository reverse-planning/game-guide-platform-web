// src/services/guideCreateService.ts
import axios from "axios";
import type { GuideItem } from "./guideListService";
import { apiClient, AppError } from "./apiClient";

export type CreateGuideErrorCode = "BAD_REQUEST" | "NETWORK" | "SERVER" | "UNKNOWN";

export class CreateGuideError extends Error {
  code: CreateGuideErrorCode;
  constructor(code: CreateGuideErrorCode, message?: string) {
    super(message ?? code);
    this.name = "CreateGuideError";
    this.code = code;
  }
}

export type CreateGuideBody = {
  title: string;
  game: string;
  excerpt: string;
  content: string;
};

export type CreateGuideResponse = GuideItem & {
  content: string;
};

export async function createGuide(body: CreateGuideBody): Promise<CreateGuideResponse> {
  try {
    const res = await apiClient.post<CreateGuideResponse>("/api/guides", body);
    return res.data;
  } catch (err) {
    // 공통 분류 에러(Network/Server)
    if (err instanceof AppError) {
      if (err.code === "NETWORK") throw new CreateGuideError("NETWORK");
      if (err.code === "SERVER") throw new CreateGuideError("SERVER");
      throw new CreateGuideError("UNKNOWN");
    }

    // 도메인 4xx
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 400) throw new CreateGuideError("BAD_REQUEST");
    }
    throw new CreateGuideError("UNKNOWN");
  }
}
