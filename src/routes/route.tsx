import { createBrowserRouter, Outlet, redirect } from "react-router";
import GuideList from "@/pages/GuideList.tsx";
import GuideCreate from "@/pages/GuideCreate.tsx";
import Home from "@/pages/Home.tsx";
import NotFound from "@/pages/NotFound.tsx";
import GuideDetail from "@/pages/GuideDetail.tsx";
import GuideEdit from "@/pages/GuideEdit.tsx";
import { redirectToLogin } from "./utils/redirectToLogin";
import { getAccessToken } from "@/services/tokenStorage";
import { GlobalBanner } from "@/components/feedback/GlobalBanner";

function redirectAuthedHome() {
  const accessToken = getAccessToken();
  if (accessToken) throw redirect("/guides");

  return null;
}

function requireSession({ request }: { request: Request }) {
  const accessToken = getAccessToken();
  if (accessToken) return null;

  throw redirectToLogin(request.url);
}

function RootLayout() {
  return (
    <>
      <GlobalBanner />
      <Outlet />
    </>
  );
}

function ProtectedLayout() {
  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
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
    ],
  },
]);
