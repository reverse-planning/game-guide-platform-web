// src/pages/GuideEdit.tsx
import { useNavigate, useParams } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { getGuideEditDetail, GuideEditDetailError } from "@/services/guideDetailService";
import { updateGuide, UpdateGuideError } from "@/services/guideUpdateService";
import {
  GUIDE_EDIT_DETAIL_ERROR_MESSAGE,
  UPDATE_GUIDE_ERROR_MESSAGE,
} from "@/constants/errorMessages";
import { HeaderShell } from "@/components/shell/HeaderShell";
import { GnbBrand } from "@/components/gnb/GnbBrand";
import { PageShell } from "@/components/shell/PageShell";
import { AuthRequiredError } from "@/services/authErrors";
import { ActionSecondaryLink } from "@/components/actions/ActionSecondaryLink";
import { ActionPrimaryButton } from "@/components/actions/ActionPrimaryButton";
import { GAMES, type GameName } from "@/constants/games";
import { buildLoginUrl } from "@/routes/utils/buildLoginUrl";
import { UI_MESSAGE } from "@/constants/uiMessages";
import { ROUTE_MESSAGE } from "@/constants/routeMessages";
import { APP_ERROR_MESSAGE } from "@/constants/appErrorMessages";
import { AppError } from "@/services/apiClient";
import { useAppMessageStore } from "@/stores/appMessageSlice";
import { APP_MESSAGE_SOURCE, APP_MESSAGE_TYPE } from "@/constants/appMessage";
import { ResponseShapeError } from "@/services/responseErrors";
import { RESPONSE_SHAPE_ERROR_MESSAGE } from "@/constants/responseErrorMessages";

export type FormState = {
  title: string;
  game: GameName;
  body: string;
};

type LoadState = { type: "loading" } | { type: "ready"; form: FormState } | { type: "loadFailed" };

type SavePhase = "idle" | "saving";

const GUIDE_EDIT_FORM_ID = "guide-edit-form";

export default function GuideEdit() {
  const navigate = useNavigate();
  const { showAppMessage, clearAppMessage } = useAppMessageStore();

  const { guideId } = useParams();
  const id = useMemo(() => Number(guideId), [guideId]);

  const [loadState, setLoadState] = useState<LoadState>({ type: "loading" });
  const [savePhase, setSavePhase] = useState<SavePhase>("idle");
  const [pageMessage, setPageMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function run() {
      if (!Number.isInteger(id) || id <= 0) {
        setPageMessage(ROUTE_MESSAGE.INVALID_GUIDE_ID);
        setLoadState({ type: "loadFailed" });
        return;
      }

      clearAppMessage();
      setPageMessage(null);
      setLoadState({ type: "loading" });

      try {
        const data = await getGuideEditDetail(id);
        if (ignore) return;

        setLoadState({
          type: "ready",
          form: {
            title: data.title,
            game: data.game,
            body: data.body,
          },
        });
      } catch (err) {
        if (ignore) return;

        // ✅ 세션 누락: 홈으로 보내고 next로 복귀 가능하게
        if (err instanceof AuthRequiredError) {
          navigate(buildLoginUrl(window.location.href), { replace: true });
          return;
        }

        if (err instanceof AppError) {
          setPageMessage(APP_ERROR_MESSAGE[err.code]);
          setLoadState({ type: "loadFailed" });
          return;
        }

        if (err instanceof ResponseShapeError) {
          setPageMessage(RESPONSE_SHAPE_ERROR_MESSAGE[err.code]);
          setLoadState({ type: "loadFailed" });
          return;
        }

        if (err instanceof GuideEditDetailError) {
          setPageMessage(GUIDE_EDIT_DETAIL_ERROR_MESSAGE[err.code]);
          setLoadState({ type: "loadFailed" });
          return;
        }

        setPageMessage(GUIDE_EDIT_DETAIL_ERROR_MESSAGE.UNKNOWN);
        setLoadState({ type: "loadFailed" });
      }
    }

    run();

    return () => {
      ignore = true;
    };
  }, [id, navigate, clearAppMessage]);

  const onSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loadState.type !== "ready" || savePhase === "saving") return;

    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("title") ?? "").trim();
    const game = String(fd.get("game") ?? "").trim() as GameName;
    const body = String(fd.get("body") ?? "").trim();

    if (!title || !game || !body) {
      showAppMessage({
        type: APP_MESSAGE_TYPE.ERROR,
        source: APP_MESSAGE_SOURCE.UI,
        code: "REQUIRED_FIELDS",
        message: UI_MESSAGE.REQUIRED_FIELDS,
      });
      return;
    }

    const nextForm: FormState = { title, game, body };

    clearAppMessage();
    setSavePhase("saving");

    try {
      await updateGuide(id, nextForm);
      navigate(`/guides/${id}`, { replace: true });
    } catch (err) {
      setLoadState({ type: "ready", form: nextForm });

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

      if (err instanceof UpdateGuideError) {
        showAppMessage({
          type: APP_MESSAGE_TYPE.ERROR,
          source: APP_MESSAGE_SOURCE.API,
          code: err.code,
          message: UPDATE_GUIDE_ERROR_MESSAGE[err.code],
        });
        return;
      }

      showAppMessage({
        type: APP_MESSAGE_TYPE.ERROR,
        source: APP_MESSAGE_SOURCE.API,
        code: "UNKNOWN",
        message: APP_ERROR_MESSAGE.UNKNOWN,
      });
    } finally {
      setSavePhase("idle");
    }
  };

  if (loadState.type === "loading") {
    return (
      <div className="min-h-dvh bg-zinc-50 p-4">
        <div className="mx-auto max-w-3xl rounded-xl border bg-white p-6 text-sm shadow-sm ">
          {UI_MESSAGE.FETCHING}
        </div>
      </div>
    );
  }

  if (loadState.type === "loadFailed") {
    return (
      <div className="min-h-dvh bg-zinc-50 p-4">
        <div className="mx-auto max-w-3xl rounded-xl border bg-white p-6 text-sm shadow-sm ">
          {pageMessage}
        </div>
      </div>
    );
  }

  const form = loadState.form;
  const isSaving = savePhase === "saving";

  return (
    <PageShell>
      <HeaderShell
        left={<GnbBrand />}
        right={
          <div className="flex items-center gap-2">
            <ActionSecondaryLink to={`/guides/${id}`} disabled={isSaving}>
              취소
            </ActionSecondaryLink>
            <ActionPrimaryButton type="submit" form={GUIDE_EDIT_FORM_ID} loading={isSaving}>
              저장
            </ActionPrimaryButton>
          </div>
        }
      />

      <main className="mx-auto max-w-3xl p-4">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold">공략 수정</h1>
          <p className="mt-1 text-sm text-zinc-600">내용을 수정한 뒤 저장하세요.</p>

          <form id={GUIDE_EDIT_FORM_ID} onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="guide-edit-title" className="mb-1 block text-sm font-medium">
                제목
              </label>
              <input
                id="guide-edit-title"
                name="title"
                type="text"
                defaultValue={form.title}
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label htmlFor="guide-edit-game" className="mb-1 block text-sm font-medium">
                게임
              </label>
              <select
                id="guide-edit-game"
                name="game"
                defaultValue={form.game}
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
              <label htmlFor="guide-edit-body" className="mb-1 block text-sm font-medium">
                본문
              </label>
              <textarea
                id="guide-edit-body"
                name="body"
                rows={10}
                defaultValue={form.body}
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
          </form>
        </div>
      </main>
    </PageShell>
  );
}
