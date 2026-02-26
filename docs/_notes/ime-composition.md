# IME composition과 검색 요청

한글 입력은 IME 조합 과정에서 onChange가 연속 발생한다.  
조합 중(ㄱ, ㄱㅏ 등) 값을 검색어로 취급하면 불필요한 요청이 발생하므로,
compositionstart~compositionend 동안에는 서버 요청을 트리거하지 않고,
compositionend 시점에만 검색어(effectiveQuery)를 갱신한다.

현재는 debounce 없이 compositionend마다 요청되도록만 적용했다.
