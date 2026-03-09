7. 실무에서 자주 쓰는 두 가지 설계
   방식 A. 지금 당신 구조에 가까운 방식

GET /api/session → AT 필요

401이면 POST /api/reissue

성공하면 다시 GET /api/session

이건 AT 중심 bootstrap입니다.

    방식 B. 더 안정적인 bootstrap 구조

GET /api/session → RT cookie만으로 가능

서버가 현재 사용자 반환

필요하면 서버가 새 AT도 함께 내려주거나, 이후 별도 reissue

이건 session cookie/RT 중심 bootstrap입니다.

이 방식이 새로고침에서 더 안정적일 수 있습니다.
왜냐하면 앱 시작 시점에 “만료된 AT 때문에 먼저 실패” 하는 단계를 줄일 수 있기 때문입니다.
