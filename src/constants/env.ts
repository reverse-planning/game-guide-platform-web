// src/constants/env.ts
export const ENV = {
  MODE: import.meta.env.MODE,
  APP_MODE: import.meta.env.VITE_APP_MODE as "mock" | "real",
};
