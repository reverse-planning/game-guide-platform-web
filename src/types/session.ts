import type { UserId } from "@/types/id";

/* =========================
 * Session - DTO
 * ========================= */

// POST /api/session response
export type SessionDto = {
  userId: UserId;
  nickname: string;
};

/* =========================
 * Session - View Model
 * ========================= */

export type Session = SessionDto;
