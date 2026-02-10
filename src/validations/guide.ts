// src/validations/guide.ts
import { normalizeText, isNonEmpty } from "./text";

export type CreateGuideDraft = {
  title: string;
  game: string;
  excerpt: string;
  content: string;
};

export function validateCreateGuideDraft(draft: CreateGuideDraft) {
  const value = {
    title: normalizeText(draft.title),
    game: normalizeText(draft.game),
    excerpt: normalizeText(draft.excerpt),
    content: normalizeText(draft.content),
  };

  if (
    !isNonEmpty(value.title) ||
    !isNonEmpty(value.game) ||
    !isNonEmpty(value.excerpt) ||
    !isNonEmpty(value.content)
  ) {
    return { ok: false as const, message: "모든 입력값은 필수입니다." };
  }

  return { ok: true as const, value };
}
