// src/services/guideDeleteService.ts
import axios from "axios";
import { apiClient, AppError } from "./apiClient";
import { getSessionUserIdOrThrow, SessionRequiredError } from "./sessionResolver";
import type { DeleteGuideRequestDto } from "@/types/guide";

export type DeleteGuideErrorCode = "NOT_FOUND" | "FORBIDDEN" | "NETWORK" | "SERVER" | "UNKNOWN";

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
    const userId = getSessionUserIdOrThrow();

    const req: DeleteGuideRequestDto = { userId };

    await apiClient.delete(`/api/guides/${guideId}`, { data: req });
  } catch (err) {
    // ✅ rethrow: 세션 누락은 서비스 도메인 에러로 매핑하지 않는다.
    if (err instanceof SessionRequiredError) throw err;

    if (err instanceof AppError) {
      if (err.code === "NETWORK") throw new DeleteGuideError("NETWORK");
      if (err.code === "SERVER") throw new DeleteGuideError("SERVER");
      throw new DeleteGuideError("UNKNOWN");
    }

    if (axios.isAxiosError(err)) {
      if (err.response?.status === 404) throw new DeleteGuideError("NOT_FOUND");
      if (err.response?.status === 403) throw new DeleteGuideError("FORBIDDEN");
    }
    throw new DeleteGuideError("UNKNOWN");
  }
}
