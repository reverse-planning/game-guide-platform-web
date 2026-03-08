# Authentication Proof 정리

웹 애플리케이션에서 인증(Authentication)을 설계할 때 가장 중요한 질문은 다음이다.

> 서버는 **어떤 근거(proof)** 로 이 요청이 인증된 사용자라고 판단하는가?

이때 사용되는 근거를 **authentication proof**라고 부른다.

즉 인증 시스템에서 핵심 흐름은 다음과 같다.

```
client request
  ↓
authentication proof
  ↓
server verification
  ↓
authenticated
```

예를 들어 다음과 같은 방식들이 존재한다.

| 방식           | authentication proof  |
| -------------- | --------------------- |
| Cookie session | Cookie                |
| JWT 인증       | Authorization: Bearer |
| API key        | header / query        |

즉 **쿠키는 authentication proof 중 하나일 뿐이며 유일한 방식은 아니다.**

---

# 왜 웹에서는 Cookie 기반 인증이 일반적인가

브라우저 기반 웹 애플리케이션에서는 **Cookie가 가장 자연스러운 authentication proof**이다.

이유는 다음 세 가지 때문이다.

## 1. 브라우저가 자동으로 전송한다

브라우저는 요청마다 자동으로 쿠키를 포함한다.

```
GET /api/user
Cookie: sessionId=xxxx
```

따라서 클라이언트 코드는 별도의 인증 로직을 작성할 필요가 없다.

---

## 2. 보안 옵션을 제공한다

쿠키는 다음과 같은 보안 옵션을 제공한다.

```
HttpOnly
Secure
SameSite
Domain
Path
```

특히 **HttpOnly 옵션**은 JavaScript 접근을 막아 **XSS로 인한 토큰 탈취 위험을 낮춘다.**

---

## 3. 브라우저 인증 모델 자체가 쿠키 중심이다

웹의 전통적인 인증 흐름은 다음과 같다.

```
login form
 → POST /login
 → Set-Cookie
 → authenticated session
```

대부분의 웹 프레임워크 역시 이 흐름을 기본으로 지원한다.

---

# Authorization Header 방식

쿠키 대신 다음 방식도 널리 사용된다.

```
Authorization: Bearer <token>
```

이 방식은 특히 다음 환경에서 많이 사용된다.

- 모바일 앱
- API 서비스
- 마이크로서비스
- 외부 SDK

장점은 다음과 같다.

| 장점                   | 설명                     |
| ---------------------- | ------------------------ |
| stateless              | 서버 세션 저장 필요 없음 |
| API 친화적             | 모바일 / SDK 환경에 적합 |
| cross-domain 제약 적음 | 쿠키 정책 영향 적음      |

즉 **Bearer 인증은 잘못된 방식이 아니라 API 환경에서 표준적인 방식이다.**

---

# Browser 환경에서 Bearer 방식의 문제

브라우저에서 Bearer 토큰은 보통 다음 위치에 저장된다.

```
localStorage
sessionStorage
memory
```

하지만 이 경우 다음 문제가 발생한다.

```
XSS → token 탈취
```

이 때문에 많은 웹 서비스는 다음 구조를 사용한다.

```
access token → memory
refresh token → httpOnly cookie
```

즉 **Cookie + Token 혼합 전략**이다.

---

# Authentication SSOT (Single Source of Truth)

authentication proof와 함께 중요한 개념이 **SSOT**이다.

SSOT는 다음 질문이다.

> 인증 상태의 최종 판단 기준은 어디인가?

일반적인 웹 애플리케이션에서는 다음 구조가 된다.

```
auth SSOT = server
```

즉 인증 흐름은 다음과 같다.

```
request
  ↓
cookie / token
  ↓
server verification
  ↓
authenticated
```

클라이언트 상태는 단지 캐시일 뿐이다.

예:

- React Query cache
- Redux
- Zustand

---

# 현재 프로젝트에서 발생한 혼란

현재 프로젝트의 인증 흐름은 다음과 같다.

```
useSessionStore.getState().accessToken
```

즉 인증 판단이 **클라이언트 메모리 상태에 의존한다.**

```
auth proof = client runtime state
```

이 경우 인증 흐름은 다음과 같이 동작한다.

```
browser start
 → Zustand store init
 → accessToken = null
 → redirect
```

즉 **서버 세션이 존재하더라도 클라이언트 store가 비어 있으면 인증되지 않은 상태가 된다.**

---

# 이 구조가 테스트에서 문제를 만드는 이유

Playwright의 인증 재사용 전략은 다음을 저장한다.

```
cookies
localStorage
sessionStorage
```

하지만 현재 인증 상태는

```
Zustand memory state
```

이다.

즉 다음과 같은 상황이 발생한다.

```
setup login
 → storageState 저장
 → 새 브라우저 컨텍스트
 → Zustand 초기화
 → accessToken = null
```

결과적으로 **인증 상태가 복원되지 않는다.**

---

# E2E 테스트 전략과 인증 구조의 관계

E2E 테스트 전략은 **authentication proof의 위치에 종속된다.**

## 서버 인증 기반

```
proof = cookie / header
SSOT = server
```

테스트 전략

```
setup login
 → cookie 저장
 → storageState reuse
```

---

## 클라이언트 상태 기반

```
proof = client runtime state
SSOT = client memory
```

테스트 전략

```
test start
 → login UI
 → setAccessToken()
 → authenticated
```

즉 **테스트마다 로그인 동작이 필요하다.**

---

# 정리

인증 시스템에서 가장 중요한 개념은 다음 두 가지이다.

```
authentication proof
authentication SSOT
```

이 두 요소에 따라 다음이 모두 달라진다.

- 인증 흐름
- 클라이언트 상태 관리
- 테스트 전략

---

이 문서는 **현재 프로젝트에서 E2E 테스트 전략이 왜 예상과 다르게 동작했는지 이해하기 위해 정리된 개념 기록이다.**
