// src/mocks/handlers/guideCreate.ts
import { http, HttpResponse } from "msw";
import { GUIDE_DB } from "../data/guides";

type Body = {
  title: string;
  game: string;
  excerpt: string;
  content: string;
  author: string;
};

export const guideCreateHandlers = [
  http.post("/api/guides", async ({ request }) => {
    const body = (await request.json()) as Partial<Body>;

    const title = String(body.title ?? "").trim();
    const game = String(body.game ?? "").trim();
    const excerpt = String(body.excerpt ?? "").trim();
    const content = String(body.content ?? "").trim();
    const author = String(body.author ?? "").trim();

    if (!author) {
      return HttpResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
    }
    if (!title || !game || !excerpt || !content) {
      return HttpResponse.json({ message: "BAD_REQUEST" }, { status: 400 });
    }

    const nextId = (GUIDE_DB.at(-1)?.id ?? 0) + 1;

    const created = {
      id: nextId,
      title: title.startsWith("[") ? title : `[${game}] ${title}`,
      excerpt,
      game,
      author,
      updatedAt: "방금",
    };

    GUIDE_DB.unshift(created); // ✅ 최신 글이 위로 보이게

    return HttpResponse.json({ ...created, content }, { status: 201 });
  }),
];
