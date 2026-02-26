// src/pages/GuideEdit.tsx
import { useNavigate, useParams } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { getGuideDetail, GuideDetailError } from "@/services/guideDetailService";
import { updateGuide, UpdateGuideError } from "@/services/guideUpdateService";
import { GUIDE_DETAIL_ERROR_MESSAGE, UPDATE_GUIDE_ERROR_MESSAGE } from "@/constants/errorMessages";
import { HeaderShell } from "@/components/shell/HeaderShell";
import { GnbBrand } from "@/components/gnb/GnbBrand";
import { PageShell } from "@/components/shell/PageShell";
import { SessionRequiredError } from "@/services/sessionResolver";
import { ActionSecondaryLink } from "@/components/actions/ActionSecondaryLink";
import { ActionPrimaryButton } from "@/components/actions/ActionPrimaryButton";
import { GAMES, type GameName } from "@/constants/games";
import { buildLoginUrl } from "@/routes/utils/buildLoginUrl";
import { UI_MESSAGE } from "@/constants/uiMessages";
import { ROUTE_MESSAGE } from "@/constants/routeMessages";

export type FormState = {
  title: string;
  game: GameName;
  body: string;
};

type PageState =
  | { type: "loading" }
  | { type: "ready"; form: FormState }
  | { type: "saving"; form: FormState }
  | { type: "error"; message: string };

const GUIDE_EDIT_FORM_ID = "guide-edit-form";

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
        setState({ type: "error", message: ROUTE_MESSAGE.INVALID_GUIDE_ID });
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
            body: data.body,
          },
        });
      } catch (err) {
        if (ignore) return;

        // ✅ 세션 누락: 홈으로 보내고 next로 복귀 가능하게
        if (err instanceof SessionRequiredError) {
          navigate(buildLoginUrl(window.location.href), { replace: true });
          return;
        }
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
  }, [id, navigate]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state.type !== "ready") return;

    setBanner(null);

    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("title") ?? "").trim();
    const game = String(fd.get("game") ?? "").trim() as GameName;
    const body = String(fd.get("body") ?? "").trim();

    if (!title || !game || !body) {
      setBanner(UI_MESSAGE.REQUIRED_FIELDS);
      return;
    }

    setState({ type: "saving", form: { title, game, body } });

    try {
      await updateGuide(id, { title, game, body });
      navigate(`/guides/${id}`, { replace: true });
    } catch (err) {
      // ✅ 세션 누락: 홈으로 보내고 next로 복귀 가능하게
      if (err instanceof SessionRequiredError) {
        navigate(buildLoginUrl(window.location.href), { replace: true });
        return;
      }
      if (err instanceof UpdateGuideError) {
        setBanner(UPDATE_GUIDE_ERROR_MESSAGE[err.code]);
      } else {
        setBanner(UPDATE_GUIDE_ERROR_MESSAGE.UNKNOWN);
      }
      setState({ type: "ready", form: { title, game, body } });
    }
  };

  if (state.type === "loading") {
    return (
      <div className="min-h-dvh bg-zinc-50 p-4">
        <div className="mx-auto max-w-3xl rounded-xl border bg-white p-6 shadow-sm text-sm">
          {UI_MESSAGE.FETCHING}
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
    <PageShell>
      <HeaderShell
        left={<GnbBrand />}
        right={
          <div className="flex items-center gap-2">
            <ActionSecondaryLink to={`/guides/${id}`}>취소</ActionSecondaryLink>
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

          {banner && (
            <div className="mt-4 rounded-lg border p-3 text-sm text-red-600">{banner}</div>
          )}

          <form id={GUIDE_EDIT_FORM_ID} onSubmit={onSubmit} className="mt-6 space-y-4">
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
              <select
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
              <label className="mb-1 block text-sm font-medium">본문</label>
              <textarea
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
