// e2e/specs/guide-not-found.spec.ts
import { test, expect } from "@playwright/test";
import { AUTH_FILE } from "../fixtures/auth";
import { createAuthedApiContext, createGuide, deleteGuide } from "../fixtures/guideApi";
import { GUIDE_DETAIL_ERROR_MESSAGE } from "../../src/constants/errorMessages";
import type { CreateGuideRequestDto } from "../../src/types/guide";

test.use({ storageState: AUTH_FILE });

test("존재하지 않는 공략글 상세 접근 시 not found 메시지를 표시한다", async ({ page, baseURL }) => {
  const api = await createAuthedApiContext(baseURL);

  const payload: CreateGuideRequestDto = {
    title: `E2E 삭제 테스트 ${Date.now()}`,
    body: "삭제 후 not found 검증용 본문",
    game: "엘든링",
  };

  const guideId = await createGuide(api, payload);
  await deleteGuide(api, guideId);
  await api.dispose();

  await page.goto(`/guides/${guideId}`);

  await expect(page.getByText(GUIDE_DETAIL_ERROR_MESSAGE.NOT_FOUND)).toBeVisible();
});
