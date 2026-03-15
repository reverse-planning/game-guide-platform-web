// src/pages/GuideCreate.tsx
import { useNavigate } from "react-router";
import { useState } from "react";
import { createGuide, CreateGuideError } from "@/services/guideCreateService";
import { CREATE_GUIDE_ERROR_MESSAGE } from "@/constants/errorMessages";
import { HeaderShell } from "@/components/shell/HeaderShell";
import { GnbBrand } from "@/components/gnb/GnbBrand";
import { PageShell } from "@/components/shell/PageShell";
import { AuthRequiredError } from "@/services/authErrors";
import { GAMES } from "@/constants/games";
import { ActionSecondaryLink } from "@/components/actions/ActionSecondaryLink";
import { ActionPrimaryButton } from "@/components/actions/ActionPrimaryButton";
import { buildLoginUrl } from "@/routes/utils/buildLoginUrl";
import { AppError } from "@/services/apiClient";
import { APP_ERROR_MESSAGE } from "@/constants/appErrorMessages";
import { useAppMessageStore } from "@/stores/appMessageSlice";
import { APP_MESSAGE_SOURCE, APP_MESSAGE_TYPE } from "@/constants/appMessage";
import { ResponseShapeError } from "@/services/responseErrors";
import { RESPONSE_SHAPE_ERROR_MESSAGE } from "@/constants/responseErrorMessages";
import { validateGuideForm } from "@/features/guides/guideFormValidation";

type SubmitPhase = "idle" | "submitting";

const GUIDE_CREATE_FORM_ID = "guide-create-form";

export default function GuideCreate() {
  const navigate = useNavigate();
  const { showAppMessage, clearAppMessage } = useAppMessageStore();

  const [submitPhase, setSubmitPhase] = useState<SubmitPhase>("idle");
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const isSubmitting = submitPhase === "submitting";

  const onSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    const fd = new FormData(e.currentTarget);
    const result = validateGuideForm({
      title: fd.get("title"),
      game: fd.get("game"),
      body: fd.get("body"),
    });

    if (!result.ok) {
      setFormMessage(result.message);
      return;
    }

    clearAppMessage();
    setFormMessage(null);
    setSubmitPhase("submitting");

    try {
      await createGuide(result.value);
      navigate("/guides");
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

      if (err instanceof ResponseShapeError) {
        showAppMessage({
          type: APP_MESSAGE_TYPE.ERROR,
          source: APP_MESSAGE_SOURCE.API,
          code: err.code,
          message: RESPONSE_SHAPE_ERROR_MESSAGE[err.code],
        });
        return;
      }

      if (err instanceof CreateGuideError) {
        showAppMessage({
          type: APP_MESSAGE_TYPE.ERROR,
          source: APP_MESSAGE_SOURCE.API,
          code: err.code,
          message: CREATE_GUIDE_ERROR_MESSAGE[err.code],
        });
        return;
      }

      showAppMessage({
        type: APP_MESSAGE_TYPE.ERROR,
        source: APP_MESSAGE_SOURCE.API,
        code: "UNKNOWN",
        message: CREATE_GUIDE_ERROR_MESSAGE.UNKNOWN,
      });
    } finally {
      setSubmitPhase("idle");
    }
  };

  return (
    <PageShell>
      <HeaderShell
        left={<GnbBrand />}
        right={
          <div className="flex items-center gap-2">
            <ActionSecondaryLink to="/guides" disabled={isSubmitting}>
              취소
            </ActionSecondaryLink>
            <ActionPrimaryButton type="submit" form={GUIDE_CREATE_FORM_ID} loading={isSubmitting}>
              공략 등록
            </ActionPrimaryButton>
          </div>
        }
      />

      <main className="mx-auto max-w-3xl p-4">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold">공략 등록</h1>
          <p className="mt-1 text-sm text-zinc-600">제목/게임/요약/본문을 입력하세요.</p>

          <form id={GUIDE_CREATE_FORM_ID} onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="guide-title" className="mb-1 block text-sm font-medium">
                제목
              </label>
              <input
                id="guide-title"
                name="title"
                type="text"
                placeholder="예: [엘든링] 초반 파밍 동선 정리"
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label htmlFor="guide-game" className="mb-1 block text-sm font-medium">
                게임
              </label>
              <select
                id="guide-game"
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
              <label htmlFor="guide-body" className="mb-1 block text-sm font-medium">
                본문
              </label>
              <textarea
                id="guide-body"
                name="body"
                rows={10}
                placeholder="공략 내용을 입력하세요"
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            {formMessage && <p className="text-sm text-red-600">{formMessage}</p>}
          </form>
        </div>
      </main>
    </PageShell>
  );
}
