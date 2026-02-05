// stores/sessionSelectors.ts
import { useSessionStore } from "./sessionSlice";

export function useSessionView() {
  const session = useSessionStore((s) => s.session);
  return {
    isAuthed: Boolean(session?.userId),
    userId: session?.userId ?? null,
    sessionNickname: session?.nickname?.trim() ?? "",
  };
}
