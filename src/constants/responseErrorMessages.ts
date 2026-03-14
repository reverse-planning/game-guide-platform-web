// src/constants/responseErrorMessages.ts
import type { ResponseShapeErrorCode } from "@/services/responseErrors";

export const RESPONSE_SHAPE_ERROR_MESSAGE = {
  INVALID_RESPONSE_SHAPE: "응답 형식이 올바르지 않습니다.",
  INVALID_GUIDE_LIST_ITEM: "목록 응답 형식이 올바르지 않습니다.",
  INVALID_GUIDE_LIST_RESPONSE: "목록 응답 형식이 올바르지 않습니다.",
  INVALID_GUIDE_LIST_NEXT_PAGE: "목록 응답 형식이 올바르지 않습니다.",
  INVALID_GUIDE_DETAIL_RESPONSE: "상세 응답 형식이 올바르지 않습니다.",
  INVALID_GUIDE_EDIT_DETAIL_RESPONSE: "수정 응답 형식이 올바르지 않습니다.",
  INVALID_CREATE_GUIDE_RESPONSE: "등록 응답 형식이 올바르지 않습니다.",
  INVALID_UPDATE_GUIDE_RESPONSE: "수정 응답 형식이 올바르지 않습니다.",
  INVALID_CREATE_SESSION_RESPONSE: "로그인 응답 형식이 올바르지 않습니다.",
  INVALID_GET_SESSION_RESPONSE: "세션 응답 형식이 올바르지 않습니다.",
} satisfies Record<ResponseShapeErrorCode, string>;
