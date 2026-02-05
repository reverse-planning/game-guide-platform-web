// src/mocks/handlers/guideList.ts
import { http, HttpResponse } from "msw";
import { GUIDE_DB } from "../data/guides";

const PAGE_SIZE = 24;

export const guideListHandlers = [
  http.get("/api/guides", ({ request }) => {
    const url = new URL(request.url);
    const q = (url.searchParams.get("q") ?? "").toLowerCase();
    const page = Number(url.searchParams.get("page") ?? "0");

    if (!Number.isInteger(page) || page < 0) {
      return HttpResponse.json({ message: "BAD_REQUEST" }, { status: 400 });
    }

    // 1️⃣ 검색 필터
    const filtered = q
      ? GUIDE_DB.filter((it) => `${it.title} ${it.excerpt} ${it.game}`.toLowerCase().includes(q))
      : GUIDE_DB;

    // 2️⃣ 페이지네이션
    const start = page * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const items = filtered.slice(start, end);

    const nextPage = end < filtered.length ? page + 1 : null;

    return HttpResponse.json({ items, nextPage }, { status: 200 });
  }),
];
