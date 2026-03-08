// e2e/specs/session-expired-on-submit.spec.ts
import { test, expect } from "@playwright/test";
import { AUTH_FILE, clearAccessToken, clearAuthCompletely } from "../fixtures/auth";

test.describe("session expiration", () => {
  test.use({ storageState: AUTH_FILE });

  test("access_token 제거 후 보호 페이지 재진입 시 로그인으로 이동한다", async ({ page }) => {
    await page.goto("/guides");

    await clearAccessToken(page);

    await page.goto("/guides/new");

    await expect(page).toHaveURL(/(login|next=)/);
  });

  test("세션이 완전히 만료된 상태에서 작성 제출 시 로그인으로 리다이렉트된다", async ({ page }) => {
    const title = `세션 만료 테스트 ${Date.now()}`;
    const body = "session expired test";

    await page.goto("/guides/new");

    await page.getByLabel("제목").fill(title);
    await page.getByLabel("게임").selectOption("엘든링");
    await page.getByLabel("본문").fill(body);

    await clearAuthCompletely(page);

    await page.getByRole("button", { name: "공략 등록" }).click();

    await expect(page).toHaveURL(/(login|next=)/);
  });
});
