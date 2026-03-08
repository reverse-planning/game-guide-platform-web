// src/types/session.ts
/* =========================
 * Session - DTO
 * ========================= */

// POST /api/session response
export type CreateSessionResponseDto = {
  nickname: string;
  accessToken: string;
};

// GET /api/session response
export type GetSessionResponseDto = {
  nickname: string;
};

// POST /api/reissue response
export type ReissueResponseDto = {
  nickname: string; // deprecated
  accessToken: string;
};

/* =========================
 * Session - View Model
 * ========================= */

export type Viewer = {
  nickname: string;
};
