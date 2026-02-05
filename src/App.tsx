import { RouterProvider } from "react-router";
import { router } from "./routes/route.tsx";

export default function App() {
  return <RouterProvider router={router} />;
}
