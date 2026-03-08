// e2e/fixtures/guideApi.ts
import fs from "node:fs/promises";
import { expect, request, type APIRequestContext } from "@playwright/test";
import type { CreateGuideRequestDto, GuideListResponseDto } from "../../src/types/guide";
import { ACCESS_TOKEN_KEY, AUTH_FILE } from "./auth";

type MinimalGuideListItem = Pick<GuideListResponseDto["content"][number], "id" | "title">;

type PlaywrightStorageState = {
  cookies: Array<{
    name: string;
    value: string;
    domain: string;
    path: string;
    expires: number;
    httpOnly: boolean;
    secure: boolean;
    sameSite: "Lax" | "None" | "Strict";
  }>;
  origins: Array<{
    origin: string;
    localStorage: Array<{ name: string; value: string }>;
  }>;
};

function extractItems(dto: GuideListResponseDto): MinimalGuideListItem[] {
  return dto.content ?? [];
}

async function readAccessTokenFromAuthFile(): Promise<string> {
  const raw = await fs.readFile(AUTH_FILE, "utf-8");
  const state = JSON.parse(raw) as PlaywrightStorageState;

  for (const origin of state.origins) {
    const token = origin.localStorage.find((entry) => entry.name === ACCESS_TOKEN_KEY);
    if (token) return token.value;
  }

  throw new Error(`"${ACCESS_TOKEN_KEY}" not found in ${AUTH_FILE}`);
}

export async function createAuthedApiContext(baseURL?: string): Promise<APIRequestContext> {
  const accessToken = await readAccessTokenFromAuthFile();

  return request.newContext({
    baseURL,
    storageState: AUTH_FILE,
    extraHTTPHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function listGuidesByQuery(
  api: APIRequestContext,
  query: string,
): Promise<MinimalGuideListItem[]> {
  const response = await api.get("/api/guides", {
    params: {
      query,
      page: 0,
      size: 100,
      sort: "updatedAt,desc",
    },
  });

  expect(response.ok()).toBeTruthy();

  const json = (await response.json()) as GuideListResponseDto;
  return extractItems(json);
}

export async function deleteGuidesByTitlePrefix(
  api: APIRequestContext,
  prefix: string,
): Promise<void> {
  const items = await listGuidesByQuery(api, prefix);

  for (const item of items) {
    if (!item.title.startsWith(prefix)) continue;

    const response = await api.delete(`/api/guides/${item.id}`);

    if (!response.ok() && response.status() !== 404) {
      throw new Error(`Failed to delete guide ${item.id}: ${response.status()}`);
    }
  }
}

export async function createGuide(
  api: APIRequestContext,
  payload: CreateGuideRequestDto,
): Promise<number> {
  const response = await api.post("/api/guides", {
    data: payload,
  });

  expect(response.ok()).toBeTruthy();

  return (await response.json()) as number;
}

export async function deleteGuide(api: APIRequestContext, guideId: number): Promise<void> {
  const response = await api.delete(`/api/guides/${guideId}`);
  expect(response.ok() || response.status() === 404).toBeTruthy();
}
