// src/services/guideDeleteService.ts
import axios from "axios";
import { apiClient, AppError } from "./apiClient";

export type DeleteGuideErrorCode = "NOT_FOUND" | "NETWORK" | "SERVER" | "UNKNOWN";

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
      if (err.code === "NETWORK") throw new DeleteGuideError("NETWORK");
      if (err.code === "SERVER") throw new DeleteGuideError("SERVER");
      throw new DeleteGuideError("UNKNOWN");
    }

    if (axios.isAxiosError(err)) {
      if (err.response?.status === 404) throw new DeleteGuideError("NOT_FOUND");
    }
    throw new DeleteGuideError("UNKNOWN");
  }
}
