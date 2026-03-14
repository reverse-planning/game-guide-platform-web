// src/types/sessionGuards.ts
import { ResponseShapeError } from "@/services/responseErrors";
import type { CreateSessionResponseDto, GetSessionResponseDto } from "./session";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string";
}

export function assertCreateSessionResponse(
  value: unknown,
): asserts value is CreateSessionResponseDto {
  if (
    typeof value !== "object" ||
    value === null ||
    !isNonEmptyString((value as Record<string, unknown>).nickname) ||
    !isNonEmptyString((value as Record<string, unknown>).accessToken)
  ) {
    throw new ResponseShapeError("INVALID_CREATE_SESSION_RESPONSE");
  }
}

export function assertGetSessionResponse(value: unknown): asserts value is GetSessionResponseDto {
  if (
    typeof value !== "object" ||
    value === null ||
    !isNonEmptyString((value as Record<string, unknown>).nickname)
  ) {
    throw new ResponseShapeError("INVALID_GET_SESSION_RESPONSE");
  }
}
