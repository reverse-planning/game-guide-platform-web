// src/routes/utils/buildLoginUrl.ts
export function buildLoginUrl(requestUrl: string): string {
  const url = new URL(requestUrl);
  const next = url.pathname + url.search;

  return `/?next=${encodeURIComponent(next)}`;
}
