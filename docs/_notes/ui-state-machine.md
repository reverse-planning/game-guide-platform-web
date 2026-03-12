# UI State Machine 규칙

이 문서는 React 페이지에서 비동기 요청(fetch / submit)의 **UI 상태 전이 규칙**을 정리한다.

에러의 의미 해석과 계층 구조는 다음 문서를 따른다.

```
/notes/error-handling-rules.md
```

이 문서는 **에러 의미 해석이 아니라 UI 상태 표현 규약**을 다룬다.

---

# 1. Fetch State

조회 요청(fetch)의 상태는 다음 세 단계로 표현한다.

```ts
export type FetchState<T, E extends string> =
  | { type: "loading" }
  | { type: "success"; data: T }
  | { type: "error"; code: E };
```

상태 전이는 다음과 같다.

```
loading
  → success
  → error
```

설명:

- `loading` : 요청 진행 중
- `success` : 요청 성공
- `error` : 요청 실패

`error.code`는 **UI 메시지 매핑을 위한 코드**이다.

---

# 2. Submit State

폼 제출(submit)의 상태는 다음과 같이 정의한다.

```ts
export type SubmitState<E extends string> =
  | { type: "idle" }
  | { type: "submitting" }
  | { type: "error"; code: E };
```

상태 전이

```
idle
  → submitting
  → error
  → idle
```

설명:

- `idle` : 제출 대기
- `submitting` : 요청 진행 중
- `error` : 제출 실패

---

# 3. 메시지 관리 원칙

`asyncState`는 **상태와 코드만 관리**한다.

실제 UI에 표시할 문자열은 다음 방식 중 하나로 관리한다.

## 방식 1: 코드 → 메시지 매핑

```ts
ERROR_MESSAGE[state.code];
```

예:

```ts
UPDATE_GUIDE_ERROR_MESSAGE[err.code];
```

## 방식 2: 별도 UI 메시지 상태

페이지에서 별도 상태를 유지할 수도 있다.

예:

```ts
bannerMessage;
pageErrorMessage;
```

이 방식은 다음 상황에서 유용하다.

- 복합 메시지
- 서버 메시지 표시
- 여러 에러 상태 통합

---

# 4. Submit Error 유지 정책

액션 실패 후 메시지를 **재시도 전까지 유지**하는 정책을 사용할 수 있다.

이 경우 SubmitState는 다음 상태를 유지한다.

```
{ type: "error", code }
```

문제 상황:

```ts
finally {
  setSubmit({ type: "idle" });
}
```

이 코드는

```
error → idle
```

로 바뀌어 **에러 메시지가 즉시 사라지는 문제**를 만든다.

---

# 5. 권장 패턴

`finally`에서 submitting 상태일 때만 idle로 복귀한다.

```ts
finally {
  setSubmit((prev) =>
    prev.type === "submitting" ? { type: "idle" } : prev
  );
}
```

이 패턴은 다음을 보장한다.

- error 상태 유지
- 메시지 유지
- 재시도 시 상태 정상 복귀

---

# 6. 설계 원칙

UI 상태는 다음 원칙을 따른다.

```
상태
→ asyncState

에러 의미
→ error code

UI 문자열
→ message mapping
```

즉

```
상태와 메시지를 분리한다
```

---

# 한 줄 정리

`asyncState`는 **에러 해석 계층이 아니라 UI 비동기 상태(state machine)를 표현하는 규약이다.**
