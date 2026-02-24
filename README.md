# Game Guide Platform

역기획 프로젝트

## 📌개발 이슈

- [Auth Routing 404 이슈](./docs/dev-issue/auth-routing-404.md)

## 🧭 고민한 부분

- [Welcome 페이지 상태 관리 전략](./docs/decisions/welcome-page-state-vs-storage.md)

---

### known 이슈

- 검색 키워드 자모음 합쳐져야 인식됨.

TODO

- msw 수정
- 에러 관리 공부 (/docs/\_notes에 정리)

### 01. Policies

세션은 클라이언트 store만 신뢰

새로고침하면 store 초기화 → 미인증으로 판단

```
보호 라우트 진입 전 가드
- store에 이미 세션이 있으면 그대로 통과
- 실패하면 redirect
```

=> [추후 쿠키 or 토큰 방식 적용] store 없으면 서버에서 세션 복구 시도 (GET /api/session)

---

관측/에러수집(Sentry) → 핵심 사용자 시나리오 테스트(Playwright 중심) → MSW는 ‘테스트용 최소 시나리오’만 유지
