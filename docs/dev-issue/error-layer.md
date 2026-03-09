1. 권장 에러 계층

전체 구조는 이렇게 잡으면 됩니다.

HTTP / Axios / Interceptor
↓
AppError
↓
Service layer translation
↓
AuthRequiredError | FeatureError
↓
Page

즉,

apiClient는 인프라 문제만 말한다

서비스 레이어는 앱 의미로 번역한다

페이지는 앱 의미 에러만 처리한다

2. 계층별 역할
   2-1. AppError

이건 axios / HTTP / interceptor 계층의 공통 에러입니다.

예:

UNAUTHORIZED

NETWORK

SERVER

즉, 아직은 “로그인 페이지로 보내야 한다” 같은 UI 의미가 없습니다.
그냥 요청이 어떤 종류로 실패했는가만 표현합니다.

예시:

export type AppErrorCode = "UNAUTHORIZED" | "NETWORK" | "SERVER" | "UNKNOWN";

export class AppError extends Error {
code: AppErrorCode;
status?: number;

constructor(code: AppErrorCode, message?: string, status?: number) {
super(message ?? code);
this.name = "AppError";
this.code = code;
this.status = status;
}
}
2-2. AuthRequiredError

이건 앱 공통 인증 실패 에러입니다.

의미는 이겁니다.

이 요청은 인증이 필요하지만, 현재 인증 상태가 유효하지 않다.

포함되는 상황:

로그인 안 됨

AT 없음

AT 만료 + reissue 실패

RT 만료

세션 종료됨

즉 페이지는 AppError("UNAUTHORIZED")를 몰라도 되고,
이 에러만 보면 됩니다.

예시:

// src/services/authErrors.ts
export class AuthRequiredError extends Error {
constructor() {
super("AUTH_REQUIRED");
this.name = "AuthRequiredError";
}
}
2-3. 기능별 도메인 에러

각 서비스는 자기 기능에 맞는 에러를 가집니다.

예:

GuideDetailError

CreateGuideError

DeleteGuideError

CreateSessionError

이 에러들은 기능별 비즈니스 의미를 표현합니다.

예:

export type GuideDetailErrorCode = "NOT_FOUND" | "UNKNOWN";

export class GuideDetailError extends Error {
code: GuideDetailErrorCode;

constructor(code: GuideDetailErrorCode, message?: string) {
super(message ?? code);
this.name = "GuideDetailError";
this.code = code;
}
} 3. 추천 디렉토리 구조

지금 프로젝트 기준으로는 이 정도가 깔끔합니다.

src/
services/
apiClient.ts
authErrors.ts
sessionService.ts
guideDetailService.ts
guideDeleteService.ts
...

또는 에러를 조금 더 분리하면:

src/
services/
apiClient.ts
errors/
authErrors.ts
appErrors.ts

현재 규모에서는 services/authErrors.ts 정도로 시작해도 충분합니다.

4. 실제 변환 규칙
   규칙 1. apiClient는 AppError만 던진다

즉 여기서는 절대 navigate, GuideDetailError, AuthRequiredError를 만들지 않습니다.

역할은 여기까지입니다.

401 → AppError("UNAUTHORIZED")

네트워크 실패 → AppError("NETWORK")

5xx → AppError("SERVER")

규칙 2. 서비스 레이어가 번역한다

서비스 레이어에서만 아래 변환을 합니다.

AppError("UNAUTHORIZED") → AuthRequiredError

404 → GuideDetailError("NOT_FOUND")

409 NICKNAME_DUPLICATE → CreateSessionError("NICKNAME_DUPLICATE")

즉 서비스는 HTTP 에러를 기능 의미로 바꾸는 번역기입니다.

규칙 3. 페이지는 AppError를 모른다

페이지는 오직 이것만 처리합니다.

AuthRequiredError

기능별 도메인 에러

그 외 unknown

즉 페이지에서 이런 코드는 없애는 게 맞습니다.

if (err instanceof AppError && err.code === "UNAUTHORIZED") { ... }

이건 서비스로 내려야 합니다.

5. 추천 코드 예시
   5-1. authErrors.ts
   // src/services/authErrors.ts
   export class AuthRequiredError extends Error {
   constructor() {
   super("AUTH_REQUIRED");
   this.name = "AuthRequiredError";
   }
   }
   5-2. guideDetailService.ts
   import axios from "axios";
   import { apiClient, AppError } from "./apiClient";
   import type { GuideDetailDto } from "@/types/guide";
   import { AuthRequiredError } from "./authErrors";

