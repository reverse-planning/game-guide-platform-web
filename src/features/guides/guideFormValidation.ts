// src/features/guides/guideFormValidation.ts
import { GAMES, type GameName } from "@/constants/games";
import { UI_VALIDATION_MESSAGE } from "@/constants/uiMessages";
import type { GuideFormValue } from "@/types/guide";

export type GuideFormInput = {
  title: unknown;
  game: unknown;
  body: unknown;
};

export type GuideFormValidationResult =
  | { ok: true; value: GuideFormValue }
  | { ok: false; message: string; field?: keyof GuideFormValue };

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isGameName(value: string): value is GameName {
  return GAMES.includes(value as GameName);
}

export function validateGuideForm(input: GuideFormInput): GuideFormValidationResult {
  const title = normalizeString(input.title);
  const game = normalizeString(input.game);
  const body = normalizeString(input.body);

  if (!title) {
    return {
      ok: false,
      message: UI_VALIDATION_MESSAGE.REQUIRED_FIELDS,
      field: "title",
    };
  }

  if (!game) {
    return {
      ok: false,
      message: UI_VALIDATION_MESSAGE.REQUIRED_FIELDS,
      field: "game",
    };
  }

  if (!body) {
    return {
      ok: false,
      message: UI_VALIDATION_MESSAGE.REQUIRED_FIELDS,
      field: "body",
    };
  }

  if (!isGameName(game)) {
    return {
      ok: false,
      message: UI_VALIDATION_MESSAGE.INVALID_GAME,
      field: "game",
    };
  }

  return {
    ok: true,
    value: {
      title,
      game,
      body,
    },
  };
}
