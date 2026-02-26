// src/validations/guide.ts
import { normalizeText, isNonEmpty } from "./text";
import { UI_MESSAGE } from "@/constants/uiMessages";
import type { FormState } from "@/pages/GuideEdit";

export function validateCreateGuideDraft(draft: FormState) {
  const value = {
    title: normalizeText(draft.title),
    game: normalizeText(draft.game),
    body: normalizeText(draft.body),
  };

  if (!isNonEmpty(value.title) || !isNonEmpty(value.game) || !isNonEmpty(value.body)) {
    return { ok: false as const, message: UI_MESSAGE.REQUIRED_FIELDS };
  }

  return { ok: true as const, value };
}
