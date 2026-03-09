import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ENV } from "./constants/env.ts";
import * as Sentry from "@sentry/react";
import { bootstrap } from "./app/bootstrap.ts";

const shouldEnableSentry =
  Boolean(ENV.SENTRY_DSN) && (ENV.SENTRY_ENV === "production" || ENV.SENTRY_ENV === "preview");
const traceTargets = ["localhost", ENV.API_ORIGIN].filter(
  (v): v is string => typeof v === "string" && v.length > 0,
);

if (shouldEnableSentry) {
  Sentry.init({
    dsn: ENV.SENTRY_DSN,
    environment: ENV.SENTRY_ENV,
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
    tracePropagationTargets: traceTargets,
    tracesSampleRate: 0.1, // 처음엔 낮게(10%)
    replaysSessionSampleRate: 0.0, // 평소엔 안 찍고
    replaysOnErrorSampleRate: 1.0, // 에러 난 세션만 100% 기록
  });
}

bootstrap().finally(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
