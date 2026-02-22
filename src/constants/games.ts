// src/constants/games.ts
export const GAMES = [
  "엘든링",
  "발더스 게이트 3",
  "리그 오브 레전드",
  "오버워치",
  "다크 소울 3",
  "세키로",
  "몬스터 헌터 월드",
  "스타듀 밸리",
  "프로젝트 세카이",
  "쿠키런 킹덤",
] as const;

export type GameName = (typeof GAMES)[number];
