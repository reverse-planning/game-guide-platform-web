// src/services/responseErrors.ts
export type ResponseShapeErrorCode =
  | "INVALID_RESPONSE_SHAPE"
  | "INVALID_GUIDE_LIST_ITEM"
  | "INVALID_GUIDE_LIST_RESPONSE"
  | "INVALID_GUIDE_DETAIL_RESPONSE"
  | "INVALID_CREATE_GUIDE_RESPONSE"
  | "INVALID_CREATE_SESSION_RESPONSE"
  | "INVALID_GET_SESSION_RESPONSE";

export class ResponseShapeError extends Error {
  code: ResponseShapeErrorCode;

  constructor(code: ResponseShapeErrorCode = "INVALID_RESPONSE_SHAPE", message?: string) {
    super(message ?? code);
    this.name = "ResponseShapeError";
    this.code = code;
  }
}
