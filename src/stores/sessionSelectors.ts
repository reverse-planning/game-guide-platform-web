// stores/sessionSelectors.ts
import { useSessionStore } from "./sessionSlice";

export function useSessionView() {
  const viewer = useSessionStore((s) => s.viewer);

  return {
    isSignedIn: viewer !== null,
    sessionNickname: viewer?.nickname ?? "",
  };
}
