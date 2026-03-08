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
