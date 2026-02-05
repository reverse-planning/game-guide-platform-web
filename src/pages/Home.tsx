// src/pages/Home.tsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useSessionStore } from "@/stores/sessionSlice";
import { createSession, CreateSessionError } from "@/services/sessionService";
import { CREATE_SESSION_ERROR_MESSAGE } from "@/constants/errorMessages";
import { useSessionView } from "@/stores/sessionSelectors";

type SubmitStatus = { type: "idle" } | { type: "submitting" } | { type: "error"; message: string };

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  const { setSession, getNicknameHint, setNicknameHint } = useSessionStore();
  const { isAuthed, sessionNickname } = useSessionView();

  const [inputNickname, setInputNickname] = useState(() => getNicknameHint() ?? "");
  const [status, setStatus] = useState<SubmitStatus>({ type: "idle" });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (status.type === "submitting") return;

    const name = inputNickname.trim();
    if (!name) return;

    setStatus({ type: "submitting" });

    try {
      const data = await createSession(name);

      // ✅ 세션은 store(메모리)에만
      setSession({ userId: data.userId, nickname: data.nickname });

      // ✅ localStorage는 UX 힌트(프리필)만
      setNicknameHint(data.nickname);

      // ✅ next가 있으면 그쪽으로 복귀
      const params = new URLSearchParams(location.search);
      const next = params.get("next");
      if (next) navigate(next, { replace: true });
    } catch (err) {
      if (err instanceof CreateSessionError) {
        setStatus({ type: "error", message: CREATE_SESSION_ERROR_MESSAGE[err.code] });
      } else {
        setStatus({ type: "error", message: CREATE_SESSION_ERROR_MESSAGE.UNKNOWN });
      }
      return;
    } finally {
      // ✅ submitting일 때만 idle로 복귀 (error 상태를 지우지 않기)
      setStatus((prev) => (prev.type === "submitting" ? { type: "idle" } : prev));
    }
  };

  const isSubmitting = status.type === "submitting";
  const errorMessage = status.type === "error" ? status.message : null;

  return (
    <div className="min-h-dvh bg-zinc-50">
      <header className="sticky top-0 z-10 border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
          <h1 className="text-lg font-semibold">Game Guide</h1>
          <button className="text-lg font-semibold" onClick={() => navigate("/guides")}>
            공략글
          </button>
          <div className="text-sm text-zinc-600">
            {isAuthed ? `${sessionNickname}님` : "로그인을 해주세요"}
          </div>
        </div>
      </header>

      <main className="flex min-h-[calc(100dvh-64px)] items-center justify-center px-4">
        {isAuthed ? (
          /* ✅ 로그인 완료 상태 */
          <div className="w-full max-w-md rounded-xl border bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-semibold">환영합니다, {sessionNickname}님 👋</h2>
            <p className="mt-2 text-sm text-zinc-600">
              다양한 공략글을 살펴보고 직접 공략을 등록해보세요.
            </p>

            <button
              type="button"
              onClick={() => navigate("/guides")}
              className="mt-6 w-full rounded-md bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-800"
            >
              공략글 보러가기
            </button>
          </div>
        ) : (
          /* ❌ 로그인 전 상태 */
          <form
            onSubmit={onSubmit}
            className="w-full max-w-sm rounded-xl border bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold">닉네임으로 시작하기</h2>
            <p className="mt-1 text-sm text-zinc-600">
              닉네임만 정하면 바로 공략을 확인할 수 있습니다.
            </p>

            <div className="mt-4">
              <input
                type="text"
                value={inputNickname}
                onChange={(e) => setInputNickname(e.target.value)}
                placeholder="닉네임을 입력하세요"
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            {errorMessage && <p className="mt-3 text-sm text-red-600">{errorMessage}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {isSubmitting ? "처리 중..." : "시작하기"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
