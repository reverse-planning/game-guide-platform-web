// src/stores/sessionSlice.ts
import type { Viewer } from "@/types/session";
import { create } from "zustand";

// 메모리 세션 제어 (SSOT는 서버, store는 캐시/뷰모델)
// Viewer: 현재 화면 기준 사용자(view model)
interface SessionState {
  viewer: Viewer | null;

  setViewer: (viewer: Viewer | null) => void;
  resetSessionCache: () => void;

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
  viewer: null,

  setViewer: (viewer) => set({ viewer }),
  resetSessionCache: () => set({ viewer: null }),

  getNicknameHint: () => safeGet(NICKNAME_KEY),
  setNicknameHint: (nickname) => safeSet(NICKNAME_KEY, nickname),
  resetNicknameHint: () => safeRemove(NICKNAME_KEY),
}));
