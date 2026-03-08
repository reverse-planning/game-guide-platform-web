# ADR-0003: Token Validation & Session Invalidation Strategy

## Status

Accepted

## Context

현재 인증 구조는 다음과 같다.

- Access Token (AT): Authorization: Bearer 헤더로 전송 (클라이언트 메모리 저장)
- Refresh Token (RT): HttpOnly + Secure 쿠키로 저장
- `/api/reissue`를 통해 AT 재발급

JWT 기반 인증을 도입하면서 다음과 같은 질문이 발생하였다.

1. 일반 요청에서도 세션 유효성 검증을 위해 DB 접근이 필요한가?
2. 로그아웃 또는 계정 정지 시 토큰을 즉시 무효화하려면 어떻게 해야 하는가?
3. 완전한 stateless 인증이 보안적으로 안전한가?

## Decision

### 1. 일반 API 요청은 Stateless 검증을 유지한다

일반 요청에서는 다음만 검증한다.

- JWT 서명 검증
- exp(만료 시간) 검증
- iss / aud 검증
- sub(userId) 추출

→ 이 단계에서는 DB 접근을 수행하지 않는다.

이를 통해 빈번한 요청에 대한 성능 이점을 유지한다.

### 2. 상태 검증은 재발급 시점에 수행한다

Access Token은 짧은 만료 시간(Short-lived)으로 설정한다.

- AT 만료 → `/api/reissue` 호출
- RT 검증은 서버 저장소(DB/Redis)에서 수행
- 재발급 시 RT 회전(rotating refresh token) 적용

→ 일반 요청은 Stateless
→ 재발급 시에만 Stateful 검증 수행

### 3. 즉시 무효화 전략은 선택적으로 도입한다

필요 시 다음 전략을 도입할 수 있다.

- tokenVersion 필드 추가
- JWT에 `ver` 클레임 포함
- 서버에서 사용자별 tokenVersion 관리
- 요청 시 JWT ver와 서버 값 비교

이 전략은 매 요청 저장소 접근이 필요하므로
"즉시 무효화가 반드시 필요한 도메인"에서만 적용한다.

## Rationale

JWT의 장점은 "모든 요청에서 DB 접근 제거"가 아니라,

> 빈번한 일반 요청을 Stateless로 처리하여 성능을 확보하는 것

이다.

완전 Stateless 모델은 보안적으로 단순하지만,
즉시 무효화 요구사항이 있는 경우 일부 상태 기반 검증이 필요하다.

따라서 다음 균형 전략을 채택한다.

- 일반 요청: Stateless
- 재발급: Stateful
- 고보안 도메인: 선택적 tokenVersion 검증

## Consequences

### 장점

- 일반 API 성능 최적화
- DB 부하 감소
- 토큰 탈취 피해 시간 최소화 (Short-lived AT)
- RT 회전으로 재사용 공격 방지 가능

### 단점

- 즉시 무효화는 기본적으로 보장되지 않음
- 보안 요구가 증가할 경우 상태 저장소 필요
- 인증 로직 복잡도 증가

## Future Considerations

- Redis 기반 tokenVersion 캐싱 전략 검토
- 고위험 API에 한정한 상태 검증 도입
- AT 만료 시간에 대한 보안/UX 트레이드오프 재검토
- 감사 로그(Audit Log) 기반 비정상 토큰 사용 감지

---

이 결정은 "성능과 보안 사이의 균형"을 전제로 한다.
완전 Stateless를 목표로 하지 않으며,
필요한 지점에서만 상태 기반 검증을 도입하는 전략을 채택한다.
