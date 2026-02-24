import { RouterProvider } from "react-router";
import { router } from "./routes/route.tsx";
import * as Sentry from "@sentry/react";

export default function App() {
  return (
    <Sentry.ErrorBoundary fallback={<p>문제가 발생했습니다.</p>}>
      <RouterProvider router={router} />
    </Sentry.ErrorBoundary>
  );
}
