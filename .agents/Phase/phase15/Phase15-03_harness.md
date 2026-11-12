> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 15-03: 프론트엔드 소셜 로그인 인가 및 계정 관리 UI 완성 (Frontend Social OAuth2 & Account Linking UI)

## 📌 목표 및 개요
백엔드에 구축된 카카오/네이버 OAuth2 파이프라인(Phase 15-01, 15-02)을 프론트엔드(`@boim/web`)와 실연동합니다.
로그인 및 회원가입 모달/화면에서 소셜 로그인 인가 플로우를 시작하고, 인가 완료 후 리다이렉트되는 OAuth 콜백 전용 라우트(`OAuthCallbackPage.tsx`)를 구축하여 JWT 토큰을 안전하게 수신/저장하고 메인 화면으로 전환합니다.
또한 마이페이지/설정(`SocialAccountsSettings.tsx`)에서 현재 카카오/네이버 계정의 연동 상태를 실시간 확인하고, 원클릭으로 소셜 계정 연동 및 연동 해제(Unlink)를 수행하는 UI를 완성합니다.

---

## 📋 세부 단계별 체크리스트 및 구현 기록

### 1. 프론트엔드 OAuth API 클라이언트 및 커스텀 훅 연동
- [x] **`apps/web/src/features/auth/components/Login.tsx`:**
  - `handleSocialLogin` 함수를 통해 백엔드 OAuth 인가 엔드포인트(`${baseUrl}/auth/${provider}`) 리다이렉트 연결
  - 카카오 / 네이버 공식 브랜드 컬러 및 SVG 벡터 로고 버튼 연동

### 2. OAuth 콜백 처리 전용 페이지 및 라우팅 구축
- [x] **`apps/web/src/pages/OAuthCallbackPage.tsx` 신설 완료:**
  - URL 쿼리 파라미터(`token`, `code`, `state`, `error`, `error_description`) 파싱
  - **토큰 수신 시:** `authStore.login()` 호출하여 세션 동기화 후 메인 대시보드(`/`)로 즉시 전환
  - **인가 코드(`code`) 수신 시:** 백엔드 `POST /auth/kakao/login` 또는 `POST /auth/naver/login` 직접 호출 후 로그인 처리
  - **에러/취소 수신 시:** 직관적인 에러 화면 및 "로그인 화면으로 복귀" 버튼 제공
- [x] **`apps/web/src/router/index.tsx`에 `/auth/callback` 라우트 등록 완료**

### 3. 마이페이지/설정 소셜 계정 연동 현황 및 관리 UI
- [x] **`apps/web/src/features/settings/components/SocialAccountsSettings.tsx`:**
  - `GET /auth/social/status`를 통한 카카오/네이버 연동 여부(linked) 및 연동 이메일 실시간 표시
  - 연동하기 클릭 시 소셜 인가 연동 및 Mock fallback 지원
  - 연동 해제(Unlink) 클릭 시 안전한 확인 다이얼로그 후 연결 끊기 처리

### 4. 프론트엔드 컴포넌트 단위 테스트 및 전사 품질 검증
- [x] **단위 테스트 스위트 작성:**
  - `apps/web/src/pages/OAuthCallbackPage.spec.tsx` (로딩 상태, 토큰 정상 로그인, 에러 화면 및 복귀, 인가 코드 로그인 5개 테스트 100% Pass)
  - `apps/web/src/features/settings/components/SocialAccountsSettings.spec.tsx` (연동 상태 조회, 연동/해제 인터랙션 100% Pass)
- [x] **전사 테스트 검증 결과:**
  - `apps/web` 전사 테스트: **43개 테스트 파일, 184개 테스트 100% Pass (기존 179개 대비 +5개 신규 테스트 추가)**
