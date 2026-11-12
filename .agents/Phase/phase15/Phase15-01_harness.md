> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 15-01: 카카오 Developers 콘솔 설정 및 백엔드 OAuth2 실연동 파이프라인

## 📌 목표 및 개요
기존의 간이 모킹(Mock) 소셜 로그인을 탈피하여, 카카오 공식 Developers REST API 사양에 맞춘 정규 OAuth2 인가 코드(Authorization Code) 승인, 토큰 교환, 프로필 파싱 및 사용자 DB 자동 연동/가입 파이프라인을 구축합니다.
사용자 직접 콘솔 설정 가이드를 체계화하고, 환경변수 유무에 따라 안전하게 동작하는 듀얼 모드(실서비스 연동 / Fallback Mock)를 지원하여 개발 및 테스트 무결성을 보장합니다.

---

## 📋 세부 단계별 체크리스트 및 구현 기록

### 1. 카카오 개발자 센터 콘솔 가이드 및 환경 변수 구성
- [x] **카카오 개발자 센터(Kakao Developers) 설정 가이드 정립:**
  - **콘솔 URL:** [developers.kakao.com](https://developers.kakao.com)
  - **애플리케이션 생성:** `Boim` 앱 등록
  - **REST API 키:** [앱 설정] ➔ [앱 키]에서 발급 확인
  - **플랫폼 등록:** [Web] 사이트 도메인에 `http://localhost:5173`, `http://localhost:4000` 등록
  - **카카오 로그인 활성화:** [제품 설정] ➔ [카카오 로그인] 활성화 `ON`
  - **Redirect URI 등록:**
    - 프론트엔드 라우트: `http://localhost:5173/auth/callback`
    - 백엔드 API 콜백: `http://localhost:4000/api/auth/kakao/callback`
  - **동의항목 설정:** 닉네임(필수), 카카오계정 이메일(선택 또는 필수 동의)
- [x] **환경 변수 구성 및 Fallback 듀얼 모드 구축:**
  - `apps/api/.env.example` 및 `apps/api/.env`에 카카오 OAuth2 환경변수 템플릿 등록:
    - `KAKAO_CLIENT_ID`: 카카오 REST API 키 (미설정 시 `mock-kakao-client-id`로 fallback)
    - `KAKAO_CLIENT_SECRET`: 클라이언트 시크릿 (선택 사항)
    - `KAKAO_CALLBACK_URL`: `http://localhost:4000/api/auth/kakao/callback`
    - `FRONTEND_URL`: `http://localhost:5173`

---

### 2. 백엔드 카카오 REST API 연동 및 계정 처리 파이프라인 (`SocialAuthService`)
- [x] **`apps/api/src/auth/social-auth.service.ts` 구현 완료:**
  - **`exchangeKakaoCode(code, redirectUri)`:**
    - 카카오 인증 서버(`POST https://kauth.kakao.com/oauth/token`)로 인가 코드를 전송하여 `access_token` 교환
    - Mock 모드일 경우 `mock_kakao_token_for_${code}`로 안전하게 격리 처리
  - **`getKakaoProfile(accessToken)`:**
    - 카카오 리소스 서버(`GET https://kapi.kakao.com/v2/user/me`)를 호출하여 `id`, `email`, `nickname` 추출 및 정규화
  - **`processSocialUser(profile, linkUserId?)`:**
    - **케이스 A (계정 연동 - linkUserId 전달 시):** 현재 로그인 유저의 `providerId`에 `kakao:${id}` 누적 업데이트 (타 계정 중복 연동 시 `ConflictException` 방어)
    - **케이스 B (자동 연동 - 기존 이메일 일치 시):** 동일한 이메일을 가진 로컬 회원이 존재하면 카카오 계정 자동 연동
    - **케이스 C (신규 가입):** 일치하는 계정이 없을 경우 신규 회원 자동 생성 후 30일 JWT 토큰 세트(`accessToken`, `refreshToken`) 즉시 발급
  - **`unlinkSocialAccount(userId, 'kakao')`:**
    - 사용자 `providerId`에서 `kakao:` 식별자 제거 및 연동 해제

---

### 3. Passport Strategy & AuthController 엔드포인트 구축
- [x] **`apps/api/src/auth/kakao.strategy.ts` 고도화:**
  - `SocialAuthService` 주입 및 프로필 수신 시 `processSocialUser()` 호출하여 DB 유저 및 토큰 세트 반환
- [x] **`apps/api/src/auth/auth.controller.ts` 카카오 엔드포인트 완성:**
  - `GET /api/auth/kakao`: Passport 기반 카카오 로그인 인가 페이지 리다이렉트
  - `GET /api/auth/kakao/callback`: 카카오 인가 완료 후 프론트엔드(`FRONTEND_URL/auth/callback?token=...&refreshToken=...`) 리다이렉트
  - `POST /api/auth/kakao/login`: SPA/모바일 앱용 인가 코드 수신 직접 로그인 (`{ code, redirectUri }`)
  - `POST /api/auth/kakao/link`: 로그인 회원 카카오 계정 연동 (`@UseGuards(AuthGuard('jwt'))`)
  - `POST /api/auth/kakao/unlink`: 카카오 계정 연동 해제 (`@UseGuards(AuthGuard('jwt'))`)

---

### 4. 단위 테스트 및 전사 품질 검증 기록
- [x] **테스트 스위트 작성 및 100% Pass:**
  - `apps/api/src/auth/social-auth.service.spec.ts` (토큰 교환, 프로필 조회, 자동가입, 계정연동, 중복예외, 연동해제 테스트)
  - `apps/api/src/auth/kakao.strategy.spec.ts` (전략 validate 및 서비스 연동 검증)
  - `apps/api/src/auth/auth.controller.spec.ts` (카카오 콜백, REST 로그인, 연동/해제 엔드포인트 검증)
- [x] **테스트 통과 결과:**
  - `src/auth` 단위 테스트: **8개 스위트, 65개 테스트 100% Pass**
  - `apps/api` 전사 단위/통합 테스트: **27개 스위트, 188개 테스트 100% Pass (기존 170개 대비 +18개 신규 테스트 추가)**
