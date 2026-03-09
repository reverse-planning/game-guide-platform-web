getSession성공 시
**“viewer 복구”**는 정확히
**“localStorage에 남아 있는 유효한 AT를 기반으로, 앱이 다시 현재 로그인 사용자 정보를 메모리 캐시에 채우는 것”**을 뜻

---

“AT가 유효하다는 판별”과 “viewer 복구”는 같은 말인가

완전히 같은 말은 아니고, 한 흐름 안의 두 단계다.

1단계: AT 유효성 판별

서버가 /api/session 요청을 받고 AT를 검증한다.

2단계: viewer 복구

검증 성공 시 서버가 현재 사용자 정보(예: nickname)를 응답하고, 클라이언트가 그걸 store에 넣는다.

즉 순서는 이렇게 된다.

AT 존재
→ /api/session 요청
→ 서버가 AT 검증
→ 성공
→ nickname 반환
→ viewer 복구

그래서 viewer 복구는
**“AT 검증 성공 이후, 현재 사용자 정보를 다시 메모리에 채우는 단계”**라고 보면 된다.

---

원래 only memory AT구조였으나, Playwright 도입과 함께 LS AT도 추가됨.
=> AT가 2곳에 존재하게 됨.

결론: LS로 옮김.

---

1️⃣ 쿠키 기반 인증
2️⃣ Authorization 헤더 기반 인증

그리고 Authorization 헤더 방식 내부에서 다시 저장 위치가 나뉩니다.

Authorization header 방식
├─ 메모리 (in-memory)
└─ 영속 저장소 (localStorage / sessionStorage 등)

즉 당신이 말한 것처럼 Authorization 방식 내부에 두 가지 저장 전략이 존재합니다.

1. 인증 proof 저장 위치의 전체 구조

정확히 정리하면 이렇게 됩니다.

인증 proof 저장 위치

1. 브라우저 쿠키
   └─ Cookie → 서버 자동 전송

2. 클라이언트 저장소
   ├─ 메모리 (in-memory store)
   └─ localStorage / sessionStorage

그리고 Authorization 헤더 방식은 항상 2번을 사용합니다.

왜냐하면 브라우저는 Authorization 헤더를 자동으로 붙여주지 않기 때문입니다.

2. 쿠키 방식
   Client
   ↓
   Cookie (HttpOnly)
   ↓
   Browser 자동 첨부
   ↓
   Server

특징

브라우저가 자동으로 보냄

JS에서 접근 불가 (HttpOnly)

별도 저장 로직 필요 없음

예

Cookie: sessionId=abc123

서버는 이걸로 인증합니다.

3. Authorization 헤더 방식

Authorization 방식은 항상 클라이언트가 토큰을 관리해야 합니다.

Client storage
↓
JS가 꺼냄
↓
Authorization header 추가
↓
Server

예

Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI...

그래서 반드시 토큰 저장 위치가 필요합니다.

4. Authorization 방식 내부 저장 전략

여기서 두 가지 전략이 나옵니다.

1️⃣ 메모리 저장

예

let accessToken = null

또는

Zustand
Redux
React Query cache

특징

XSS 안전

새로고침 시 사라짐

그래서 보통 RT 쿠키 + AT 메모리 구조를 씁니다.

2️⃣ localStorage / sessionStorage

예

localStorage.setItem("accessToken", token)

특징

새로고침 유지

XSS 취약

그래서 보안적으로는 덜 안전합니다.

5. 현재 당신 구조

지금 코드 구조는 사실 혼합형입니다.

RT → Cookie
AT → localStorage
viewer → Zustand store (memory)

즉

RT (HttpOnly Cookie)
AT (localStorage)
viewer (memory cache)

이 구조는 실제 서비스에서도 많이 쓰입니다.

대표적으로

RT → Cookie
AT → memory or localStorage 6. 왜 memory + storage 두 개가 생기는가

Authorization 방식의 본질 때문입니다.

브라우저는

Authorization header 자동 첨부 기능이 없음

그래서 항상

JS가 토큰을 가져와야 함

이 과정이 필요합니다.

storage → JS → header

그래서 저장소가 반드시 필요합니다.

7. 그래서 SPA 인증 구조가 보통 이렇게 됩니다
   Server
   ├─ RT → Cookie
   └─ AT → Authorization header

Client
├─ AT → memory or localStorage
└─ viewer → global state

요약

RT → 쿠키
AT → 클라이언트 저장소 8. 실무적으로 가장 많이 쓰는 패턴
보안 중심
RT → HttpOnly Cookie
AT → memory

새로고침 시

GET /session
or
POST /reissue
UX 중심
RT → HttpOnly Cookie
AT → localStorage

새로고침 시에도 유지됩니다.

지금 당신 구조가 여기에 가깝습니다.

9. 중요한 개념 하나

사람들이 자주 헷갈리는 게 있습니다.

Authorization 헤더 방식은 사실 “토큰 저장 위치”가 아니라 “토큰 전달 방식”입니다.

즉

Authorization header = 전달 방식

저장은 별개입니다.

localStorage
sessionStorage
memory
indexedDB
cookie

어디든 가능합니다.

10. 정리

당신 이해를 정확히 정리하면 이렇습니다.

인증 proof 전달 방식
├─ Cookie
└─ Authorization header

Authorization header 내부 저장 전략
├─ memory
└─ localStorage / sessionStorage

그래서 당신 말이 맞습니다.

인증 헤더를 사용하는 순간 LS, 메모리 등 내부적으로 가지고 있어야 하니까?

✔ 맞습니다.

---

viewer = session view model
LS = authentication proof

=> session vs authentication 차이

---

/session

- 앱 시작 시 현재 로그인 사용자 복구
- 헤더/네비게이션/UI 초기화

/reissue

- 인증 실패(401) 시 access token 복구
- 실패한 요청 재시도

즉,

/session or /me은 앱 상태 복구
/reissue or /refresh는 인증 수단 복구

앱 시작은 “누구인지 복구하는 문제”이고, reissue는 “인증 수단을 복구하는 문제”
