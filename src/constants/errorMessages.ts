// src/constants/errorMessages.ts
import type { CreateGuideErrorCode } from "@/services/guideCreateService";
import type { DeleteGuideErrorCode } from "@/services/guideDeleteService";
import type { GuideDetailErrorCode } from "@/services/guideDetailService";
import type { ListGuidesErrorCode } from "@/services/guideListService";
import type { UpdateGuideErrorCode } from "@/services/guideUpdateService";
import type { CreateSessionErrorCode } from "@/services/sessionService";

export const CREATE_SESSION_ERROR_MESSAGE = {
  NICKNAME_DUPLICATE: "이미 사용 중인 닉네임입니다.",
  UNKNOWN: "로그인에 실패했습니다. 잠시 후 다시 시도해주세요.",
} satisfies Record<CreateSessionErrorCode, string>;

export const CREATE_GUIDE_ERROR_MESSAGE = {
  BAD_REQUEST: "입력값 형식이 올바르지 않습니다. 필수 값을 확인해주세요.",
  UNKNOWN: "등록에 실패했습니다. 잠시 후 다시 시도해주세요.",
} satisfies Record<CreateGuideErrorCode, string>;

export const GUIDE_DETAIL_ERROR_MESSAGE = {
  NOT_FOUND: "존재하지 않는 공략입니다.",
  UNKNOWN: "공략을 불러오지 못했습니다.",
} satisfies Record<GuideDetailErrorCode, string>;

export const LIST_GUIDES_ERROR_MESSAGE = {
  RATE_LIMITED: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
  UNKNOWN: "목록을 불러오지 못했습니다.",
} satisfies Record<ListGuidesErrorCode, string>;

export const UPDATE_GUIDE_ERROR_MESSAGE = {
  BAD_REQUEST: "입력값을 다시 확인해주세요.",
  NOT_FOUND: "존재하지 않는 공략글입니다.",
  UNKNOWN: "알 수 없는 오류가 발생했습니다.",
} satisfies Record<UpdateGuideErrorCode, string>;

export const DELETE_GUIDE_ERROR_MESSAGE = {
  NOT_FOUND: "이미 삭제된 공략글입니다.",
  FORBIDDEN: "삭제 권한이 없습니다.",
  UNKNOWN: "알 수 없는 오류가 발생했습니다.",
} satisfies Record<DeleteGuideErrorCode, string>;
