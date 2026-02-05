import type { Session } from "@/stores/sessionSlice";
import { http, HttpResponse } from "msw";

const DUPLICATE_NICKNAME_SET = new Set(["admin", "관리자"]);
const MOCK_ID = { userId: 1 };

// 🔑 서버 메모리 세션 (MSW 전용)
let mockSession: Session | null = null;

export const sessionHandlers = [
  http.post("/api/session", async ({ request }) => {
    const { nickname } = (await request.json()) as { nickname: string };
    if (DUPLICATE_NICKNAME_SET.has(nickname)) {
      return HttpResponse.json({ message: "NICKNAME_DUPLICATE" }, { status: 409 });
    }

    mockSession = { ...MOCK_ID, nickname };

    return HttpResponse.json(mockSession, { status: 201 });
  }),

  // 세션 조회 (부트스트랩용)
  http.get("/api/session", () => {
    if (!mockSession) {
      return new HttpResponse(null, { status: 401 });
    }

    return HttpResponse.json(mockSession, { status: 200 });
  }),

  // (선택) 로그아웃
  http.delete("/api/session", () => {
    mockSession = null;
    return new HttpResponse(null, { status: 204 });
  }),
];
