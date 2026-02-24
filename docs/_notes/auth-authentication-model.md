# 🔐 인증 모델 설계 원칙

본 프로젝트의 인증 모델은 **판정(read)** 과 **전이(write)** 의 책임 분리를 핵심 원칙으로 한다.

## 📚 목차

1. [목표](#-목표)
2. [인증 소스 전략](#-인증-소스-전략)
3. [보호 라우트 가드](#-보호-라우트-가드)
4. [세션 reset 정책](#-세션-reset-정책)
5. [인증 구조 분리](#-인증-구조-분리)
6. [Bootstrap write 예외 규칙](#-bootstrap-write-예외-규칙)
7. [Open Redirect 방어 원칙](#-open-redirect-방어-원칙)
8. [기대 효과](#-기대-효과)

## 🎯 목표

- 세션 오판 방지
- reset 남용 차단
- 인증 흐름 예측 가능성 확보
- 향후 토큰/쿠키 구조로의 확장성 확보

## 🧭 인증 소스 전략

### Single Source of Truth

- 인증의 1차 authority는 **client store(memory)**
- Storage 계열은 authority가 아닌 **UX hint** 로만 사용

> LS는 hint이고 authority가 아니다.

### 🔄 새로고침 정책

```txt
새로고침 → store 초기화 → 미인증 판단
```

MVP 단계에서는 단순성과 예측 가능성을 우선한다.

**향후 확장:**

- 쿠키/토큰 도입 시
- store 비어 있으면 서버 세션 복구(`/api/session`) 시도 가능

## 🚪 보호 라우트 가드

**정책:**

```txt
- store에 세션 존재 → 통과
- 세션 없음 → 로그인 redirect
```

**원칙:**

- UI 조건 분기 금지
- 라우팅 레벨 선차단

## 🔄 세션 reset 정책

reset은 **무효가 확정된 경우에만** 수행한다.

### ✅ 반드시 reset 해야 하는 순간

1. 사용자가 로그아웃 클릭
2. 서버가 401 반환
3. 토큰 갱신 실패

**공통점:**

> 서버 또는 사용자에 의해 무효가 확정됨

### ❌ reset 하면 안 되는 순간

- 단순 페이지 진입 실패
- loader 미인증 판정
- 네트워크 오류
- 서버 5xx
- 아직 세션 검증 전 초기 상태

**핵심 원칙:**

```txt
“모른다” ≠ “세션이 죽었다”
```

## 🧱 인증 구조 분리

```txt
판정 레이어 (loader / bootstrap)
↔
상태 변경 레이어 (auth mutation)
```

### 🔵 Bootstrap (read & sync)

**역할:**

- 현재 상태 확인
- 필요 시 복구
- 가능하면 아무 것도 하지 않음

**대표 예:**

- 앱 최초 진입 session restore
- 라우터 loader session check
- `/api/session` 검증

**핵심:**

> Bootstrap = 상태 판정 단계 (read 중심)

### 🔴 Auth Mutation (write & transition)

**역할:**

- 사용자 의도 또는 서버 확정 이벤트로 상태 전이
- store write 수행
- 세션 lifecycle 변경

**대표 예:**

- login 성공 → setSession
- logout 클릭 → resetSession
- refresh token 실패 → resetSession
- 401 interceptor → resetSession

**핵심:**

> Auth Mutation = 상태 전이의 주체 (write 중심)

## ⚠ Bootstrap write 예외 규칙

원칙적으로 bootstrap은 write를 하지 않는다.
단, **서버 authority가 명확할 때만 제한적으로 허용**한다.

### ✅ 안전한 bootstrap write

```ts
const data = await getSession();
setSession(data); // 서버가 유효 확정
```

**이유:**

- 서버 authority 기반 확정 write

### ❌ 위험한 bootstrap write

```ts
resetSession(); // 단순 미확인 상태
```

**위험 이유:**

> “모름” 상태를 “무효”로 오판

## 🛡 Open Redirect 방어 원칙

**구조상 역할:**

- loader → next 생성
- Home/Login → next 소비

따라서 단일 방어로는 불충분하다.

**정책:**

1. 생성 시 encode
2. 소비 시 validate

## ✅ 기대 효과

- 인증 판정 지점 단일화
- 세션 오판 방지
- 리디렉션 루프 제거
- open redirect 취약점 방어
- 향후 인증 구조 확장 용이

## 💭 개인 메모

인증 문제의 대부분은 값 자체보다

- 상태 판정
- 상태 전이
- 라우팅 제어

의 책임 경계가 흐려질 때 발생한다.

> 인증은 값 관리가 아니라 **전이 경계 설계 문제**에 가깝다.
