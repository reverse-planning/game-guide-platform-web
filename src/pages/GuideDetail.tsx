// src/pages/GuideDetail.tsx
import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { getGuideDetail, GuideDetailError } from "@/services/guideDetailService";
import { DELETE_GUIDE_ERROR_MESSAGE, GUIDE_DETAIL_ERROR_MESSAGE } from "@/constants/errorMessages";
import { deleteGuide, DeleteGuideError } from "@/services/guideDeleteService";
import { HeaderShell } from "@/components/shell/HeaderShell";
import { GnbBrand } from "@/components/gnb/GnbBrand";
import { ActionPrimaryLink } from "@/components/actions/ActionPrimaryLink";
import { PageShell } from "@/components/shell/PageShell";
import type { GuideDetail as GuideDetailType } from "@/types/guide";
import { AuthRequiredError } from "@/services/authErrors";
import { ActionSecondaryLink } from "@/components/actions/ActionSecondaryLink";
import { ActionDangerButton } from "@/components/actions/ActionDangerButton";
import { buildLoginUrl } from "@/routes/utils/buildLoginUrl";
import { ROUTE_MESSAGE } from "@/constants/routeMessages";
import { formatDateToMinute } from "@/utils/formatDate";
import { useSessionView } from "@/stores/sessionSelectors";
import { AppError } from "@/services/apiClient";
import { APP_ERROR_MESSAGE } from "@/constants/appErrorMessages";
import { useAppMessageStore } from "@/stores/appMessageSlice";
import { APP_MESSAGE_SOURCE, APP_MESSAGE_TYPE } from "@/constants/appMessage";
import { ResponseShapeError } from "@/services/responseErrors";
import { RESPONSE_SHAPE_ERROR_MESSAGE } from "@/constants/responseErrorMessages";
import { GnbUserBadge } from "@/components/gnb/GnbUserBadge";
import { parseGuideId } from "@/routes/utils/parseGuideId";
import { UI_STATUS_MESSAGE } from "@/constants/uiMessages";
import { ConfirmModal } from "@/components/modals/ConfirmModal";

type LoadState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success"; data: GuideDetailType }
  | { type: "loadFailed" };

type DeletePhase = "idle" | "deleting";

