// src/constants/uiMessages.ts
export const UI_STATUS_MESSAGE = {
  LOADING: "불러오는 중...",
  SUBMITTING: "처리 중...",
  LOGGING_OUT: "로그아웃 중...",
  DELETING: "삭제 중...",
} as const;

export const UI_VALIDATION_MESSAGE = {
  REQUIRED_FIELDS: "필수 항목을 모두 입력해주세요.",
  REQUIRED_NICKNAME: "닉네임을 입력해주세요.",
  INVALID_GAME: "올바른 게임을 선택해주세요.",
} as const;

export const UI_RESULT_MESSAGE = {
  LOAD_MORE_FAILED: "추가 로드에 실패했습니다.",
  END_OF_LIST: "마지막 콘텐츠입니다.",
  EMPTY_SEARCH_RESULT: "검색 결과가 없습니다.",
} as const;
