import type { GuideId, UserId } from "@/types/id";

/* =========================
 * Guide - DTO
 * ========================= */

export type GuideListItemDto = {
  id: GuideId;
  title: string;
  excerpt: string;
  game: string;
  author: string;
  updatedAt: string;
};

export type GuideListResponseDto = {
  content: GuideListItemDto[];
  hasNext: boolean;
  currentPage: number;
};

export type GuideDetailDto = {
  id: GuideId;
  title: string;
  body: string;
  game: string;
  author: string;
  updatedAt: string;
};

export type CreateGuideRequestDto = {
  title: string;
  body: string;
  game: string;
  userId: UserId;
};

export type CreateGuideResponseDto = GuideId;

export type UpdateGuideRequestDto = {
  title: string;
  body: string;
  game: string;
  userId: UserId;
};

// 스웨거 불명확 방어
export type UpdateGuideResponseDto = GuideDetailDto | GuideId;

export type DeleteGuideRequestDto = {
  userId: UserId;
};

export type DeleteGuideResponseDto = void;

/* =========================
 * Guide - Query
 * ========================= */

export type GuideListQuery = {
  query?: string;
  page: number;
  size?: number;
  sort?: string[];
};

/* =========================
 * UI Model
 * ========================= */

export type GuideListItem = GuideListItemDto;
export type GuideDetail = GuideDetailDto;

export type GuideListResult = {
  items: GuideListItem[];
  nextPage: number | null;
};

export function toGuideListResult(dto: GuideListResponseDto): GuideListResult {
  return {
    items: dto.content ?? [],
    nextPage: dto.hasNext ? dto.currentPage + 1 : null,
  };
}
