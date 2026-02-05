// src/pages/GuideDetail.tsx
import { Link, useParams } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { getGuideDetail, type GuideDetail as GuideDetailType } from "@/services/guideDetailService";

type LoadState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success"; data: GuideDetailType }
  | { type: "error"; message: string };

export default function GuideDetail() {
  const { guideId } = useParams();

  const id = useMemo(() => Number(guideId), [guideId]);

  const [state, setState] = useState<LoadState>({ type: "idle" });

  useEffect(() => {
    let ignore = false;

    async function run() {
      if (!Number.isInteger(id) || id <= 0) {
        setState({ type: "error", message: "잘못된 접근입니다." });
        return;
      }

      setState({ type: "loading" });
      try {
        const data = await getGuideDetail(id);
        if (ignore) return;
        setState({ type: "success", data });
      } catch {
        if (ignore) return;
        setState({ type: "error", message: "공략을 불러오지 못했습니다." });
      }
    }

    run();
    return () => {
      ignore = true;
    };
  }, [id]);

  const content = (() => {
    if (state.type === "loading" || state.type === "idle") return "불러오는 중...";
    if (state.type === "error") return state.message;
    return null;
  })();

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
          <Link
            to="/guides/new"
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            공략 등록
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl p-4">
        {state.type !== "success" ? (
          <div className="rounded-xl border bg-white p-6 shadow-sm text-sm text-zinc-700">
            {content}
          </div>
        ) : (
          <article className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-xl font-semibold">{state.data.title}</h1>
                <div className="mt-2 text-sm text-zinc-600">
                  {state.data.game} · {state.data.author}
                </div>
              </div>
              <span className="shrink-0 text-sm text-zinc-500">{state.data.updatedAt}</span>
            </div>

            <p className="mt-4 rounded-lg bg-zinc-50 p-4 text-sm text-zinc-700">
              {state.data.excerpt}
            </p>

            <div className="prose prose-zinc mt-6 max-w-none whitespace-pre-wrap text-sm">
              {state.data.content}
            </div>

            <div className="mt-8 flex justify-end">
              <Link to="/guides" className="text-sm text-zinc-700 hover:underline">
                목록으로
              </Link>
            </div>
          </article>
        )}
      </main>
    </div>
  );
}
