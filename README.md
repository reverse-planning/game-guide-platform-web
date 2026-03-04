# Game Guide Platform - 게임 공략 공유 플랫폼

[PoomPoom](https://github.com/jhoonyeel/poompoom-web) 프로젝트를 기반으로 기존 기능을 재구성하며 **인증 흐름, 서비스 계층 구조, 검색 요청 정책을 다시 설계한 `역기획 프로젝트`** 입니다.

지난 프로젝트(PoomPoom) 에서 기능 구현 중심으로 개발되며 지나쳤던 **인증 흐름, 서비스 계층, 에러 처리 구조**를 재설계하며 **클라이언트 아키텍처를 개선**하는 것을 목표로 진행했습니다.

---

## 🔎 핵심 포인트

이 프로젝트에서는 단순 기능 구현이 아니라 프론트엔드 아키텍처 구조 개선에 집중했습니다.

- **Axios 인터셉터 + 서비스 레이어 분리**를 통해 네트워크/도메인 에러 처리 구조 정리

- **세션 Viewer 기반 인증 흐름 설계**로 라우팅과 인증 상태 관리 일관성 확보

- **조회와 검색 역할 분리 + IME 입력 정책 설계**로 검색 요청 구조 개선

---

## 🔄 Data Flow

이 프로젝트에서는 **UI → Service → Network → Server** 순서의 단방향 데이터 흐름을 기준으로 구조를 설계했습니다.

```text
User Action
   │
   ▼
Page / Component (UI Layer)
   │
   ▼
Service Layer
   │
   ▼
Axios Client (Network Layer)
   │
   ▼
API Server
```

**UI Layer**

- 사용자 이벤트 처리
- 서비스 레이어 호출
- 에러 메시지 표시

**Service Layer**

- API 호출
- 도메인 에러 변환
- 비즈니스 로직 처리

**Network Layer**

- Axios 인터셉터 기반 HTTP 처리
- 공통 에러 포맷(AppError) 생성

이와 같은 구조를 통해 네트워크 처리, 도메인 로직, UI 렌더링의 책임을 계층별로 분리했습니다.
그 결과 컴포넌트는 네트워크 구현 세부사항에 의존하지 않게 되었고, 에러 처리 흐름 또한 예측 가능한 구조로 정리할 수 있었습니다.
또한 각 레이어의 역할이 명확해지면서 코드의 유지보수성과 확장성을 높일 수 있었습니다.

---

## ⚙️ 기술 스택

<p>
<img src="https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white" />
<img src="https://img.shields.io/badge/Axios-1.x-5A29E4?logo=axios&logoColor=white" />
<img src="https://img.shields.io/badge/TailwindCSS-4.x-38BDF8?logo=tailwindcss&logoColor=white" />
</p>

---

## ✨ 구현한 기능

- 세션 Viewer 캐시 기반 **인증 상태 관리**
- **Axios 인터셉터 + 서비스 레이어 분리** 기반 에러 처리 구조
- **IME 조합 입력을 고려한 검색 요청 정책 설계**
  - 한글 조합 중 요청 차단
  - 영문 입력 debounce 적용

---

## 🧱 개발 이슈

실제 구현 과정에서 발생한 기술 문제와 해결 과정을 정리했습니다.

- [Auth Routing 404 이슈](./docs/dev-issue/auth-routing-404.md)
- [IME 조합 입력 검색 요청 문제](./docs/dev-issue/search-ime.md)

---

## 🧭 고민한 부분 (Architecture Decisions)

구현 이전에 설계 관점에서 고민한 기술 선택을 정리했습니다.

- [Auth 토큰 검증 전략](./docs/decisions/auth-token-validation-strategy.md)
- [프론트 필터 vs 서버 필터](./docs/decisions/frontend-filter-vs-server-filter.md)
- [Welcome 페이지 상태 관리 전략](./docs/decisions/welcome-page-state-vs-storage.md)

---

## 🎯 프로젝트 목표

이번 프로젝트에서는 단순 기능 구현보다 클라이언트 아키텍처를 명확히 정리하는 것을 목표로 진행했습니다.

### 1. 네트워크 레이어와 서비스 레이어의 책임 분리

Axios 인터셉터와 서비스 레이어를 분리해 **에러 처리 책임을 구조적으로 정리**했습니다.

- **네트워크 레이어**: HTTP 상태, 네트워크 오류를 `AppError` 형태로 표준화
- **서비스 레이어**: 도메인 단위 에러로 변환하여 UI가 처리할 수 있는 수준으로 전달
- **페이지/컴포넌트**: 메시지 매핑과 사용자 피드백 처리 담당

이를 통해 **에러가 발생하는 위치와 처리 책임이 명확해지고**, 컴포넌트에서 네트워크 로직을 직접 다루지 않아도 되는 구조를 만들었습니다.

---

### 2. 인증 흐름을 추적 가능한 구조로 정리

기존 프로젝트에서는 인증 확인 로직이 여러 페이지에 분산되며 **라우팅 흐름을 한눈에 파악하기 어려운 구조**였습니다.

이번 프로젝트에서는 다음 기준으로 인증 흐름을 재정리했습니다.

- 세션 Viewer 기반 **인증 상태 관리**
- 인증 상태에 따른 **라우팅 정책 정리**
- 인증 실패 및 세션 만료 상황에 대한 **일관된 처리 방식**

이를 통해 **인증 흐름을 예측 가능한 구조로 정리**했습니다.

---

### 3. 조회 페이지와 검색 페이지의 역할 분리

이전 프로젝트에서는 디자인 시안을 그대로 수용하면서 **조회와 검색의 역할이 혼용되는 문제**가 발생했습니다.

예를 들어

- 단순 목록 조회
- 사용자 검색 요청
- 필터링 결과

가 동일한 UI 흐름에서 처리되면서 **요청 정책이 모호해지는 문제**가 있었습니다.

이번 프로젝트에서는

- **조회(List)** 와 **검색(Search)** 의 역할을 구분
- 검색 입력 정책을 명확히 정의
- **IME 조합 입력을 고려한 요청 정책**을 설계

하여

- 한글 조합 중 불필요한 요청 차단
- 영문 입력 debounce 적용

과 같은 **입력 방식까지 고려한 검색 요청 구조**를 적용했습니다.

---

### 결과

이 프로젝트의 목표는 기능을 추가하는 것이 아니라 다음을 달성하는 것이었습니다.

- **서비스 레이어와 네트워크 레이어의 책임 분리**
- **예측 가능한 인증 흐름 구조**
- **조회와 검색의 역할이 명확한 UI/API 설계**

이를 통해 **기능 구현 중심에서 구조 중심으로 프론트엔드 아키텍처를 재정리하는 경험**을 목표로 진행했습니다.
