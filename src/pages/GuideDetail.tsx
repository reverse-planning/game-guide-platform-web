// src/pages/GuideDetail.tsx
import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useMemo, useState } from "react";
import {
  getGuideDetail,
  GuideDetailError,
  type GuideDetail as GuideDetailType,
} from "@/services/guideDetailService";
import { DELETE_GUIDE_ERROR_MESSAGE, GUIDE_DETAIL_ERROR_MESSAGE } from "@/constants/errorMessages";
import { VALIDATION_MESSAGE } from "@/constants/validationMessages";
import { deleteGuide, DeleteGuideError } from "@/services/guideDeleteService";
import { GnbShell } from "@/components/gnb/GnbShell";
import { GnbLeft } from "@/components/gnb/GnbLeft";
import { GnbCtaLink } from "@/components/gnb/GnbCtaLink";
import { PageShell } from "@/components/shell/PageShell";

type LoadState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success"; data: GuideDetailType }
  | { type: "error"; message: string };

export default function GuideDetail() {
  const navigate = useNavigate();
  const { guideId } = useParams();

  const id = useMemo(() => Number(guideId), [guideId]);

  const [state, setState] = useState<LoadState>({ type: "idle" });
  const [actionError, setActionError] = useState<string | null>(null);

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
        setState({ type: "success", data });
      } catch (err) {
        if (ignore) return;
        if (err instanceof GuideDetailError) {
          setState({ type: "error", message: GUIDE_DETAIL_ERROR_MESSAGE[err.code] });
        } else {
          setState({ type: "error", message: GUIDE_DETAIL_ERROR_MESSAGE.UNKNOWN });
        }
      }
    }

    run();
    return () => {
      ignore = true;
    };
  }, [id]);

  const onDelete = async () => {
    if (!Number.isInteger(id) || id <= 0) return;

    const ok = window.confirm("정말 삭제할까요?");
    if (!ok) return;

    setActionError(null);
    try {
      await deleteGuide(id);
      navigate("/guides", { replace: true });
    } catch (err) {
      if (err instanceof DeleteGuideError) {
        setActionError(DELETE_GUIDE_ERROR_MESSAGE[err.code]);
      } else {
        setActionError(DELETE_GUIDE_ERROR_MESSAGE.UNKNOWN);
      }
    }
  };

  const content = (() => {
    if (state.type === "loading" || state.type === "idle") return "불러오는 중...";
    if (state.type === "error") return state.message;
    return null;
  })();

  return (
    <PageShell>
      <GnbShell left={<GnbLeft />} right={<GnbCtaLink to="/guides/new">공략 등록</GnbCtaLink>} />

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

            {actionError && (
              <div className="mt-6 rounded-lg border p-3 text-sm text-red-600">{actionError}</div>
            )}

            <div className="mt-6 flex items-center justify-between gap-2">
              <Link to="/guides" className="text-sm text-zinc-700 hover:underline">
                목록으로
              </Link>

              <div className="flex justify-end gap-2">
                <Link
                  to={`/guides/${id}/edit`}
                  className="rounded-md border px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                >
                  수정
                </Link>
                <button
                  type="button"
                  onClick={onDelete}
                  className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500"
                >
                  삭제
                </button>
              </div>
            </div>
          </article>
        )}
      </main>
    </PageShell>
  );
}