export default function GuideDetail() {
  const navigate = useNavigate();
  const { guideId } = useParams();
  const id = parseGuideId(guideId);

  const { sessionNickname } = useSessionView();
  const { showAppMessage, clearAppMessage } = useAppMessageStore();

  const [state, setState] = useState<LoadState>({ type: "idle" });
  const [pageMessage, setPageMessage] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePhase, setDeletePhase] = useState<DeletePhase>("idle");

  const isDeleting = deletePhase === "deleting";
  const detail = state.type === "success" ? state.data : null;
  const isOwner = detail !== null && sessionNickname !== null && sessionNickname === detail.author;

  useEffect(() => {
    let ignore = false;

    async function run() {
      if (id === null) {
        setPageMessage(ROUTE_MESSAGE.INVALID_GUIDE_ID);
        setState({ type: "loadFailed" });
        return;
      }

      clearAppMessage();
      setPageMessage(null);
      setState({ type: "loading" });

      try {
        const data = await getGuideDetail(id);
        if (ignore) return;
        setState({ type: "success", data });
      } catch (err) {
        if (ignore) return;

        if (err instanceof AuthRequiredError) {
          navigate(buildLoginUrl(window.location.href), { replace: true });
          return;
        }

        if (err instanceof AppError) {
          setPageMessage(APP_ERROR_MESSAGE[err.code]);
          setState({ type: "loadFailed" });
          return;
        }

        if (err instanceof ResponseShapeError) {
          setPageMessage(RESPONSE_SHAPE_ERROR_MESSAGE[err.code]);
          setState({ type: "loadFailed" });
          return;
        }

        if (err instanceof GuideDetailError) {
          setPageMessage(GUIDE_DETAIL_ERROR_MESSAGE[err.code]);
          setState({ type: "loadFailed" });
          return;
        }

        setPageMessage(GUIDE_DETAIL_ERROR_MESSAGE.UNKNOWN);
        setState({ type: "loadFailed" });
      }
    }

    run();

    return () => {
      ignore = true;
    };
  }, [id, navigate, clearAppMessage]);

  const onConfirmDelete = async () => {
    if (id === null || isDeleting) return;

    clearAppMessage();
    setDeletePhase("deleting");

    try {
      await deleteGuide(id);
      navigate("/guides", { replace: true });
    } catch (err) {
      // ✅ 세션 누락: 홈으로 보내고 next로 복귀 가능하게
      if (err instanceof AuthRequiredError) {
        navigate(buildLoginUrl(window.location.href), { replace: true });
        return;
      }

      if (err instanceof AppError) {
        showAppMessage({
          type: APP_MESSAGE_TYPE.ERROR,
          source: APP_MESSAGE_SOURCE.API,
          code: err.code,
          message: APP_ERROR_MESSAGE[err.code],
        });
        return;
      }

      if (err instanceof DeleteGuideError) {
        showAppMessage({
          type: APP_MESSAGE_TYPE.ERROR,
          source: APP_MESSAGE_SOURCE.API,
          code: err.code,
          message: DELETE_GUIDE_ERROR_MESSAGE[err.code],
        });
        return;
      }

      showAppMessage({
        type: APP_MESSAGE_TYPE.ERROR,
        source: APP_MESSAGE_SOURCE.API,
        code: "UNKNOWN",
        message: DELETE_GUIDE_ERROR_MESSAGE.UNKNOWN,
      });
    } finally {
      setDeletePhase("idle");
      setIsDeleteModalOpen(false);
    }
  };

  const content = (() => {
    if (state.type === "idle" || state.type === "loading") return UI_STATUS_MESSAGE.LOADING;
    if (state.type === "loadFailed") return pageMessage;
    return null;
  })();

  return (
    <PageShell>
      <HeaderShell
        left={<GnbBrand />}
        right={
          <div className="flex items-center gap-3">
            <ActionPrimaryLink to="/guides/new">공략 등록</ActionPrimaryLink>
            {sessionNickname && <GnbUserBadge nickname={sessionNickname} />}
          </div>
        }
      />

      <main className="mx-auto max-w-3xl p-4">
        {detail === null ? (
          <div className="rounded-xl border bg-white p-6 text-sm text-zinc-700 shadow-sm">
            {content}
          </div>
        ) : (
          <article className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-xl font-semibold">{detail.title}</h1>

                <div className="mt-2 text-sm text-zinc-600">
                  {detail.game} · {detail.author}
                </div>

                <div className="mt-1 text-xs text-zinc-500">조회 {detail.viewCount}</div>
              </div>

              <span className="shrink-0 text-sm text-zinc-500">
                {formatDateToMinute(detail.updatedAt)}
              </span>
            </div>

            <div className="prose prose-zinc mt-6 max-w-none whitespace-pre-wrap text-sm">
              {detail.body}
            </div>

            <div className="mt-6 flex items-center justify-between gap-2">
              <Link
                to="/guides"
                className="text-sm text-zinc-700 hover:text-zinc-900 hover:underline"
              >
                목록으로
              </Link>

              {isOwner && (
                <div className="flex justify-end gap-2">
                  <ActionSecondaryLink to={`/guides/${id}/edit`}>수정</ActionSecondaryLink>
                  <ActionDangerButton onClick={() => setIsDeleteModalOpen(true)}>
                    삭제
                  </ActionDangerButton>
                </div>
              )}
            </div>
          </article>
        )}
      </main>

      <ConfirmModal
        open={isDeleteModalOpen}
        title="공략을 삭제할까요?"
        description="삭제한 공략은 복구할 수 없습니다."
        confirmText="삭제"
        isConfirming={isDeleting}
        onConfirm={onConfirmDelete}
        onClose={() => {
          if (isDeleting) return;
          setIsDeleteModalOpen(false);
        }}
      />
    </PageShell>
  );
}
