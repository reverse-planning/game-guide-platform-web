// src/mocks/state/mockSession.ts
import type { Session } from "@/stores/sessionSlice";

let mockSession: Session | null = null;

export function getMockSession(): Session | null {
  return mockSession;
}

export function setMockSession(session: Session): void {
  mockSession = session;
}

export function clearMockSession(): void {
  mockSession = null;
}
