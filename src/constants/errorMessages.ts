// src/constants/errorMessages.ts
import type { CreateGuideErrorCode } from "@/services/guideCreateService";
import type { DeleteGuideErrorCode } from "@/services/guideDeleteService";
import type { GuideDetailErrorCode } from "@/services/guideDetailService";
import type { ListGuidesErrorCode } from "@/services/guideListService";
import type { UpdateGuideErrorCode } from "@/services/guideUpdateService";
import type { CreateSessionErrorCode } from "@/services/sessionService";

export const CREATE_SESSION_ERROR_MESSAGE: Record<CreateSessionErrorCode, string> = {
  NICKNAME_DUPLICATE: "이미 사용 중인 닉네임입니다.",
  NETWORK: "네트워크가 불안정합니다. 잠시 후 다시 시도해주세요.",
  SERVER: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  UNKNOWN: "로그인에 실패했습니다. 잠시 후 다시 시도해주세요.",
};

export const CREATE_GUIDE_ERROR_MESSAGE: Record<CreateGuideErrorCode, string> = {
  BAD_REQUEST: "입력값 형식이 올바르지 않습니다. 필수 값을 확인해주세요.",
  NETWORK: "네트워크가 불안정합니다. 잠시 후 다시 시도해주세요.",
  SERVER: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  UNKNOWN: "등록에 실패했습니다. 잠시 후 다시 시도해주세요.",
};

export const GUIDE_DETAIL_ERROR_MESSAGE: Record<GuideDetailErrorCode, string> = {
  NOT_FOUND: "존재하지 않는 공략입니다.",
  NETWORK: "네트워크가 불안정합니다. 잠시 후 다시 시도해주세요.",
  SERVER: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  UNKNOWN: "공략을 불러오지 못했습니다.",
};

export const LIST_GUIDES_ERROR_MESSAGE: Record<ListGuidesErrorCode, string> = {
  RATE_LIMITED: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
  NETWORK: "네트워크가 불안정합니다. 잠시 후 다시 시도해주세요.",
  SERVER: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  UNKNOWN: "목록을 불러오지 못했습니다.",
};

export const UPDATE_GUIDE_ERROR_MESSAGE: Record<UpdateGuideErrorCode, string> = {
  BAD_REQUEST: "입력값을 다시 확인해주세요.",
  NOT_FOUND: "존재하지 않는 공략글입니다.",
  NETWORK: "네트워크 연결을 확인해주세요.",
  SERVER: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  UNKNOWN: "알 수 없는 오류가 발생했습니다.",
};

export const DELETE_GUIDE_ERROR_MESSAGE: Record<DeleteGuideErrorCode, string> = {
  NOT_FOUND: "이미 삭제된 공략글입니다.",
  NETWORK: "네트워크 연결을 확인해주세요.",
  SERVER: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  UNKNOWN: "알 수 없는 오류가 발생했습니다.",
};
