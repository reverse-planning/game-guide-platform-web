// src/mocks/handlers/guideUpdate.ts
import { http, HttpResponse } from "msw";
import { getMockSession } from "@/mocks/state/mockSession";
import { getGuideContent, setGuideContent } from "@/mocks/state/guideContent";
import { findGuide, updateGuideItem } from "../state/guideDb";

type updateGuideBody = {
  title: string;
  game: string;
  excerpt: string;
  content: string;
};

export const guideUpdateHandlers = [
  http.patch("/api/guides/:id", async ({ params, request }) => {
    const session = getMockSession();
    if (!session) {
      return HttpResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
    }

    const id = Number(params.id);
    const prev = findGuide(id);
    if (!prev) {
      return HttpResponse.json({ message: "NOT_FOUND" }, { status: 404 });
    }

    // (선택) 작성자만 수정 허용
    if (prev.author !== session.nickname) {
      return HttpResponse.json({ message: "FORBIDDEN" }, { status: 403 });
    }

    const { title, game, excerpt, content } = (await request.json()) as updateGuideBody;
    if (!title || !game || !excerpt || !content) {
      return HttpResponse.json({ message: "BAD_REQUEST" }, { status: 400 });
    }

    const updated = {
      ...prev,
      title: title.startsWith("[") ? title : `[${game}] ${title}`,
      game,
      excerpt,
      updatedAt: "방금",
    };

    const ok = updateGuideItem(id, updated);
    if (!ok) {
      return HttpResponse.json({ message: "NOT_FOUND" }, { status: 404 });
    }

    // content 업데이트
    setGuideContent(id, content ?? getGuideContent(id) ?? "");

    return HttpResponse.json({ ...updated, content }, { status: 200 });
  }),
];
