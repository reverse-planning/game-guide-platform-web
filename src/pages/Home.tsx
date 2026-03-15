// src/pages/Home.tsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useSessionStore } from "@/stores/sessionSlice";
import { createSession, CreateSessionError } from "@/services/sessionService";
import { CREATE_SESSION_ERROR_MESSAGE } from "@/constants/errorMessages";
import { HeaderShell } from "@/components/shell/HeaderShell";
import { GnbBrand } from "@/components/gnb/GnbBrand";
import { getSafeNext } from "@/routes/utils/safeNext";
import { GnbGuestStatus } from "@/components/gnb/GnbGuestStatus";
import { AppError } from "@/services/apiClient";
import { APP_ERROR_MESSAGE } from "@/constants/appErrorMessages";
import { useAppMessageStore } from "@/stores/appMessageSlice";
import { APP_MESSAGE_SOURCE, APP_MESSAGE_TYPE } from "@/constants/appMessage";
import { ResponseShapeError } from "@/services/responseErrors";
import { RESPONSE_SHAPE_ERROR_MESSAGE } from "@/constants/responseErrorMessages";
import { ActionPrimaryButton } from "@/components/actions/ActionPrimaryButton";
import { validateNickname } from "@/features/session/nicknameValidation";

type SubmitPhase = "idle" | "submitting";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  const { getNicknameHint, setNicknameHint } = useSessionStore();
  const { showAppMessage, clearAppMessage } = useAppMessageStore();

  const [inputNickname, setInputNickname] = useState(() => getNicknameHint() ?? "");
  const [submitPhase, setSubmitPhase] = useState<SubmitPhase>("idle");
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const isSubmitting = submitPhase === "submitting";

  const onSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;

    const result = validateNickname(inputNickname);
    if (!result.ok) {
      setFormMessage(result.message);
      return;
    }

    setFormMessage(null);
    clearAppMessage();
    setSubmitPhase("submitting");

    try {
      const data = await createSession(result.value);
      // ✅ localStorage는 UX 힌트(프리필)만
      setNicknameHint(data.nickname);

      // ✅ next가 있으면 그쪽으로 복귀
      const params = new URLSearchParams(location.search);
      const next = params.get("next");
      navigate(getSafeNext(next), { replace: true });
    } catch (err) {
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

      if (err instanceof CreateSessionError) {
        showAppMessage({
          type: APP_MESSAGE_TYPE.ERROR,
          source: APP_MESSAGE_SOURCE.API,
          code: err.code,
          message: CREATE_SESSION_ERROR_MESSAGE[err.code],
        });
        return;
      }

      showAppMessage({
        type: APP_MESSAGE_TYPE.ERROR,
        source: APP_MESSAGE_SOURCE.API,
        code: "UNKNOWN",
        message: CREATE_SESSION_ERROR_MESSAGE.UNKNOWN,
      });
    } finally {
      setSubmitPhase("idle");
    }
  };

  return (
    <div className="min-h-dvh bg-zinc-50">
      <HeaderShell left={<GnbBrand />} right={<GnbGuestStatus />} />

      <main className="flex min-h-[calc(100dvh-64px)] items-center justify-center px-4">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-sm rounded-xl border bg-white p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold">닉네임으로 시작하기</h2>
          <p className="mt-1 text-sm text-zinc-600">
            닉네임만 정하면 바로 공략을 확인할 수 있습니다.
          </p>

          <div className="mt-4">
            <label htmlFor="nickname" className="mb-1 block text-sm font-medium">
              닉네임
            </label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              value={inputNickname}
              onChange={(e) => {
                setInputNickname(e.target.value);
                setFormMessage(null);
              }}
              placeholder="닉네임을 입력하세요"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            {formMessage && <p className="mt-2 text-sm text-red-600">{formMessage}</p>}
          </div>

          <ActionPrimaryButton
            type="submit"
            disabled={isSubmitting}
            loading={isSubmitting}
            className="mt-4 w-full"
          >
            시작하기
          </ActionPrimaryButton>
        </form>
      </main>
    </div>
  );
}
