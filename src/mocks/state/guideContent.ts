// src/mocks/state/guideContent.ts
const guideContent = new Map<number, string>();

export function getGuideContent(id: number) {
  return guideContent.get(id) ?? null;
}

export function setGuideContent(id: number, content: string) {
  guideContent.set(id, content);
}

export function deleteGuideContent(id: number) {
  guideContent.delete(id);
}
