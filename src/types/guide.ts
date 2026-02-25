import type { GameName } from "@/constants/games";
import type { GuideId, UserId } from "@/types/id";

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
  views?: number;
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
  views?: number;
};

export type CreateGuideRequestDto = {
  title: string;
  body: string;
  game: GameName;
  userId: UserId;
};

export type CreateGuideResponseDto = GuideId;

export type UpdateGuideRequestDto = {
  title: string;
  body: string;
  game: GameName;
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

// 서버 스펙: sort: ["id","desc"] 형태
export type GuideListSort = "id,desc" | "id,asc" | "views,desc" | "views,asc";

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
