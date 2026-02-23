// src/mocks/handlers/guideCreate.ts
import { http, HttpResponse } from "msw";
import { getMockSession } from "../state/mockSession";
import { createGuideItem, getNextId } from "../state/guideDb";
import type { CreateGuideRequestDto, GuideDetailDto } from "@/types/guide";
import type { GuideId } from "@/types/id";
import type { GameName } from "@/constants/games";

export const guideCreateHandlers = [
  http.post("/api/guides", async ({ request }) => {
    const session = getMockSession();
    if (!session) {
      return HttpResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
    }

    const { title, game, body } = (await request.json()) as Partial<CreateGuideRequestDto>;
    if (!title || !game || !body) {
      return HttpResponse.json({ message: "BAD_REQUEST" }, { status: 400 });
    }

    const id = getNextId() as GuideId;

    const item: GuideDetailDto = {
      id,
      title: title.trim().startsWith("[") ? title.trim() : `[${game.trim()}] ${title.trim()}`,
      game: game.trim() as GameName,
      body: body.trim(),
      author: session.nickname,
      updatedAt: "방금",
    };

    createGuideItem(item); // ✅ 최신 글이 위로 보이게

    return HttpResponse.json(id, { status: 201 });
  }),
];
