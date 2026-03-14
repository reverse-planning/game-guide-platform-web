// src/types/guideGuards.ts
import { GAMES, type GameName } from "@/constants/games";
import { ResponseShapeError } from "@/services/responseErrors";
import type {
  CreateGuideResponseDto,
  GuideDetailDto,
  GuideEditDetailDto,
  GuideListItemDto,
  GuideListResponseDto,
  UpdateGuideResponseDto,
} from "./guide";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function isGameName(value: unknown): value is GameName {
  return typeof value === "string" && GAMES.includes(value as GameName);
}

export function assertGuideListItem(value: unknown): asserts value is GuideListItemDto {
  if (
    typeof value !== "object" ||
    value === null ||
    !isNumber((value as Record<string, unknown>).id) ||
    !isNonEmptyString((value as Record<string, unknown>).title) ||
    !isNonEmptyString((value as Record<string, unknown>).excerpt) ||
    !isGameName((value as Record<string, unknown>).game) ||
    !isNonEmptyString((value as Record<string, unknown>).author) ||
    !isNonEmptyString((value as Record<string, unknown>).updatedAt) ||
    !isNumber((value as Record<string, unknown>).viewCount)
  ) {
    throw new ResponseShapeError("INVALID_GUIDE_LIST_ITEM");
  }
}

export function assertGuideListResponse(value: unknown): asserts value is GuideListResponseDto {
  if (
    typeof value !== "object" ||
    value === null ||
    !Array.isArray((value as Record<string, unknown>).content) ||
    !isBoolean((value as Record<string, unknown>).hasNext) ||
    !isNumber((value as Record<string, unknown>).currentPage)
  ) {
    throw new ResponseShapeError("INVALID_GUIDE_LIST_RESPONSE");
  }

  const content = (value as Record<string, unknown>).content as unknown[];
  content.forEach(assertGuideListItem);
}

export function assertGuideDetailResponse(value: unknown): asserts value is GuideDetailDto {
  if (
    typeof value !== "object" ||
    value === null ||
    !isNumber((value as Record<string, unknown>).id) ||
    !isNonEmptyString((value as Record<string, unknown>).title) ||
    !isNonEmptyString((value as Record<string, unknown>).body) ||
    !isGameName((value as Record<string, unknown>).game) ||
    !isNonEmptyString((value as Record<string, unknown>).author) ||
    !isNonEmptyString((value as Record<string, unknown>).updatedAt) ||
    !isNumber((value as Record<string, unknown>).viewCount)
  ) {
    throw new ResponseShapeError("INVALID_GUIDE_DETAIL_RESPONSE");
  }
}

export function assertGuideEditDetailResponse(value: unknown): asserts value is GuideEditDetailDto {
  if (
    typeof value !== "object" ||
    value === null ||
    !isNumber((value as Record<string, unknown>).id) ||
    !isNonEmptyString((value as Record<string, unknown>).title) ||
    !isNonEmptyString((value as Record<string, unknown>).body) ||
    !isGameName((value as Record<string, unknown>).game) ||
    !isNonEmptyString((value as Record<string, unknown>).author) ||
    !isNonEmptyString((value as Record<string, unknown>).updatedAt) ||
    !isNumber((value as Record<string, unknown>).viewCount)
  ) {
    throw new ResponseShapeError("INVALID_GUIDE_EDIT_DETAIL_RESPONSE");
  }
}

export function assertCreateGuideResponse(value: unknown): asserts value is CreateGuideResponseDto {
  if (!isNumber(value)) {
    throw new ResponseShapeError("INVALID_CREATE_GUIDE_RESPONSE");
  }
}

export function assertUpdateGuideResponse(value: unknown): asserts value is UpdateGuideResponseDto {
  if (!isNumber(value)) {
    throw new ResponseShapeError("INVALID_UPDATE_GUIDE_RESPONSE");
  }
}
