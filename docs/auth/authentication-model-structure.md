# Authentication Model Structure

웹 애플리케이션의 인증(Authentication)은 하나의 기술이나 라이브러리로 정의되는 것이 아니라, **세 가지 구성 요소의 조합**으로 이루어진다.

1. Authentication proof
2. Transport
3. Client storage

이 세 요소의 조합이 실제 서비스의 **인증 모델(Authentication Model)** 을 결정한다.

---

# 1. Authentication proof

**Authentication proof**는 서버가 요청을 **인증된 사용자로 판단하기 위한 근거**이다.

즉 서버는 요청을 받을 때 다음 질문에 답해야 한다.

> 이 요청이 어떤 사용자로부터 온 것이라는 것을 무엇으로 증명할 수 있는가?

대표적인 authentication proof는 다음과 같다.

- sessionId
- JWT
- API key
- OAuth token

예시

- session 기반 인증 → proof = sessionId
- JWT 인증 → proof = JWT

서버는 이 proof를 검증하여 사용자 식별을 수행한다.

---

# 2. Transport

**Transport**는 authentication proof가 **HTTP 요청에 포함되어 서버로 전달되는 방식**을 의미한다.

대표적인 transport 방식은 다음과 같다.

- Authorization header
- Cookie
- Query parameter
- Request body

예시

Authorization header 방식

```
Authorization: Bearer <JWT>
```

Cookie 방식

```
Cookie: sessionId=abc123
```

Query parameter 방식

```
GET /api?api_key=abc123
```

Transport는 **authentication proof를 HTTP 요청의 어느 위치에 담아 전달할지**를 정의하는 계층이다.

---

# 3. Client storage

Client storage는 **클라이언트가 authentication proof를 어디에 저장하는지**를 의미한다.

대표적인 저장 위치는 다음과 같다.

- memory (JS runtime)
- localStorage
- sessionStorage
- IndexedDB
- cookie

예시

JWT를 localStorage에 저장한 경우

```
localStorage
  ↓
JS code
  ↓
Authorization header
  ↓
request
```

cookie에 저장한 경우

```
browser cookie store
  ↓
자동 전송
  ↓
Cookie header
```

---

# 4. Authentication Model

실제 서비스의 인증 모델은 위 세 요소의 **조합**으로 구성된다.

예시

### Session Authentication Model

```
Authentication proof
sessionId

Transport
Cookie

Client storage
cookie
```

### JWT Authentication Model

```
Authentication proof
JWT

Transport
Authorization header

Client storage
localStorage / memory
```

### Hybrid Token Model (SPA에서 자주 사용)

```
Authentication proof
AccessToken / RefreshToken

Transport
Authorization header / Cookie

Client storage
memory / cookie
```

---

# 5. Summary

인증 모델은 다음 세 가지 질문으로 정리할 수 있다.

1. 서버는 어떤 **authentication proof**로 사용자를 식별하는가
2. 그 proof는 요청에 **어떻게 전달되는가 (transport)**
3. 클라이언트는 proof를 **어디에 저장하는가 (client storage)**

이 세 요소의 조합이 **Authentication Model**을 구성한다.

---

# Quick Check — 자주 헷갈리는 질문

## Q1. Cookie는 storage인가 transport인가?

둘 다이다.

Cookie는

1. 브라우저 내부에 저장되는 **저장소 역할**을 하며
2. HTTP 요청 시 자동으로 포함되는 **전달 메커니즘 역할**도 한다.

즉 cookie는 다음 두 층을 동시에 가진다.

Browser Cookie Store (storage)
↓
HTTP Cookie Header (transport)

[이 때문에 인증 구조를 설명할 때 혼란이 자주 발생한다.](#q5-왜-cookie가-인증-구조-설명을-헷갈리게-만드는가)

---

## Q2. JWT는 반드시 Authorization header로 보내야 하는가?

아니다.

JWT는 **authentication proof**일 뿐이며 전달 방식은 선택할 수 있다.

가능한 방식

```
Authorization header
Cookie
Query param
Body
```

다만 보안 및 관례상 **Authorization header** 방식이 가장 일반적이다.

---

## Q3. SessionId도 Authorization header로 보낼 수 있는가?

가능하다.

예

```
Authorization: Session abc123
```

또는

```
Authorization: Bearer abc123
```

다만 웹 애플리케이션에서는 역사적으로 **sessionId + Cookie** 조합이 표준처럼 사용되어 왔다.

---

## Q4. JWT와 Session의 차이는 무엇인가?

차이는 **proof의 검증 방식**이다.

Session

```
sessionId
→ session store 조회
→ 사용자 식별
```

JWT

```
JWT
→ signature verify
→ 사용자 식별
```

즉

- Session → stateful proof
- JWT → self-contained proof

---

## Q5. 왜 Cookie가 인증 구조 설명을 헷갈리게 만드는가?

대부분의 클라이언트 저장소는 **저장 기능만 수행한다.**

예

- localStorage
- sessionStorage
- memory
- IndexedDB

이 저장소들은 요청을 보낼 때 **자동으로 HTTP 요청에 포함되지 않는다.**

반면 Cookie는

1. 브라우저에 저장되며
2. HTTP 요청 시 자동으로 포함된다.

즉 cookie는

storage + automatic transport

두 역할을 동시에 수행한다.

이 때문에 인증 모델을 설명할 때

- storage
- transport

개념이 서로 섞여 보이기 쉽다.
