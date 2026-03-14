// src/constants/appMessage.ts
export const APP_MESSAGE_TYPE = {
  ERROR: "error",
  SUCCESS: "success",
  INFO: "info",
} as const;
export type AppMessageType = (typeof APP_MESSAGE_TYPE)[keyof typeof APP_MESSAGE_TYPE];

export const APP_MESSAGE_SOURCE = {
  API: "api",
  UI: "ui",
  ROUTE: "route",
  AUTH: "auth",
} as const;
export type AppMessageSource = (typeof APP_MESSAGE_SOURCE)[keyof typeof APP_MESSAGE_SOURCE];
