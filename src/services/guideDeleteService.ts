// src/services/guideDeleteService.ts
import axios from "axios";
import { apiClient, AppError } from "./apiClient";
import { AuthRequiredError } from "./authErrors";

export type DeleteGuideErrorCode = "NOT_FOUND" | "FORBIDDEN" | "UNKNOWN";

export class DeleteGuideError extends Error {
  code: DeleteGuideErrorCode;
  constructor(code: DeleteGuideErrorCode, message?: string) {
    super(message ?? code);
    this.name = "DeleteGuideError";
    this.code = code;
  }
}

export async function deleteGuide(guideId: number): Promise<void> {
  try {
    await apiClient.delete(`/api/guides/${guideId}`);
  } catch (err) {
    if (err instanceof AppError) {
      if (err.code === "UNAUTHORIZED") throw new AuthRequiredError();
      // NETWORK, SERVER 등은 공통 에러 의미를 유지
      throw err;
    }

    // 4xx 의미 해석 (도메인)
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 404) throw new DeleteGuideError("NOT_FOUND");
      if (err.response?.status === 403) throw new DeleteGuideError("FORBIDDEN");
      throw new DeleteGuideError("UNKNOWN");
    }

    throw new DeleteGuideError("UNKNOWN");
  }
}
