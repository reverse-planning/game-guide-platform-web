// e2e/auth.setup.ts
import { test as setup, expect } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { AUTH_FILE } from "./fixtures/auth";

setup("authenticate", async ({ page }) => {
  await fs.mkdir(path.dirname(AUTH_FILE), { recursive: true });

  const nickname = `e2e-${Date.now().toString().slice(-6)}`;

  await page.goto("/");
  await page.getByLabel("닉네임").fill(nickname);
  await page.getByRole("button", { name: "시작하기" }).click();

  await expect(page).toHaveURL(/\/guides$/);

  await page.context().storageState({ path: AUTH_FILE });
});
