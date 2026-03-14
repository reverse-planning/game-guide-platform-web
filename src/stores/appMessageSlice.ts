// src/stores/appMessageSlice.ts
import { create } from "zustand";
import type { AppMessage } from "@/types/appMessage";

type AppMessageState = {
  currentAppMessage: AppMessage | null;
  showAppMessage: (message: AppMessage) => void;
  clearAppMessage: () => void;
};

export const useAppMessageStore = create<AppMessageState>((set) => ({
  currentAppMessage: null,

  showAppMessage: (message) => set({ currentAppMessage: message }),
  clearAppMessage: () => set({ currentAppMessage: null }),
}));
