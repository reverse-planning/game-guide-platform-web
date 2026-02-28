// src/mocks/state/mockSession.ts
import type { SessionResponseDto } from "@/types/session";

let mockSession: SessionResponseDto | null = null;

export function getMockSession() {
  return mockSession;
}

export function setMockSession(session: SessionResponseDto | null) {
  mockSession = session;
}

export function clearMockSession(): void {
  mockSession = null;
}
