// src/routes/utils/parseGuideId.ts
import type { GuideId } from "@/types/id";

export function parseGuideId(value: string | undefined): GuideId | null {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id as GuideId;
}
