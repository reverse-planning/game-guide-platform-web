// src/mocks/handlers/guideDetailHandlers.ts
import { http, HttpResponse } from "msw";
import { getMockSession } from "../state/mockSession";
import { getGuideContent, setGuideContent } from "../state/guideContent";
import { findGuide } from "../state/guideDb";

function defaultContent(found: { title: string; game: string; author: string; excerpt: string }) {
  return (
    `# ${found.title}\n\n` +
    `- 게임: ${found.game}\n- 작성자: ${found.author}\n\n` +
    `## 핵심 요약\n${found.excerpt}\n\n` +
    `## 상세 공략\n여기에 상세 공략 내용을 넣는다고 가정합니다.\n(현재는 MSW mock)\n`
  );
}

export const guideDetailHandlers = [
  http.get("/api/guides/:id", ({ params }) => {
    const session = getMockSession();
    if (!session) {
      return HttpResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
    }

    const id = Number(params.id);
    const guide = findGuide(id);
    if (!guide) {
      return HttpResponse.json({ message: "NOT_FOUND" }, { status: 404 });
    }

    // content는 서버 메모리에서 관리
    let content = getGuideContent(id);
    if (!content) {
      content = defaultContent(guide);
      setGuideContent(id, content);
    }

    return HttpResponse.json({ ...guide, content }, { status: 200 });
  }),
];
