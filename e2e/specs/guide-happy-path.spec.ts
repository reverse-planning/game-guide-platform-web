// e2e/specs/guide-happy-path.spec.ts
import { test, expect } from "@playwright/test";
import { AUTH_FILE } from "../fixtures/auth";

test.use({ storageState: AUTH_FILE });

test("로그인 후 공략 생성 → 검색 → 상세 → 수정", async ({ page }) => {
  const title = `E2E 테스트 게시글 ${Date.now()}`;
  const body = `E2E 본문 ${Date.now()}`;
  const updatedBody = `E2E 수정 본문 ${Date.now()}`;

  await page.goto("/guides/new");

  await page.getByLabel("제목").fill(title);
  await page.getByLabel("게임").selectOption("엘든링");
  await page.getByLabel("본문").fill(body);
  await page.getByRole("button", { name: "공략 등록" }).click();

  await expect(page).toHaveURL(/\/guides$/);

  await page.getByPlaceholder("공략 검색 (제목/본문/게임)").fill("E2E");
  await expect(page.getByRole("link", { name: title })).toBeVisible();

  await page.getByRole("link", { name: title }).click();

  await expect(page).toHaveURL(/\/guides\/\d+$/);
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await expect(page.getByText(body)).toBeVisible();

  await page.getByRole("link", { name: "수정" }).click();
  await expect(page).toHaveURL(/\/guides\/\d+\/edit$/);

  await page.getByLabel("본문").fill(updatedBody);
  await page.getByRole("button", { name: "저장" }).click();

  await expect(page.getByText(updatedBody)).toBeVisible();
});
