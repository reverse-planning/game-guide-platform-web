// src/types/appMessage.ts
import type { AppMessageSource, AppMessageType } from "@/constants/appMessage";

export type AppMessage = {
  type: AppMessageType;
  source: AppMessageSource;
  code?: string;
  message: string;
};
