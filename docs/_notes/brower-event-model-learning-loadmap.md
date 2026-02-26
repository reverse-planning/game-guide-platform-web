# 📌 이벤트 모델 학습 로드맵 (프로젝트 1:1 연결)

본 프로젝트에서 발생한 실제 이슈를 기준으로,
브라우저 이벤트 모델 학습 범위를 정리한다.

---

## 1️⃣ Composition 이벤트

### 🔗 연결 문제: IME 검색 오동작

**문제**

- 자모 입력 중에도 검색 API가 호출됨

**원인 모델**

- IME 조합 단계에서도 `input` 이벤트가 발생함

**학습 포인트**

- `compositionstart`
- `compositionupdate`
- `compositionend`
- `event.isComposing`

**핵심 이해**

- 한글은 “키 입력 = 글자 완성”이 아니다
- 브라우저는 조합 중 상태를 별도로 관리한다

---

## 2️⃣ input vs change 차이

### 🔗 연결 문제: 검색 트리거 타이밍

**문제**

- 언제 검색을 실행해야 하는가?

**학습 포인트**

- `input` → 값이 바뀔 때마다 발생
- `change` → 포커스가 빠질 때 발생

**실전 적용**

- 검색창 → `input`
- 폼 제출 검증 → `change` 또는 `submit`

---

## 3️⃣ 이벤트 캡처링 / 버블링

### 🔗 연결 문제: 카드 전체 클릭 + 내부 Link 중복 네비게이션

**문제**

- `article` 클릭과 내부 `Link` 클릭이 동시에 발생

**학습 포인트**

- 이벤트 전파 흐름:
  `capture → target → bubble`
- `stopPropagation()`

**실전 적용**

- 내부 `Link`에서 `e.stopPropagation()` 처리

**핵심 이해**

- 이벤트는 DOM 트리를 따라 이동한다

---

## 4️⃣ preventDefault vs stopPropagation

### 🔗 연결 문제: 모달 ESC 처리 / 폼 submit 제어

| 상황                     | 사용 메서드         |
| ------------------------ | ------------------- |
| 폼 submit 기본 동작 막기 | `preventDefault()`  |
| 부모 클릭 이벤트 막기    | `stopPropagation()` |

**구분**

- `preventDefault()` → 기본 동작 차단
- `stopPropagation()` → 이벤트 전파 차단

---

## 5️⃣ focus / blur 모델

### 🔗 연결 문제: 모달 포커스 튐 / 포커스 복원

**문제**

- 모달 닫을 때 포커스가 `body`로 이동

**학습 포인트**

- `focus` / `blur`는 버블링하지 않음
- `focusin` / `focusout`은 버블링함
- `document.activeElement`

**실전 적용**

- 모달 열기 전 `activeElement` 저장
- 닫을 때 포커스 복원

---

## 6️⃣ IntersectionObserver

### 🔗 연결 문제: 무한 스크롤

**문제**

- `scroll` 이벤트는 과도하게 발생

**해결**

- `IntersectionObserver` 사용

**학습 포인트**

- 관찰 대상(Element)
- `rootMargin`
- `threshold`
- `disconnect()` 필요성

**핵심 이해**

- 스크롤 이벤트 기반이 아니라 “관찰 기반 API”

---

## 7️⃣ 이벤트 루프 (Macro / Micro Task)

### 🔗 연결 문제: setState 후 값이 즉시 반영되지 않는 느낌

**문제**

- 상태 업데이트 직후 콘솔 출력 시 이전 값 표시

**학습 포인트**

- Call Stack
- Task Queue (Macro Task)
- Microtask Queue (`Promise.then`)

**실전 연결**

- React `setState`는 비동기
- `Promise.then`은 Microtask

---

# 📌 전체 매핑 요약

| 학습 항목            | 프로젝트 연결 이슈  |
| -------------------- | ------------------- |
| Composition          | IME 검색            |
| input/change         | 검색 트리거         |
| 캡처/버블링          | 카드 클릭 중복      |
| preventDefault       | 폼 submit 제어      |
| focus 모델           | 모달 포커스 관리    |
| IntersectionObserver | 무한 스크롤         |
| 이벤트 루프          | 상태 반영 시점 이해 |

---

이 문서는 단순 기능 구현이 아니라
**문제 → 브라우저 내부 모델 → 구조적 해결** 관점에서 학습 범위를 정의한다.