export type GuideDetailErrorCode = "NOT_FOUND" | "UNKNOWN";

export class GuideDetailError extends Error {
code: GuideDetailErrorCode;

constructor(code: GuideDetailErrorCode, message?: string) {
super(message ?? code);
this.name = "GuideDetailError";
this.code = code;
}
}

export async function getGuideDetail(guideId: number): Promise<GuideDetailDto> {
try {
const res = await apiClient.get<GuideDetailDto>(`/api/guides/${guideId}`);
return res.data;
} catch (err) {
if (err instanceof AppError) {
if (err.code === "UNAUTHORIZED") {
throw new AuthRequiredError();
}

      throw new GuideDetailError("UNKNOWN");
    }

    if (axios.isAxiosError(err)) {
      if (err.response?.status === 404) {
        throw new GuideDetailError("NOT_FOUND");
      }
    }

    throw new GuideDetailError("UNKNOWN");

}
}
5-3. deleteGuideService.ts

삭제도 같은 규칙으로 맞춥니다.

import axios from "axios";
import { apiClient, AppError } from "./apiClient";
import { AuthRequiredError } from "./authErrors";

export type DeleteGuideErrorCode = "NOT_FOUND" | "FORBIDDEN" | "UNKNOWN";

export class DeleteGuideError extends Error {
code: DeleteGuideErrorCode;

constructor(code: DeleteGuideErrorCode, message?: string) {
super(message ?? code);
this.name = "DeleteGuideError";
this.code = code;
}
}

export async function deleteGuide(guideId: number): Promise<void> {
try {
await apiClient.delete(`/api/guides/${guideId}`);
} catch (err) {
if (err instanceof AppError) {
if (err.code === "UNAUTHORIZED") {
throw new AuthRequiredError();
}

      throw new DeleteGuideError("UNKNOWN");
    }

    if (axios.isAxiosError(err)) {
      if (err.response?.status === 404) {
        throw new DeleteGuideError("NOT_FOUND");
      }

      if (err.response?.status === 403) {
        throw new DeleteGuideError("FORBIDDEN");
      }
    }

    throw new DeleteGuideError("UNKNOWN");

}
}
5-4. GuideDetail.tsx

페이지는 훨씬 단순해집니다.

import { AuthRequiredError } from "@/services/authErrors";

...

catch (err) {
if (ignore) return;

if (err instanceof AuthRequiredError) {
navigate(buildLoginUrl(window.location.href), { replace: true });
return;
}

if (err instanceof GuideDetailError) {
setState({ type: "error", message: GUIDE_DETAIL_ERROR_MESSAGE[err.code] });
return;
}

setState({ type: "error", message: GUIDE_DETAIL_ERROR_MESSAGE.UNKNOWN });
}

onDelete도 동일합니다.

if (err instanceof AuthRequiredError) {
navigate(buildLoginUrl(window.location.href), { replace: true });
return;
} 6. 이렇게 하면 좋은 점
6-1. 페이지가 가벼워짐

페이지는 이제

인증 필요

기능 에러

알 수 없음

이 세 가지만 보면 됩니다.

6-2. 인터셉터 정책 변경이 쉬움

예를 들어 나중에

419도 인증 만료로 보겠다

498도 토큰 만료로 처리하겠다

이런 정책 변경이 생겨도 apiClient와 서비스만 고치면 됩니다.

페이지는 안 건드려도 됩니다.

6-3. 에러 의미가 선명해짐

AppError는 기술적 에러,
AuthRequiredError는 앱 의미 에러,
GuideDetailError는 기능 의미 에러.

이렇게 분리되면 코드 읽기가 훨씬 쉬워집니다.

7. 지금 프로젝트에 맞는 최종 원칙

당신 프로젝트 기준으로는 아래 원칙을 추천합니다.

인프라 계층

AppError

앱 공통 계층

AuthRequiredError

기능 계층

GuideDetailError

DeleteGuideError

CreateGuideError

CreateSessionError

페이지 계층

AuthRequiredError → 로그인 redirect

FeatureError → 메시지 표시

그 외 → UNKNOWN 메시지
