// src/services/sessionResolver.ts

export class SessionRequiredError extends Error {
  constructor() {
    super("SESSION_REQUIRED");
    this.name = "SessionRequiredError";
  }
}

// 쿠키 기반 방식에서는 서비스 레이어에서의 세션 누락 검사가 불필요해짐.
// export function getSessionUserIdOrThrow(): UserId {
//   const session = useSessionStore.getState().session;
//   if (!session?.userId) throw new SessionRequiredError();
//   return session.userId as UserId;
// }
