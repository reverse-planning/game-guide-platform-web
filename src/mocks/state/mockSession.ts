// src/mocks/state/mockSession.ts
import type { CreateSessionResponseDto } from "@/types/session";

let mockSession: CreateSessionResponseDto | null = null;

export function getMockSession() {
  return mockSession;
}

export function setMockSession(session: CreateSessionResponseDto | null) {
  mockSession = session;
}

export function clearMockSession(): void {
  mockSession = null;
}
