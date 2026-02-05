import { createBrowserRouter, redirect } from "react-router";
import { useSessionStore } from "@/stores/sessionSlice.ts";
import GuideList from "@/pages/GuideList.tsx";
import GuideCreate from "@/pages/GuideCreate.tsx";
import Home from "@/pages/Home.tsx";
import NotFound from "@/pages/NotFound.tsx";
import ProtectedLayout from "./ProtectedLayout.tsx";
import GuideDetail from "@/pages/GuideDetail.tsx";
import { getSession } from "@/services/sessionService.ts";

/**
 * 보호 라우트 진입 전 가드 (서버 기준 부트스트랩)
 * - store에 이미 세션이 있으면 그대로 통과
 * - 없으면 서버에서 세션 복구 시도 (GET /api/session)
 * - 실패하면 redirect
 */
async function requireSession({ request }: { request: Request }) {
  const { session, setSession, resetSession } = useSessionStore.getState();

  if (session?.userId) return null;

  try {
    const data = await getSession(); // 200이면 세션 유효
    setSession({ userId: data.userId, nickname: data.nickname });
    return null;
  } catch {
    resetSession();

    const url = new URL(request.url);
    const next = url.pathname + url.search;

    throw redirect(`/?next=${encodeURIComponent(next)}`);
  }
}

export const router = createBrowserRouter([
  { path: "/", element: <Home /> },

  {
    path: "/guides",
    element: <ProtectedLayout />,
    loader: requireSession,
    children: [
      { index: true, element: <GuideList /> },
      { path: "new", element: <GuideCreate /> },
      { path: ":guideId", element: <GuideDetail /> },
    ],
  },

  { path: "*", element: <NotFound /> },
]);
