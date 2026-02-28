# 에러 처리 규칙 정리 (Service ↔ Page ↔ asyncState)

## 1) 레이어별 책임

### apiClient (전역 HTTP 계층)

- Axios interceptor에서 **전역(AppError)** 로 번역하는 케이스
  - `401` → `AppError("UNAUTHORIZED")` + 세션 스토어 reset
  - 네트워크 단절(응답 없음) → `AppError("NETWORK")`
  - `5xx` → `AppError("SERVER")`

- `4xx(401 제외)`는 **의미 해석이 필요**하므로 그대로(axios error) 내려보냄.

### Service (도메인/유스케이스 계층)

- 원칙: **전역 에러는 전역으로 유지**
  - `AppError`(UNAUTHORIZED/NETWORK/SERVER/UNKNOWN)는 **그대로 throw**
  - 즉, `NETWORK/SERVER`를 서비스에서 도메인 에러로 재번역하지 않음.

- 원칙: **도메인 의미가 있는 4xx만 도메인 에러로 번역**
  - 예) update: `400 → UpdateGuideError(BAD_REQUEST)`, `404 → UpdateGuideError(NOT_FOUND)`
  - 예) list: `429 → ListGuidesError(RATE_LIMITED)`

- 원칙: **요청 전 세션 누락은 도메인 실패가 아니라 “흐름 위반”**
  - `getSessionUserIdOrThrow()`에서 발생하는 `SessionRequiredError`는 **그대로 throw**

- 그 외 예기치 못한 케이스는 **도메인 UNKNOWN으로 고정**
  - 장점: “서비스 계층에서 매핑 누락/미정의”를 디버깅 관점에서 명확히 드러냄.

### Page(UI 호출부)

- 페이지는 최소 3종류를 분기 처리해야 함
  1. `SessionRequiredError` (요청 전 세션 누락)
     - `navigate(buildLoginUrl(window.location.href), { replace: true })`

  2. `AppError` (전역: UNAUTHORIZED/NETWORK/SERVER/UNKNOWN)
     - `UNAUTHORIZED`는 로그인 이동
     - 그 외는 `APP_ERROR_MESSAGE[err.code]`로 사용자 메시지 출력

  3. 도메인 에러 (예: `UpdateGuideError`, `GuideDetailError`)
     - `UPDATE_GUIDE_ERROR_MESSAGE[err.code]`처럼 도메인별 매핑으로 출력

- 처리 구조는 **if + early return** 형태를 권장
  - 상호배타적인 에러라도 early return이 분기 흐름을 짧게 유지하고 읽기 쉬움.

---

## 2) 메시지 매핑 정책

### 전역 메시지

- `APP_ERROR_MESSAGE: Record<AppErrorCode, string>`
  - UNAUTHORIZED / NETWORK / SERVER / UNKNOWN

- 전역(AppError)은 페이지에서 반드시 핸들링해야 메시지가 도메인 UNKNOWN과 섞이지 않음.

### 도메인 메시지

- 도메인 에러는 가능한 한 `4xx 의미 해석`만 포함
  - 예) `UpdateGuideErrorCode = "BAD_REQUEST" | "NOT_FOUND" | "UNKNOWN"`

- 서비스에서 `NETWORK/SERVER`를 도메인으로 재번역하지 않으면,
  - 도메인 메시지 테이블에서 NETWORK/SERVER 항목을 제거할 수 있음.

### 키 누락 방지

- 메시지 테이블은 `satisfies Record<..., string>`로 키 누락을 컴파일 타임에 방지
  - 예)
    - `export const UPDATE_GUIDE_ERROR_MESSAGE = { ... } satisfies Record<UpdateGuideErrorCode, string>`

---

## 3) asyncState 사용 규칙

### 타입 정의

```ts
export type FetchState<T, E extends string> =
  | { type: "loading" }
  | { type: "success"; data: T }
  | { type: "error"; code: E };

export type SubmitState<E extends string> =
  | { type: "idle" }
  | { type: "submitting" }
  | { type: "error"; code: E };
```

### 원칙

- `asyncState`는 **UI가 의존할 수 있는 “상태/코드”**를 표준화.
- “실제 화면에 보여줄 문자열”은 UI 정책에 따라
  - `code → message` 매핑으로 계산하거나,
  - 페이지에서 별도 문자열 상태(`banner`, `pageErrorMessage`)로 보관.

### SubmitState에서 에러를 유지해야 하는 정책

- “액션 실패 후 재시도 전까지 메시지 유지”라면,
  - `SubmitState`에 `{ type: "error", code }`를 유지하는 것이 자연스러움.

- 이때 `finally`에서 무조건 idle로 덮어쓰면 error 상태가 즉시 사라짐 → 안 맞음.

✅ 권장 패턴 (submitting일 때만 idle로 복귀)

```ts
finally {
  setSubmit((prev) => (prev.type === "submitting" ? { type: "idle" } : prev));
}
```

---

## 4) Page 예시 흐름 (요약)

### Fetch(조회)

1. route param 검증 실패 → fetch.error(code: INVALID_ROUTE) + 메시지
2. 서비스 호출
3. catch에서
   - SessionRequiredError → 로그인 이동
   - AppError
     - UNAUTHORIZED → 로그인 이동
     - NETWORK/SERVER/UNKNOWN → APP_ERROR_MESSAGE

   - 도메인 에러(예: GuideDetailError) → GUIDE_DETAIL_ERROR_MESSAGE

### Submit(수정)

1. 입력값 검증 실패 → submit.error(code: VALIDATION) + 메시지 유지
2. 서비스 호출
3. catch에서
   - SessionRequiredError → 로그인 이동
   - AppError
     - UNAUTHORIZED → 로그인 이동
     - NETWORK/SERVER/UNKNOWN → APP_ERROR_MESSAGE

   - 도메인 에러(UpdateGuideError) → UPDATE_GUIDE_ERROR_MESSAGE

4. finally에서 submitting만 idle로 복귀(에러 유지 정책일 때)

---

## 5) 서비스 코드 스타일: if vs if-else

- 둘 다 동작은 동일.
- 실무에서는 **early return + 단순 if** 또는 **if-else 체인** 모두 사용됨.
- 팀 기준이 없다면:
  - 페이지(UI)는 **if + early return**이 가장 읽기 쉬움
  - 서비스는 분기 수가 많아질수록 **if + throw**(early throw)가 디버깅에 유리

---

## 6) 결론(한 줄)

- `NETWORK/SERVER/UNAUTHORIZED`는 apiClient → AppError로 통일하고 서비스는 rethrow.
- 서비스는 “의미 있는 4xx”만 도메인으로 번역.
- 페이지는 `SessionRequiredError / AppError / DomainError`를 각각 처리.
- asyncState는 상태+코드 표준화에 쓰고, 메시지는 코드 매핑 또는 UI 문자열 상태로 관리.
