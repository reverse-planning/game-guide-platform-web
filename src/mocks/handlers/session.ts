import type { Session } from "@/stores/sessionSlice";
import { http, HttpResponse } from "msw";
import { clearMockSession, getMockSession, setMockSession } from "../state/mockSession";

const DUPLICATE_NICKNAME_SET = new Set(["admin", "관리자"]);
const MOCK_ID = { userId: 1 };

type CreateSessionBody = { nickname: string };

export const sessionHandlers = [
  http.post("/api/session", async ({ request }) => {
    const { nickname } = (await request.json()) as CreateSessionBody;

    if (DUPLICATE_NICKNAME_SET.has(nickname)) {
      return HttpResponse.json({ message: "NICKNAME_DUPLICATE" }, { status: 409 });
    }

    const session: Session = { ...MOCK_ID, nickname };
    setMockSession(session);

    return HttpResponse.json(session, { status: 201 });
  }),

  // 세션 조회 (부트스트랩용)
  http.get("/api/session", () => {
    const session = getMockSession();
    if (!session) {
      return HttpResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
    }
    return HttpResponse.json(session, { status: 200 });
  }),

  // (선택) 로그아웃
  http.delete("/api/session", () => {
    clearMockSession();
    return new HttpResponse(null, { status: 204 });
  }),
];
