// stores/sessionSelectors.ts
import { useSessionStore } from "./sessionSlice";

export function useSessionView() {
  const viewer = useSessionStore((s) => s.viewer);
  const accessToken = useSessionStore((s) => s.accessToken);

  return {
    // ✅ AT가 있으면 인증됨(서버 정책이 Bearer AT면 이게 기준)
    isAuthed: Boolean(accessToken),

    // 필요하면 nickname만 제공
    sessionNickname: viewer?.nickname?.trim() ?? "",
  };
}
