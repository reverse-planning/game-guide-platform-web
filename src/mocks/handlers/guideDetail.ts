// src/mocks/handlers/guideDetailHandlers.ts
import { http, HttpResponse } from "msw";
import { GUIDE_DB } from "../data/guides";

export const guideDetailHandlers = [
  http.get("/api/guides/:id", ({ params }) => {
    const id = Number(params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return HttpResponse.json({ message: "BAD_REQUEST" }, { status: 400 });
    }

    const found = GUIDE_DB.find((x) => x.id === id);
    if (!found) {
      return HttpResponse.json({ message: "NOT_FOUND" }, { status: 404 });
    }

    return HttpResponse.json(
      {
        ...found,
        content:
          `# ${found.title}\n\n` +
          `- 게임: ${found.game}\n- 작성자: ${found.author}\n\n` +
          `## 핵심 요약\n${found.excerpt}\n\n` +
          `## 상세 공략\n여기에 상세 공략 내용을 넣는다고 가정합니다.\n(현재는 MSW mock)\n`,
      },
      { status: 200 },
    );
  }),
];
