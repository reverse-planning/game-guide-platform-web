// src/services/sessionResolver.ts
import { useSessionStore } from "@/stores/sessionSlice";
import type { UserId } from "@/types/id";

export class SessionRequiredError extends Error {
  constructor() {
    super("SESSION_REQUIRED");
    this.name = "SessionRequiredError";
  }
}

export function getSessionUserIdOrThrow(): UserId {
  const session = useSessionStore.getState().session;
  if (!session?.userId) throw new SessionRequiredError();
  return session.userId as UserId;
}
