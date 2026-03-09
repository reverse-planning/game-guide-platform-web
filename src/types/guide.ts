// src/types/guide.ts
import type { GameName } from "@/constants/games";
import type { GuideId } from "@/types/id";

/* =========================
 * Guide - DTO
 * ========================= */

export type GuideListItemDto = {
  id: GuideId;
  title: string;
  excerpt: string;
  game: GameName;
  author: string;
  updatedAt: string;
  viewCount: number;
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
  game: GameName;
  author: string;
  updatedAt: string;
  viewCount: number;
};
export type GuideEditDetailDto = GuideDetailDto;

export type CreateGuideRequestDto = {
  title: string;
  body: string;
  game: GameName;
};
export type CreateGuideResponseDto = GuideId;

export type UpdateGuideRequestDto = {
  title: string;
  body: string;
  game: GameName;
};
export type UpdateGuideResponseDto = GuideId;

export type DeleteGuideRequestDto = void;
export type DeleteGuideResponseDto = void;

/* =========================
 * Guide - Query
 * ========================= */

// 서버 스펙: sort: ["updatedAt","desc"] 형태
export type GuideListSort = "updatedAt,desc" | "updatedAt,asc" | "viewCount,desc" | "viewCount,asc";

export type GuideListQuery = {
  query?: string;
  page: number;
  size: number;
  sort: GuideListSort;
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
