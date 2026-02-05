// src/mocks/state/guideDb.ts
import BASE_GUIDES from "@/mocks/data/guides.json";
import type { GuideItem } from "@/services/guideListService";

// ✅ 불변 스냅샷(복사본 생성 X, 원본 유지)
const base = BASE_GUIDES as GuideItem[];

// ✅ 오버레이(가변)
let created: GuideItem[] = []; // 최신 글(런타임 생성, prepend)
const updated = new Map<number, GuideItem>(); // 런타임 수정
const deleted = new Set<number>(); // 런타임 삭제

function existsInBase(id: number) {
  return base.some((g) => g.id === id);
}

/**
 * created + (base - deleted) 를 합쳐서,
 * base 항목은 updated가 있으면 치환.
 */
export function listAllGuides(): GuideItem[] {
  const baseVisible = base.filter((g) => !deleted.has(g.id)).map((g) => updated.get(g.id) ?? g);

  return [...created, ...baseVisible];
}

export function findGuide(id: number): GuideItem | null {
  if (deleted.has(id)) return null;

  const fromCreated = created.find((g) => g.id === id);
  if (fromCreated) return fromCreated;

  return updated.get(id) ?? base.find((g) => g.id === id) ?? null;
}

export function createGuideItem(item: GuideItem): void {
  // created에만 prepend
  created = [item, ...created];
}

/**
 * @returns true = 수정 성공, false = 대상 없음(404 처리 용)
 */
export function updateGuideItem(id: number, item: GuideItem): boolean {
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
export function deleteGuideItem(id: number): boolean {
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

export function getNextId(): number {
  // json 정렬 가정 X: 전부 scan
  const maxBase = base.reduce((m, g) => Math.max(m, g.id), 0);
  const maxCreated = created.reduce((m, g) => Math.max(m, g.id), 0);
  const maxUpdated = Array.from(updated.keys()).reduce((m, id) => Math.max(m, id), 0);

  return Math.max(maxBase, maxCreated, maxUpdated) + 1;
}
