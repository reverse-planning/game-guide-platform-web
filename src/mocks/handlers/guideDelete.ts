// src/mocks/handlers/guideDelete.ts
import { http, HttpResponse } from "msw";
import { getMockSession } from "@/mocks/state/mockSession";
import { deleteGuideItem, findGuide } from "../state/guideDb";
import type { GuideId } from "@/types/id";

export const guideDeleteHandlers = [
  http.delete("/api/guides/:id", ({ params }) => {
    const session = getMockSession();
    if (!session) {
      return HttpResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
    }

    const id = Number(params.id) as GuideId;
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

    return new HttpResponse(null, { status: 204 });
  }),
];
