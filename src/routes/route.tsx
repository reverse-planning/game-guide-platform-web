import { createBrowserRouter, Outlet, redirect } from "react-router";
import { useSessionStore } from "@/stores/sessionSlice.ts";
import GuideList from "@/pages/GuideList.tsx";
import GuideCreate from "@/pages/GuideCreate.tsx";
import Home from "@/pages/Home.tsx";
import NotFound from "@/pages/NotFound.tsx";
import GuideDetail from "@/pages/GuideDetail.tsx";
import GuideEdit from "@/pages/GuideEdit.tsx";
import { redirectToLogin } from "./utils/redirectToLogin";

function redirectAuthedHome() {
  const { session } = useSessionStore.getState();
  if (session?.userId) throw redirect("/guides");

  return null;
}

function requireSession({ request }: { request: Request }) {
  const { session } = useSessionStore.getState();
  if (session?.userId) return null;

  throw redirectToLogin(request.url);
}

function ProtectedLayout() {
  return <Outlet />;
}

export const router = createBrowserRouter([
  { path: "/", loader: redirectAuthedHome, element: <Home /> },

  {
    path: "/guides",
    loader: requireSession,
    element: <ProtectedLayout />,
    children: [
      { index: true, element: <GuideList /> },
      { path: "new", element: <GuideCreate /> },
      { path: ":guideId", element: <GuideDetail /> },
      { path: ":guideId/edit", element: <GuideEdit /> },
    ],
  },

  { path: "*", element: <NotFound /> },
]);
