// src/pages/GuideCreate.tsx
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { createGuide, CreateGuideError } from "@/services/guideCreateService";
import { GAMES } from "@/mocks/data/guides";
import { useSessionView } from "@/stores/sessionSelectors";

type SubmitStatus = { type: "idle" } | { type: "submitting" } | { type: "error"; message: string };

export default function GuideCreate() {
  const navigate = useNavigate();
  const { sessionNickname } = useSessionView();

  const [status, setStatus] = useState<SubmitStatus>({ type: "idle" });

  const isSubmitting = status.type === "submitting";
  const errorMessage = status.type === "error" ? status.message : null;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    const author = sessionNickname;
    if (!author) {
      setStatus({ type: "error", message: "로그인이 필요합니다." });
      return;
    }

    const fd = new FormData(e.currentTarget);

    const title = String(fd.get("title") ?? "").trim();
    const game = String(fd.get("game") ?? "").trim();
    const excerpt = String(fd.get("excerpt") ?? "").trim();
    const content = String(fd.get("content") ?? "").trim();

    if (!title || !game || !excerpt || !content) {
      setStatus({ type: "error", message: "모든 입력값은 필수입니다." });
      return;
    }

    setStatus({ type: "submitting" });

    try {
      await createGuide({ title, game, excerpt, content, author });
      navigate("/guides");
    } catch (e) {
      if (e instanceof CreateGuideError) {
        setStatus({ type: "error", message: e.code });
      } else {
        setStatus({ type: "error", message: "UNKNOWN" });
      }
      return;
    } finally {
      setStatus((prev) => (prev.type === "submitting" ? { type: "idle" } : prev));
    }
  };

  return (
    <div className="min-h-dvh bg-zinc-50">
      <header className="sticky top-0 z-10 border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-lg font-semibold">
              Game Guide
            </Link>
            <Link to="/guides" className="text-sm text-zinc-700 hover:underline">
              공략글
            </Link>
          </div>
          <div className="text-sm text-zinc-600">공략 등록</div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl p-4">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold">공략 등록</h1>
          <p className="mt-1 text-sm text-zinc-600">제목/게임/요약/본문을 입력하세요.</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">제목</label>
              <input
                name="title"
                type="text"
                placeholder="예: [엘든링] 초반 파밍 동선 정리"
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">게임</label>
              <select
                name="game"
                defaultValue={GAMES[0]}
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
              >
                {GAMES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">요약 (excerpt)</label>
              <textarea
                name="excerpt"
                rows={3}
                placeholder="리스트에서 보여줄 요약 문장"
                className="w-full resize-none rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
              />
              <p className="mt-1 text-xs text-zinc-500">리스트 카드에서 line-clamp로 노출됩니다.</p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">본문</label>
              <textarea
                name="content"
                rows={10}
                placeholder="공략 내용을 입력하세요"
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Link
                to="/guides"
                className="rounded-md border px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
              >
                {isSubmitting ? "등록 중..." : "등록하기"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
