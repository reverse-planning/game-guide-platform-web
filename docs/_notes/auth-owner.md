# Auth Owner 기반 라우팅 요약

본 프로젝트는 인증 흐름의 예측 가능성과 보안 강화를 위해 **Auth Owner 중심 구조**를 사용한다.
인증 판단, 로그인 리디렉션, 복귀 경로 검증을 중앙에서 통제하여 라우팅 복잡도를 낮추는 것이 목적이다.

## 📚 목차

1. [Gatekeeper (라우트 보호)](#-gatekeeper-라우트-보호)
2. [로그인 후 자동 복귀](#-로그인-후-자동-복귀)
3. [Open Redirect 방어](#-open-redirect-방어)
4. [상태 전략](#-상태-전략)
5. [핵심 설계 효과](#-핵심-설계-효과)

## 🔐 Gatekeeper (라우트 보호)

보호 라우트 진입 시 `loader(requireSession)`가 인증 여부를 먼저 검사한다.

```ts
async function requireSession({ request }: { request: Request }) {
  const { session } = useSessionStore.getState();
  if (session?.userId) return null;

  throw redirectToLogin(request.url);
}
```

정책:

- 인증 OK → 페이지 렌더
- 미인증 → 로그인 redirect
- UI 레벨 조건 분기 금지

핵심 의도는 **라우팅 레벨에서 선차단**이다.

## 🔁 로그인 후 자동 복귀

로그인 성공 시 `?next=` 파라미터를 읽어 원래 경로로 복귀한다.

```ts
const params = new URLSearchParams(location.search);
const next = params.get("next");
navigate(getSafeNext({ next }), { replace: true });
```

효과:

- 보호 라우트 진입 UX 자연화
- 강제 로그인 흐름 단절 방지

## 🛡 Open Redirect 방어

외부 URL로의 악성 이동을 막기 위해 next 값을 검증한다.

```ts
export function getSafeNext({ next, fallback = "/guides" }: SafeNextProps): string {
  if (!next) return fallback;
  if (!next.startsWith("/")) return fallback;
  if (next.startsWith("//")) return fallback;
  return next;
}
```

원칙:

- 생성 시 encode
- 소비 시 validate
- 이중 방어 적용

## 🧠 상태 전략

| 항목         | 정책                  |
| ------------ | --------------------- |
| 인증 소스    | client store (memory) |
| localStorage | UX 힌트만 사용        |
| 새로고침     | 세션 유지하지 않음    |
| 보호 라우트  | loader에서 차단       |

## 💡 핵심 설계 효과

- 보호 라우트 진입 지점 단일화
- 로그인 후 복귀 흐름 안정화
- open redirect 취약점 방어
- 인증 로직의 UI 침투 방지
