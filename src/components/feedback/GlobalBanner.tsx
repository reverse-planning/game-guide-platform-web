import { useEffect } from "react";
import { useAppMessageStore } from "@/stores/appMessageSlice";
import { APP_MESSAGE_TYPE } from "@/constants/appMessage";

export const GLOBAL_BANNER_AUTO_CLOSE_MS = 3000;

export function GlobalBanner() {
  const { currentAppMessage, clearAppMessage } = useAppMessageStore();

  useEffect(() => {
    if (!currentAppMessage) return;

    const timer = window.setTimeout(() => {
      clearAppMessage();
    }, GLOBAL_BANNER_AUTO_CLOSE_MS);

    return () => window.clearTimeout(timer);
  }, [currentAppMessage, clearAppMessage]);

  if (!currentAppMessage) return null;

  console.log(currentAppMessage);

  const toneClassName = (() => {
    switch (currentAppMessage.type) {
      case APP_MESSAGE_TYPE.ERROR:
        return "border-red-200 bg-red-50 text-red-700";

      case APP_MESSAGE_TYPE.SUCCESS:
        return "border-green-200 bg-green-50 text-green-700";

      case APP_MESSAGE_TYPE.INFO:
        return "border-blue-200 bg-blue-50 text-blue-700";

      default:
        return "border-zinc-200 bg-white text-zinc-700";
    }
  })();

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-1000 flex justify-center px-4">
      <div
        role="alert"
        aria-live="polite"
        className={`pointer-events-auto w-full max-w-3xl rounded-xl border px-4 py-3 shadow-lg ${toneClassName}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium">{currentAppMessage.message}</p>

            <p className="mt-1 text-xs opacity-80">
              {currentAppMessage.source}
              {currentAppMessage.code ? ` · ${currentAppMessage.code}` : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={clearAppMessage}
            className="shrink-0 rounded-md px-2 py-1 text-xs font-medium hover:bg-black/5"
            aria-label="배너 닫기"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
