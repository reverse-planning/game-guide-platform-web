/* =========================
 * Session - DTO
 * ========================= */

// POST /api/session response
export type SessionResponseDto = {
  userId: number;
  nickname: string;
  accessToken: string;
};

export type ReissueResponseDto = {
  userId: number;
  nickname: string;
  accessToken: string;
};

/* =========================
 * Session - View Model
 * ========================= */

export type Viewer = {
  nickname: string;
};
