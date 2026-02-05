// src/stores/sessionSlice.ts
import { create } from "zustand";

export type Session = {
  userId: number;
  nickname: string;
};

interface SessionState {
  session: Session | null;

  // 메모리 세션 제어 (SSOT는 서버, store는 캐시/뷰모델)
  setSession: (session: Session) => void;
  resetSession: () => void;

  // localStorage는 보조(UX)만: 닉네임 프리필
  getNicknameHint: () => string | null;
  setNicknameHint: (nickname: string) => void;
  resetNicknameHint: () => void;
}

const NICKNAME_KEY = "nickname_hint";

function safeGet(key: string) {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}
function safeSet(key: string, value: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, value);
}
function safeRemove(key: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}

export const useSessionStore = create<SessionState>((set) => ({
  session: null,

  setSession: (session) => set({ session }),
  resetSession: () => set({ session: null }),

  getNicknameHint: () => safeGet(NICKNAME_KEY),
  setNicknameHint: (nickname) => safeSet(NICKNAME_KEY, nickname),
  resetNicknameHint: () => safeRemove(NICKNAME_KEY),
}));
