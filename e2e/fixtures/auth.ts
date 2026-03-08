// e2e/fixtures/auth.ts
import { expect, type Page } from "@playwright/test";
import path from "node:path";

export const AUTH_FILE = path.resolve("playwright/.auth/user.json");

export const EMPTY_STORAGE_STATE = {
  cookies: [],
  origins: [],
};

export const ACCESS_TOKEN_KEY = "access_token";
export const NICKNAME_HINT_KEY = "nickname_hint";
const REFRESH_COOKIE_KEY = "refreshToken";

type LoginByUiOptions = {
  nickname?: string;
  redirectPathPattern?: RegExp;
};

export async function loginByUi(
  page: Page,
  options?: LoginByUiOptions,
): Promise<{ nickname: string }> {
  const nickname = options?.nickname ?? `e2e-${Date.now().toString().slice(-6)}`;
  const redirectPathPattern = options?.redirectPathPattern ?? /\/guides$/;

  await page.goto("/");

  await page.getByLabel("닉네임").fill(nickname);
  await page.getByRole("button", { name: "로그인" }).click();

  await expect(page).toHaveURL(redirectPathPattern);

  return { nickname };
}

export async function clearAccessToken(page: Page): Promise<void> {
  await page.evaluate(
    ({ accessTokenKey }) => {
      window.localStorage.removeItem(accessTokenKey);
    },
    { accessTokenKey: ACCESS_TOKEN_KEY },
  );
}

export async function clearClientStorage(page: Page): Promise<void> {
  await page.evaluate(
    ({ accessTokenKey, nicknameHintKey }) => {
      window.localStorage.removeItem(accessTokenKey);
      window.localStorage.removeItem(nicknameHintKey);
      window.sessionStorage.clear();
    },
    {
      accessTokenKey: ACCESS_TOKEN_KEY,
      nicknameHintKey: NICKNAME_HINT_KEY,
    },
  );
}

export async function clearAuthCompletely(page: Page): Promise<void> {
  await clearClientStorage(page);

  const context = page.context();
  const cookies = await context.cookies();

  const refreshCookies = cookies.filter((cookie) => cookie.name === REFRESH_COOKIE_KEY);

  if (refreshCookies.length === 0) return;

  await context.clearCookies();

  const remainCookies = cookies.filter((cookie) => cookie.name !== REFRESH_COOKIE_KEY);

  if (remainCookies.length > 0) {
    await context.addCookies(remainCookies);
  }
}
