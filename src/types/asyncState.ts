// src/types/asyncState.ts
export type FetchState<T, E extends string> =
  | { type: "loading" }
  | { type: "success"; data: T }
  | { type: "error"; code: E };

export type SubmitState<E extends string> =
  | { type: "idle" }
  | { type: "submitting" }
  | { type: "error"; code: E };
