// src/services/guideDeleteService.ts
import axios from "axios";
import { apiClient, AppError } from "./apiClient";
import { SessionRequiredError } from "./sessionResolver";

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
    // ✅ rethrow: 세션 누락은 서비스 도메인 에러로 매핑하지 않는다.
    if (err instanceof SessionRequiredError) throw err;
    // 전역(AppError) 처리 대상은 그대로 올림
    if (err instanceof AppError) throw err;
    // 4xx 의미 해석 (도메인)
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 404) throw new DeleteGuideError("NOT_FOUND");
      if (err.response?.status === 403) throw new DeleteGuideError("FORBIDDEN");
    }

    throw new DeleteGuideError("UNKNOWN");
  }
}
