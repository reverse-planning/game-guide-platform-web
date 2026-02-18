import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ENV } from "./constants/env.ts";

async function enableMocking() {
  if (ENV.APP_MODE !== "mock") {
    return;
  }

  const { worker } = await import("./mocks/browser");
  return worker.start();
}

enableMocking()
  .catch((error) => {
    console.warn("[MSW] Failed to start:", error);
  })
  .finally(() => {
    createRoot(document.getElementById("root")!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  });
