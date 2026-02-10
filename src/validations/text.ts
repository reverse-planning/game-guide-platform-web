// src/validations/text.ts
export function normalizeText(v: unknown) {
  return String(v ?? "").trim();
}

export function isNonEmpty(v: string) {
  return v.length > 0;
}
