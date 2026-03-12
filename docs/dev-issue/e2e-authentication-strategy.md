# Dev Issue: E2E Authentication Strategy

## 배경

프로젝트에서 E2E 테스트를 도입하면서 Playwright의 **authentication reuse 전략**을 적용하려 했다.

일반적인 Playwright 인증 전략은 다음과 같다.

```
setup login
 → cookie 저장
 → storageState 생성
 → 이후 테스트에서 reuse
```

이 방식은 대부분의 웹 애플리케이션에서 잘 동작한다.

이유는 인증 판단의 **SSOT가 서버**이기 때문이다.

```
request
  ↓
cookie / authorization header
  ↓
server verification
  ↓
authenticated
```

즉 브라우저가 쿠키나 인증 헤더를 포함해 요청을 보내면 서버가 인증 여부를 판단한다.

---

## 문제 상황

현재 프로젝트의 인증 구조는 일반적인 웹 인증 구조와 다르다.

라우터의 인증 판단 기준은 다음 코드에 있다.

```
useSessionStore.getState().accessToken
```

즉 인증 여부를 **클라이언트 상태(Zustand 메모리)** 로 판단하고 있다.

인증 흐름은 다음과 같다.

```
브라우저 시작
 → Zustand store 초기화
 → accessToken = null
 → redirect
```

따라서 서버 세션이 존재하더라도 클라이언트 store가 비어 있으면 인증되지 않은 상태로 간주된다.

---

## Playwright 인증 재사용이 실패한 이유

Playwright의 인증 재사용 전략은 다음 데이터를 저장한다.

```
cookies
localStorage
sessionStorage
```

하지만 현재 프로젝트의 인증 상태는 다음 위치에 있다.

```
Zustand memory state
```

즉 다음과 같은 상황이 발생한다.

```
setup login
 → storageState 저장
 → 새로운 브라우저 컨텍스트 시작
 → Zustand 초기화
 → accessToken = null
```

결과적으로 setup에서 생성한 **인증 상태가 테스트에서 복원되지 않는다.**

---

## 초기 E2E 전략

초기에는 Playwright setup 기반 인증 재사용을 시도했다.

```
auth.setup.ts
 → loginByApi
 → storageState 저장
 → 이후 테스트에서 AUTH_FILE 사용
```

하지만 인증 상태가 Zustand 메모리에 있기 때문에 이 전략은 동작하지 않았다.

---

## 현재 해결 전략

현재 프로젝트 구조에서는 인증 상태가 **클라이언트 런타임 동작을 통해서만 생성된다.**

따라서 E2E 테스트 전략을 다음과 같이 변경했다.

```
test start
 → login UI 실행
 → setAccessToken()
 → authenticated
 → 이후 테스트 진행
```

즉 인증이 필요한 테스트에서는 **테스트 내부에서 직접 로그인 동작을 수행**하도록 했다.

예시:

```
await loginByUi(page)
```

이 방식은 실제 사용자 흐름과 동일하게 동작하며 현재 인증 구조와 가장 잘 맞는다.

---

## 테스트 구조

현재 E2E 테스트는 다음 구조로 구성되어 있다.

```
e2e
 ├ fixtures
 │   └ auth.ts
 │
 └ specs
     ├ auth-redirect.spec.ts
     ├ guide-happy-path.spec.ts
     ├ guide-not-found.spec.ts
     └ session-expired-on-submit.spec.ts
```

각 테스트의 역할은 다음과 같다.

| 테스트                    | 목적                                                |
| ------------------------- | --------------------------------------------------- |
| auth-redirect             | 비인증 상태에서 보호된 라우트 접근 시 redirect 확인 |
| guide-happy-path          | 로그인 후 주요 사용자 시나리오 검증                 |
| guide-not-found           | 존재하지 않는 리소스 접근 시 오류 UI 확인           |
| session-expired-on-submit | 인증이 없는 상태에서 작성 시 redirect 확인          |

---

## 향후 개선 방향

현재 구조는 인증 판단이 클라이언트 상태에 의존하는 과도기 구조이다.

향후 다음 구조로 개선하는 것이 바람직하다.

```
auth SSOT = server
```

예시:

```
loader
 → /api/me 요청
 → 서버 인증 검증
 → viewer 상태 설정
```

이 구조로 변경되면 다음과 같은 장점이 있다.

```
setup login
 → cookie 저장
 → storageState reuse
```

즉 Playwright의 인증 재사용 전략을 그대로 사용할 수 있다.

결과적으로

- E2E 테스트 속도 개선
- 테스트 코드 단순화
- 인증 흐름 일관성 확보

가 가능해진다.

---

## 결론

이번 이슈를 통해 다음 사실을 확인했다.

```
E2E 테스트 전략은 인증 구조(authentication proof)에 종속된다.
```

즉 인증 시스템의 **SSOT 위치**에 따라

- 인증 구현 방식
- 테스트 전략
- 테스트 코드 구조

가 모두 달라진다.

이 문서는 E2E 인증 전략 변경 과정과 그 원인을 기록하기 위한 개발 이슈 문서이다.
