// src/routes/utils/redirectToLogin.ts
import { redirect } from "react-router";
import { buildLoginUrl } from "./buildLoginUrl";

export function redirectToLogin(requestUrl: string): Response {
  return redirect(buildLoginUrl(requestUrl));
}
