// src/pages/GuideDetail.tsx
import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { getGuideDetail, GuideDetailError } from "@/services/guideDetailService";
import { DELETE_GUIDE_ERROR_MESSAGE, GUIDE_DETAIL_ERROR_MESSAGE } from "@/constants/errorMessages";
import { VALIDATION_MESSAGE } from "@/constants/validationMessages";
import { deleteGuide, DeleteGuideError } from "@/services/guideDeleteService";
import { HeaderShell } from "@/components/shell/HeaderShell";
import { GnbBrand } from "@/components/gnb/GnbBrand";
import { ActionPrimaryLink } from "@/components/actions/ActionPrimaryLink";
import { PageShell } from "@/components/shell/PageShell";
import type { GuideDetail as GuideDetailType } from "@/types/guide";
import { SessionRequiredError } from "@/services/sessionResolver";
import { ActionSecondaryLink } from "@/components/actions/ActionSecondaryLink";
import { ActionDangerButton } from "@/components/actions/ActionDangerButton";
import { buildLoginUrl } from "@/routes/utils/buildLoginUrl";

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
      // ✅ 세션 누락: 홈으로 보내고 next로 복귀 가능하게
      if (err instanceof SessionRequiredError) {
        navigate(buildLoginUrl(window.location.href), { replace: true });
        return;
      }

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
      <HeaderShell
        left={<GnbBrand />}
        right={<ActionPrimaryLink to="/guides/new">공략 등록</ActionPrimaryLink>}
      />

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

            <div className="prose prose-zinc mt-6 max-w-none whitespace-pre-wrap text-sm">
              {state.data.body}
            </div>

            {actionError && (
              <div className="mt-6 rounded-lg border p-3 text-sm text-red-600">{actionError}</div>
            )}

            <div className="mt-6 flex items-center justify-between gap-2">
              <Link
                to="/guides"
                className="text-sm text-zinc-700 hover:text-zinc-900 hover:underline"
              >
                목록으로
              </Link>

              <div className="flex justify-end gap-2">
                <ActionSecondaryLink to={`/guides/${id}/edit`}>수정</ActionSecondaryLink>
                <ActionDangerButton onClick={onDelete}>삭제</ActionDangerButton>
              </div>
            </div>
          </article>
        )}
      </main>
    </PageShell>
  );
}
