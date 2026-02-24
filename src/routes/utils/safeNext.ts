// src/routes/utils/safeNext.ts
export function getSafeNext(next: string | null, fallback = "/guides"): string {
  if (!next) return fallback;

  if (!next.startsWith("/")) return fallback;
  if (next.startsWith("//")) return fallback;

  return next;
}
