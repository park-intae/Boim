> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 15-02: 백엔드 네이버 OAuth2 실연동 파이프라인 (Naver OAuth2 Backend Pipeline)

## 📌 목표 및 개요
네이버 Developers REST API 사양에 맞춘 정규 OAuth2 인가 코드(Authorization Code) 승인, 토큰 교환, 프로필 파싱 및 사용자 DB 자동 연동/가입 파이프라인을 구축합니다.
특히 네이버 OAuth2의 핵심 보안 요구사항인 **CSRF 방지용 `state` 파라미터 생성 및 HMAC-SHA256 기반 위변조 검증 로직**을 견고하게 적용하고, Passport `NaverStrategy` 및 REST 컨트롤러 엔드포인트를 완성하여 단위 테스트로 100% 검증합니다.
(실제 상용 키 발급 및 브라우저 실연동 E2E 테스트는 프론트엔드 완료 후 Phase 15-04에서 진행합니다.)

---

## 📋 세부 단계별 체크리스트 및 구현 기록

### 1. CSRF 방지용 OAuth State 보안 파이프라인 정립
- [x] **`SocialAuthService.generateOAuthState()` 구현:**
  - `timestamp.nonce.signature` 구조의 HMAC-SHA256 서명 기반 무상태(Stateless) state 토큰 생성
- [x] **`SocialAuthService.verifyOAuthState(state)` 구현:**
  - 10분 유효 시간 체크 및 64자리 SHA256 HEX 서명 정밀 검증 (`crypto.timingSafeEqual`)
  - 위변조/만료된 state 전달 시 즉시 `UnauthorizedException` 차단
  - 단위 테스트(`social-auth.service.spec.ts`)에서 정상 발급, 위변조 차단, 만료 차단 케이스 100% 검증 통과

### 2. 네이버 REST API 토큰 교환 & 프로필 파싱 파이프라인
- [x] **`SocialAuthService.exchangeNaverCode(code, state)` 구현:**
  - state 검증 후 네이버 토큰 교환 엔드포인트(`https://nid.naver.com/oauth2.0/token`) 호출 및 Access Token 추출
  - 개발/테스트 모드(Mock fallback) 지원
- [x] **`SocialAuthService.getNaverProfile(accessToken)` 구현:**
  - 네이버 프로필 API(`GET https://openapi.naver.com/v1/nid/me`) 호출 및 `response` 내 `id`, `email`, `name`, `nickname` 파싱
- [x] **`SocialAuthService.processSocialUser()` 연동:**
  - 네이버 계정 로그인, 기존 로컬 이메일 일치 시 자동 연동, 신규 유저 생성, 30일 JWT 토큰 발급 완비

### 3. Passport NaverStrategy 실연동 및 AuthController 엔드포인트 완비
- [x] **`apps/api/src/auth/naver.strategy.ts` 고도화:**
  - `SocialAuthService` 정식 주입 및 프로필 수신 시 `processSocialUser()` 호출하여 DB 유저/토큰 반환
- [x] **`apps/api/src/auth/naver.strategy.spec.ts` 단위 테스트 작성:**
  - 전략 정상 초기화, validate 호출 시 서비스 연동 및 예외 처리 테스트 100% Pass
- [x] **`apps/api/src/auth/auth.controller.ts` 네이버 엔드포인트 완비:**
  - `GET /api/auth/naver`: Passport 네이버 인가 페이지 리다이렉트
  - `GET /api/auth/naver/callback`: 인가 완료 후 프론트엔드 리다이렉트
  - `POST /api/auth/naver/login`: SPA/모바일용 인가 코드 & state 수신 직접 로그인
  - `POST /api/auth/naver/link` & `POST /api/auth/naver/unlink`: 로그인 회원 네이버 계정 연동 및 연동 해제
- [x] **`apps/api/src/auth/auth.controller.spec.ts` 단위 테스트 통과:**
  - 네이버 콜백, 직접 로그인, 계정 연동/해제 엔드포인트 검증 완료

### 4. 단위 테스트 무결성 검증 기록
- [x] **테스트 통과 결과:**
  - `src/auth` 단위 테스트: **8개 스위트, 69개 테스트 100% Pass**
  - `apps/api` 전사 단위/통합 테스트: **27개 스위트, 192개 테스트 100% Pass (기존 대비 +4개 신규 테스트 추가)**
