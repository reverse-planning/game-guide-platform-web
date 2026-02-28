// src/mocks/state/guideDb.ts
import BASE_GUIDES from "@/mocks/data/guides.json";
import type { GuideDetailDto, GuideListItemDto } from "@/types/guide";
import type { GuideId } from "@/types/id";

/**
 * ✅ 불변 스냅샷 (원본 유지)
 * - scripts가 GuideDetailDto 스펙(id/title/body/game/author/updatedAt)으로 생성한다고 가정
 */
const base = BASE_GUIDES as readonly GuideDetailDto[];

// ✅ 오버레이(가변)
let created: GuideDetailDto[] = []; // 최신 글 prepend
const updated = new Map<GuideId, GuideDetailDto>(); // 런타임 수정
const deleted = new Set<GuideId>(); // 런타임 삭제

function existsInBase(id: GuideId): boolean {
  return base.some((g) => g.id === id);
}

function deriveExcerpt(body: string, max = 80): string {
  const oneLine = body.replace(/\s+/g, " ").trim();
  if (!oneLine) return "";
  return oneLine.length > max ? `${oneLine.slice(0, max)}…` : oneLine;
}

function toListItem(detail: GuideDetailDto): GuideListItemDto {
  return {
    id: detail.id,
    title: detail.title,
    excerpt: deriveExcerpt(detail.body),
    game: detail.game,
    author: detail.author,
    updatedAt: detail.updatedAt,
    viewCount: 0,
  };
}

/**
 * created + (base - deleted) 를 합쳐서,
 * base 항목은 updated가 있으면 치환.
 */
export function listAllGuides(): GuideListItemDto[] {
  const createdVisible = created.map(toListItem);

  const baseVisible = base
    .filter((g) => !deleted.has(g.id))
    .map((g) => toListItem(updated.get(g.id) ?? g));

  return [...createdVisible, ...baseVisible];
}

export function findGuide(id: GuideId): GuideDetailDto | null {
  if (deleted.has(id)) return null;

  const fromCreated = created.find((g) => g.id === id);
  if (fromCreated) return fromCreated;

  return updated.get(id) ?? base.find((g) => g.id === id) ?? null;
}

export function createGuideItem(item: GuideDetailDto): void {
  created = [item, ...created];
}

/**
 * @returns true = 수정 성공, false = 대상 없음(404 처리 용)
 */
export function updateGuideItem(id: GuideId, item: GuideDetailDto): boolean {
  if (deleted.has(id)) return false;

  // created에 있으면 created 갱신
  const idx = created.findIndex((g) => g.id === id);
  if (idx >= 0) {
    const next = created.slice();
    next[idx] = item;
    created = next;
    return true;
  }

  // base에도 없으면 수정 대상 없음
  if (!existsInBase(id)) return false;

  updated.set(id, item);
  return true;
}

/**
 * @returns true = 삭제 성공, false = 대상 없음(404 처리 용)
 */
export function deleteGuideItem(id: GuideId): boolean {
  // created에 있으면 created에서 제거
  const idx = created.findIndex((g) => g.id === id);
  if (idx >= 0) {
    const next = created.slice();
    next.splice(idx, 1);
    created = next;
    return true;
  }

  // base에도 없으면 삭제 대상 없음
  if (!existsInBase(id)) return false;

  deleted.add(id);
  updated.delete(id);
  return true;
}

export function getNextId(): GuideId {
  // json 정렬 가정 X: 전부 scan
  const maxBase = base.reduce((m, g) => Math.max(m, Number(g.id)), 0);
  const maxCreated = created.reduce((m, g) => Math.max(m, Number(g.id)), 0);
  const maxUpdated = Array.from(updated.keys()).reduce((m, id) => Math.max(m, Number(id)), 0);

  return (Math.max(maxBase, maxCreated, maxUpdated) + 1) as GuideId;
}

/** (옵션) 테스트/리셋 */
export function resetGuideDb(): void {
  created = [];
  updated.clear();
  deleted.clear();
}
