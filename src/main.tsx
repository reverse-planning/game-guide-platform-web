import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

const IS_DEMO = import.meta.env.VITE_APP_MODE === "demo";

async function enableMocking() {
  if (!IS_DEMO) {
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
