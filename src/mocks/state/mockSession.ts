// src/mocks/state/mockSession.ts
import type { Session } from "@/stores/sessionSlice";

let mockSession: Session | null = null;

export function getMockSession() {
  return mockSession;
}

export function setMockSession(session: Session) {
  mockSession = session;
}

export function clearMockSession() {
  mockSession = null;
}
