// src/mocks/handlers/guideDelete.ts
import { http, HttpResponse } from "msw";
import { getMockSession } from "@/mocks/state/mockSession";
import { deleteGuideContent } from "@/mocks/state/guideContent";
import { deleteGuideItem, findGuide } from "../state/guideDb";

export const guideDeleteHandlers = [
  http.delete("/api/guides/:id", ({ params }) => {
    const session = getMockSession();
    if (!session) {
      return HttpResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
    }

    const id = Number(params.id);
    const guide = findGuide(id);
    if (!guide) {
      return HttpResponse.json({ message: "NOT_FOUND" }, { status: 404 });
    }

    // (선택) 작성자만 삭제 허용
    if (guide.author !== session.nickname) {
      return HttpResponse.json({ message: "FORBIDDEN" }, { status: 403 });
    }

    const ok = deleteGuideItem(id);
    if (!ok) {
      return HttpResponse.json({ message: "NOT_FOUND" }, { status: 404 });
    }

    deleteGuideContent(id);

    return new HttpResponse(null, { status: 204 });
  }),
];
