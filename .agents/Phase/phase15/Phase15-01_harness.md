> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 15-01: 백엔드 카카오 OAuth2 실연동 파이프라인 (Kakao OAuth2 Backend Pipeline)

## 📌 목표 및 개요
기존의 간이 모킹(Mock) 소셜 로그인을 탈피하여, 카카오 공식 Developers REST API 사양에 맞춘 정규 OAuth2 인가 코드(Authorization Code) 승인, 토큰 교환, 프로필 파싱 및 사용자 DB 자동 연동/가입 파이프라인을 구축합니다.
개발 및 단위 테스트 단계에서는 Mock 격리 듀얼 모드로 안전하게 검증하며, 실제 개발자 센터 API 키 주입 및 브라우저 실연동 검증은 프론트엔드 UI까지 모두 완성된 후 **Phase 15-04(통합 테스트 단계)**에서 수행합니다.

---

## 📋 세부 단계별 체크리스트 및 구현 기록

### 1. 카카오 OAuth2 환경 변수 템플릿 및 듀얼 모드(Fallback Mock) 구성
- [x] **환경 변수 규격 정의 (`apps/api/.env.example`, `.env`):**
  - `KAKAO_CLIENT_ID`: 카카오 REST API 키 (개발/테스트 중에는 `mock-kakao-client-id`로 fallback)
  - `KAKAO_CLIENT_SECRET`: 클라이언트 시크릿 (선택 사항)
  - `KAKAO_CALLBACK_URL`: `http://localhost:4000/api/auth/kakao/callback`
  - `FRONTEND_URL`: `http://localhost:5173`
  - ※ 실제 상용 키 발급 및 브라우저 실연동 E2E 테스트는 프론트엔드 완료 후 **Phase 15-04**에서 진행

### 2. 백엔드 카카오 REST API 연동 및 계정 처리 파이프라인 (`SocialAuthService`)
- [x] **`apps/api/src/auth/social-auth.service.ts` 구현 완료:**
  - **`exchangeKakaoCode(code, redirectUri)`:** 카카오 인증 서버(`POST https://kauth.kakao.com/oauth/token`)로 인가 코드를 전송하여 `access_token` 교환 (Mock 모드 안전 격리)
  - **`getKakaoProfile(accessToken)`:** 카카오 리소스 서버(`GET https://kapi.kakao.com/v2/user/me`)를 호출하여 `id`, `email`, `nickname` 추출 및 정규화
  - **`processSocialUser(profile, linkUserId?)`:**
    - **계정 연동 (linkUserId 전달 시):** 현재 로그인 유저의 `providerId`에 `kakao:${id}` 누적 업데이트 (타 계정 중복 연동 시 `ConflictException` 방어)
    - **자동 연동 (기존 이메일 일치 시):** 동일한 이메일을 가진 로컬 회원이 존재하면 카카오 계정 자동 연동
    - **신규 가입:** 일치하는 계정이 없을 경우 신규 회원 자동 생성 후 30일 JWT 토큰 세트(`accessToken`, `refreshToken`) 즉시 발급
  - **`unlinkSocialAccount(userId, 'kakao')`:** 사용자 `providerId`에서 `kakao:` 식별자 제거 및 연동 해제

### 3. Passport Strategy & AuthController 엔드포인트 구축
- [x] **`apps/api/src/auth/kakao.strategy.ts` 고도화:**
  - `SocialAuthService` 주입 및 프로필 수신 시 `processSocialUser()` 호출하여 DB 유저 및 토큰 세트 반환
- [x] **`apps/api/src/auth/auth.controller.ts` 카카오 엔드포인트 완성:**
  - `GET /api/auth/kakao`: Passport 기반 카카오 로그인 인가 페이지 리다이렉트
  - `GET /api/auth/kakao/callback`: 카카오 인가 완료 후 프론트엔드 리다이렉트
  - `POST /api/auth/kakao/login`: SPA/모바일 앱용 인가 코드 수신 직접 로그인 (`{ code, redirectUri }`)
  - `POST /api/auth/kakao/link`: 로그인 회원 카카오 계정 연동 (`@UseGuards(AuthGuard('jwt'))`)
  - `POST /api/auth/kakao/unlink`: 카카오 계정 연동 해제 (`@UseGuards(AuthGuard('jwt'))`)

### 4. 단위 테스트 및 전사 품질 검증 기록
- [x] **테스트 스위트 작성 및 100% Pass:**
  - `apps/api/src/auth/social-auth.service.spec.ts` (토큰 교환, 프로필 조회, 자동가입, 계정연동, 중복예외, 연동해제 테스트)
  - `apps/api/src/auth/kakao.strategy.spec.ts` (전략 validate 및 서비스 연동 검증)
  - `apps/api/src/auth/auth.controller.spec.ts` (카카오 콜백, REST 로그인, 연동/해제 엔드포인트 검증)
- [x] **테스트 통과 결과:**
  - `src/auth` 단위 테스트: **8개 스위트, 65개 테스트 100% Pass**
  - `apps/api` 전사 단위/통합 테스트: **27개 스위트, 188개 테스트 100% Pass**
