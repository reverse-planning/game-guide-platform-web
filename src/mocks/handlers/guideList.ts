// src/mocks/handlers/guideList.ts
import { http, HttpResponse } from "msw";
import { getMockSession } from "../state/mockSession";
import { listAllGuides } from "../state/guideDb";

const PAGE_SIZE = 24;

export const guideListHandlers = [
  http.get("/api/guides", ({ request }) => {
    const session = getMockSession();
    if (!session) {
      return HttpResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
    }

    const url = new URL(request.url);
    const q = (url.searchParams.get("q") ?? "").toLowerCase();
    const page = Number(url.searchParams.get("page") ?? "0");

    // ✅ Rate limit 재현용 (검색에서 429 스펙)
    if (q === "__429__") {
      return HttpResponse.json({ message: "RATE_LIMITED" }, { status: 429 });
    }

    const all = listAllGuides();

    // 1️⃣ 검색 필터
    const filtered = q
      ? all.filter((it) => `${it.title} ${it.excerpt} ${it.game}`.toLowerCase().includes(q))
      : all;

    // 2️⃣ 페이지네이션
    const start = page * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const items = filtered.slice(start, end);
    const nextPage = end < filtered.length ? page + 1 : null;

    return HttpResponse.json({ items, nextPage }, { status: 200 });
  }),
];
