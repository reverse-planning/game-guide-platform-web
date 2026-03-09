// e2e/specs/auth-redirect.spec.ts
import { test, expect } from "@playwright/test";
import { EMPTY_STORAGE_STATE } from "../fixtures/auth";

test.use({ storageState: EMPTY_STORAGE_STATE });

test("비로그인 상태에서 보호된 작성 페이지 접근 시 로그인 흐름으로 이동한다", async ({ page }) => {
  await page.goto("/guides/new");

  await expect(page).toHaveURL(/next=/);
  await expect(page).not.toHaveURL(/\/guides\/new$/);
});
