# ADR-0004: Session Bootstrap Strategy

## Status

Accepted

## Context

SPA(Single Page Application)에서는 페이지 새로고침 시
클라이언트 메모리에 저장된 상태가 초기화된다.

이로 인해 다음 문제가 발생한다.

- 로그인 UI 상태(`viewer`)가 사라짐
- 현재 로그인 사용자를 다시 확인해야 함
- 토큰이 존재하더라도 UI 상태는 복구되지 않음

따라서 앱 시작 시점에 **현재 로그인 사용자 정보를 복구하는 bootstrap 과정**이 필요하다.

이때 두 가지 접근 방식이 존재한다.

---

## Option A — Access Token 중심 Bootstrap

앱 시작 시 클라이언트는 `accessToken`을 사용해 `/session` API를 호출한다.

```
localStorage accessToken 존재
        ↓
GET /api/session
        ↓
AT 검증
        ↓
성공 → 사용자 정보 반환
        ↓
viewer 복구
```

만약 access token이 만료된 경우 다음 흐름이 발생한다.

```
GET /api/session
        ↓
401 Unauthorized
        ↓
POST /api/reissue (RT cookie 사용)
        ↓
새 accessToken 발급
        ↓
GET /api/session 재요청
        ↓
viewer 복구
```

### 특징

- Authorization header 기반 인증 흐름과 일관성 유지
- 일반 API 요청 구조와 동일한 검증 방식 사용
- AT 만료 시 bootstrap 과정에서 한 번의 실패 요청 발생 가능

---

## Option B — Refresh Token 중심 Bootstrap

앱 시작 시 `/session` 요청은 access token 없이 수행된다.
서버는 `refreshToken` 쿠키를 기반으로 현재 사용자를 식별한다.

```
GET /api/session
        ↓
RT cookie 검증
        ↓
현재 사용자 확인
        ↓
사용자 정보 반환
        ↓
viewer 복구
```

필요한 경우 서버는 다음 중 하나를 수행할 수 있다.

- 새로운 access token 발급
- 이후 `/reissue`를 통해 AT 재발급

### 특징

- bootstrap 과정에서 access token 만료로 인한 실패 요청이 발생하지 않음
- session cookie 기반 인증 모델과 유사한 구조
- 서버가 RT 검증을 통해 사용자 식별을 수행

---

## Decision

본 프로젝트에서는 **Option A (Access Token 중심 Bootstrap)** 전략을 채택한다.

이 방식은 다음 이유로 선택되었다.

1. **Authorization header 기반 인증 흐름과의 일관성 유지**

   대부분의 API 요청은 access token을 사용해 인증된다.

2. **토큰 검증 책임을 access token 중심으로 유지**

   refresh token은 재발급 전용으로 사용한다.

3. **REST API 인증 구조와의 자연스러운 결합**

   모든 보호 API가 동일한 인증 방식(Authorization header)을 사용한다.

---

## Rationale

Access token 중심 bootstrap은 다음과 같은 특성을 가진다.

- 인증 검증 흐름이 일반 API 요청과 동일하다.
- 서버 인증 로직이 단순해진다.
- refresh token의 역할을 **재발급 전용(reissue only)** 으로 제한할 수 있다.

bootstrap 과정에서 access token이 만료된 경우
`/api/session → 401 → /api/reissue → retry` 흐름이 발생할 수 있지만
이는 설계상 허용 가능한 비용으로 판단하였다.

---

## Consequences

### 장점

- 인증 검증 흐름 단순화
- Authorization header 기반 인증과 일관성 유지
- refresh token의 책임을 재발급으로 제한

### 단점

- bootstrap 시 access token 만료로 인한 401 요청이 발생할 수 있음
- viewer 복구를 위해 추가 요청이 필요할 수 있음

---

## Future Considerations

다음 조건에서 bootstrap 전략 재검토 가능성이 있다.

- 인증 실패 요청을 최소화해야 하는 UX 요구 증가
- session cookie 기반 인증 구조로의 전환
- 서버에서 refresh token을 통해 사용자 식별을 수행하는 구조 도입

이 경우 **RT 중심 bootstrap 전략(Option B)** 을 검토할 수 있다.
