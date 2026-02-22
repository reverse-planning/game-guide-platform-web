// src/mocks/handlers/guideDetailHandlers.ts
import { http, HttpResponse } from "msw";
import { getMockSession } from "../state/mockSession";
import { findGuide } from "../state/guideDb";
import type { GuideId } from "@/types/id";
import type { GuideDetailDto } from "@/types/guide";

export const guideDetailHandlers = [
  http.get("/api/guides/:id", ({ params }) => {
    const session = getMockSession();
    if (!session) {
      return HttpResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
    }

    const id = Number(params.id) as GuideId;
    const guide = findGuide(id);
    if (!guide) {
      return HttpResponse.json({ message: "NOT_FOUND" }, { status: 404 });
    }

    return HttpResponse.json(guide satisfies GuideDetailDto, { status: 200 });
  }),
];
