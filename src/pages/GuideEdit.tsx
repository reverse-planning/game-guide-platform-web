// src/pages/GuideEdit.tsx
import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { getGuideDetail } from "@/services/guideDetailService";
import { updateGuide, UpdateGuideError } from "@/services/guideUpdateService";
import { UPDATE_GUIDE_ERROR_MESSAGE } from "@/constants/errorMessages";
import { VALIDATION_MESSAGE } from "@/constants/validationMessages";

type FormState = {
  title: string;
  game: string;
  excerpt: string;
  content: string;
};

type PageState =
  | { type: "loading" }
  | { type: "ready"; form: FormState }
  | { type: "saving"; form: FormState }
  | { type: "error"; message: string };

export default function GuideEdit() {
  const navigate = useNavigate();
  const { guideId } = useParams();

  const id = useMemo(() => Number(guideId), [guideId]);

  const [state, setState] = useState<PageState>({ type: "loading" });
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function run() {
      if (!Number.isInteger(id) || id <= 0) {
        setState({ type: "error", message: VALIDATION_MESSAGE.INVALID_GUIDE_ID });
        return;
      }

      setState({ type: "loading" });
      try {
        const data = await getGuideDetail(id);
        if (ignore) return;
        setState({
          type: "ready",
          form: {
            title: data.title,
            game: data.game,
            excerpt: data.excerpt,
            content: data.content,
          },
        });
      } catch {
        if (ignore) return;
        setState({ type: "error", message: "수정 화면을 불러오지 못했습니다." });
      }
    }

    run();
    return () => {
      ignore = true;
    };
  }, [id]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state.type !== "ready") return;

    setBanner(null);

    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("title") ?? "").trim();
    const game = String(fd.get("game") ?? "").trim();
    const excerpt = String(fd.get("excerpt") ?? "").trim();
    const content = String(fd.get("content") ?? "").trim();

    if (!title || !game || !excerpt || !content) {
      setBanner("모든 입력값은 필수입니다.");
      return;
    }

    setState({ type: "saving", form: { title, game, excerpt, content } });

    try {
      await updateGuide(id, { title, game, excerpt, content });
      navigate(`/guides/${id}`, { replace: true });
    } catch (err) {
      if (err instanceof UpdateGuideError) {
        setBanner(UPDATE_GUIDE_ERROR_MESSAGE[err.code]);
      } else {
        setBanner(UPDATE_GUIDE_ERROR_MESSAGE.UNKNOWN);
      }
      setState({ type: "ready", form: { title, game, excerpt, content } });
    }
  };

  if (state.type === "loading") {
    return (
      <div className="min-h-dvh bg-zinc-50 p-4">
        <div className="mx-auto max-w-3xl rounded-xl border bg-white p-6 shadow-sm text-sm">
          불러오는 중...
        </div>
      </div>
    );
  }

  if (state.type === "error") {
    return (
      <div className="min-h-dvh bg-zinc-50 p-4">
        <div className="mx-auto max-w-3xl rounded-xl border bg-white p-6 shadow-sm text-sm">
          {state.message}
        </div>
      </div>
    );
  }

  const form = state.form;
  const isSaving = state.type === "saving";

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
          <div className="text-sm text-zinc-600">공략 수정</div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl p-4">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold">공략 수정</h1>
          <p className="mt-1 text-sm text-zinc-600">내용을 수정한 뒤 저장하세요.</p>

          {banner && (
            <div className="mt-4 rounded-lg border p-3 text-sm text-red-600">{banner}</div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">제목</label>
              <input
                name="title"
                type="text"
                defaultValue={form.title}
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">게임</label>
              <input
                name="game"
                type="text"
                defaultValue={form.game}
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
              />
              {/* 지금은 GAMES select를 그대로 가져와도 됨. 서버 스펙 따라 선택 */}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">요약 (excerpt)</label>
              <textarea
                name="excerpt"
                rows={3}
                defaultValue={form.excerpt}
                className="w-full resize-none rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">본문</label>
              <textarea
                name="content"
                rows={10}
                defaultValue={form.content}
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Link
                to={`/guides/${id}`}
                className="rounded-md border px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
              >
                {isSaving ? "저장 중..." : "저장하기"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
