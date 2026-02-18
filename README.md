# Game Guide Platform

역기획 프로젝트

## 문제 상황

### critical 이슈

- 무한 next반복 redirect.
- 순간적으로 Vercel Notfound 페이지 뜸.

### known 이슈

- 검색 키워드 자모음 합쳐져야 인식됨.

## 고민된 부분

### 1. welcome 페이지 관리

    별도 페이지로 분리하는 기준
    - 딥링크/공유/북마크 가치가 있는 경우
    - 뒤로가기 히스토리가 필요한 경우

=> 뒤로가기 히스토리가 필요 없기에, 별도 페이지 분리 하지 않음. one-shot UI처리

#### 대안

**State**

딱 이번 이동에만 필요한 신호

1. location.state: “방금 발생한 이벤트”(로그인 직후, 생성 직후, 저장 직후)
   장: url오염 없음.
   단: 뒤로가기 시 state가 남을 수 있음.
1. 메모리 (전역 store) 플래그: location.state와 storage 사이 중간
   장: 라우팅 이동과 무관하게 사용 가능.

**Storage**

새로고침/브라우저 재시작/재방문에도 유지되어야 하는 경우 사용.

1. SessionStorage: 브라우저 탭 생명주기 동안 1회
1. LocalStorage: 디바이스 단위 영구 1회
