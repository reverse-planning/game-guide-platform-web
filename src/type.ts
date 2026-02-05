// src/type.ts
// Core domain types
export interface User {
  id: string;
  nickname: string;
}

export interface Guide {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// API Request/Response types
export interface CreateUserRequest {
  nickname: string;
}

export interface CreateUserResponse {
  userId: string;
  nickname: string;
}

export interface CreateGuideRequest {
  title: string;
  content: string;
  authorId: string;
}

export interface CreateGuideResponse {
  guide: Guide;
}

export interface GetGuidesRequest {
  cursor?: string;
  limit?: number;
}

export interface GetGuidesResponse {
  items: Guide[];
  nextCursor: string | null;
}
