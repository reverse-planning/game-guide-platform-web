// src/validations/session.ts
import { normalizeText, isNonEmpty } from "./text";

export function validateCreateSession(nicknameInput: string) {
  const nickname = normalizeText(nicknameInput);
  if (!isNonEmpty(nickname)) {
    return { ok: false as const, message: "닉네임을 입력하세요." };
  }
  return { ok: true as const, value: { nickname } };
}
