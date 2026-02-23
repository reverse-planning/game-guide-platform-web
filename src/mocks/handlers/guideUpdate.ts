// src/mocks/handlers/guideUpdate.ts
import { http, HttpResponse } from "msw";
import { getMockSession } from "@/mocks/state/mockSession";
import { findGuide, updateGuideItem } from "../state/guideDb";
import type { GuideId } from "@/types/id";
import type { GuideDetailDto, UpdateGuideRequestDto, UpdateGuideResponseDto } from "@/types/guide";
import type { GameName } from "@/constants/games";

export const guideUpdateHandlers = [
  http.patch("/api/guides/:id", async ({ params, request }) => {
    const session = getMockSession();
    if (!session) {
      return HttpResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
    }

    const id = Number(params.id) as GuideId;
    const prev = findGuide(id);
    if (!prev) {
      return HttpResponse.json({ message: "NOT_FOUND" }, { status: 404 });
    }

    // (선택) 작성자만 수정 허용
    if (prev.author !== session.nickname) {
      return HttpResponse.json({ message: "FORBIDDEN" }, { status: 403 });
    }

    const { title, game, body } = (await request.json()) as Partial<UpdateGuideRequestDto>;
    if (!title || !game || !body) {
      return HttpResponse.json({ message: "BAD_REQUEST" }, { status: 400 });
    }

    const next: GuideDetailDto = {
      ...prev,
      title: title.trim().startsWith("[") ? title.trim() : `[${game.trim()}] ${title.trim()}`,
      game: game.trim() as GameName,
      body: body.trim(),
      updatedAt: "방금",
    };
    const ok = updateGuideItem(id, next);
    if (!ok) {
      return HttpResponse.json({ message: "NOT_FOUND" }, { status: 404 });
    }

    const response: UpdateGuideResponseDto = next;
    return HttpResponse.json(response, { status: 200 });
  }),
];
