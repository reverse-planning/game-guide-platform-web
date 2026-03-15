// src/features/session/nicknameValidation.ts
import { UI_MESSAGE } from "@/constants/uiMessages";

export type NicknameValidationResult = { ok: true; value: string } | { ok: false; message: string };

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function validateNickname(value: unknown): NicknameValidationResult {
  const nickname = normalizeString(value);

  if (!nickname) {
    return {
      ok: false,
      message: UI_MESSAGE.REQUIRED_NICKNAME,
    };
  }

  return {
    ok: true,
    value: nickname,
  };
}
