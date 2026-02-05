// src/mocks/handlers/guideCreate.ts
import { http, HttpResponse } from "msw";
import { getMockSession } from "../state/mockSession";
import { setGuideContent } from "../state/guideContent";
import { createGuideItem, getNextId } from "../state/guideDb";

type createGuideBody = {
  title: string;
  game: string;
  excerpt: string;
  content: string;
};

export const guideCreateHandlers = [
  http.post("/api/guides", async ({ request }) => {
    const session = getMockSession();
    if (!session) {
      return HttpResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
    }

    const { title, game, excerpt, content } = (await request.json()) as createGuideBody;
    if (!title || !game || !excerpt || !content) {
      return HttpResponse.json({ message: "BAD_REQUEST" }, { status: 400 });
    }

    const id = getNextId();

    const item = {
      id: id,
      title: title.startsWith("[") ? title : `[${game}] ${title}`,
      excerpt,
      game,
      author: session.nickname,
      updatedAt: "방금",
    };

    createGuideItem(item); // ✅ 최신 글이 위로 보이게
    setGuideContent(id, content);

    return HttpResponse.json({ ...item, content }, { status: 201 });
  }),
];
