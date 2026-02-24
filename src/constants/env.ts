// src/constants/env.ts
export type ApiMode = "mock" | "real";
export type SentryEnv = "production" | "preview" | "development";

export const ENV = {
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,

  API_ORIGIN: import.meta.env.VITE_API_ORIGIN,
  // MSW 제어
  API_MODE: (import.meta.env.VITE_API_MODE as ApiMode | undefined) ?? "real",

  // Sentry 라벨
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN as string | undefined,
  SENTRY_ENV:
    (import.meta.env.VITE_SENTRY_ENV as SentryEnv | undefined) ??
    (import.meta.env.PROD ? "production" : "development"),
};
