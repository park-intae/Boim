> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 15: 상용 소셜 OAuth2 (카카오 / 네이버) 실연동 및 계정 통합 (Production OAuth2 Integration)

## 📌 목표 및 개요
현재 간이 모킹/시뮬레이션 상태인 카카오 및 네이버 소셜 로그인을 실제 상용 개발자 센터(Kakao Developers, Naver Developers)의 REST API 키, Secret 및 Redirect URI를 통한 정규 OAuth2 인가 코드 승인 플로우로 실연동합니다. 또한 기존 이메일 기반 로컬 회원 계정과 소셜 계정 간의 안전한 1:N 연동/해제(Account Linking/Unlinking) 및 토큰 갱신 파이프라인을 완성하여 모든 기능이 완비된(Feature-Complete) 상태를 달성합니다.

---

## 📋 세부 체크리스트

### 1. Phase 15-01: 백엔드 카카오 OAuth2 실연동 파이프라인
- [x] 카카오 인가 코드 수신 콜백 엔드포인트(`GET /auth/kakao/callback`, `POST /auth/kakao/login`) 및 토큰 교환(`POST https://kauth.kakao.com/oauth/token`) 연동
- [x] 카카오 사용자 정보 API(`GET https://kapi.kakao.com/v2/user/me`) 파싱 및 사용자 DB 매핑
- [x] 미가입 유저 자동 회원가입 및 기존 유저 소셜 연동 처리 로직 완비

### 2. Phase 15-02: 백엔드 네이버 OAuth2 실연동 파이프라인
- [x] 네이버 인가 코드 수신 콜백 엔드포인트(`GET /auth/naver/callback`, `POST /auth/naver/login`) 및 토큰 교환(`https://nid.naver.com/oauth2.0/token`) 연동
- [x] 네이버 회원 프로필 조회 API(`GET https://openapi.naver.com/v1/nid/me`) 파싱 및 DB 매핑
- [x] CSRF 방지를 위한 HMAC-SHA256 state 파라미터 검증 보안 파이프라인 구축

### 3. Phase 15-03: 프론트엔드 소셜 로그인 인가 및 계정 관리 UI 완성
- [x] 로그인 및 회원가입 화면에서 카카오/네이버 인가 URL 리다이렉트 처리
- [x] OAuth 콜백 처리용 전용 라우트(`OAuthCallbackPage.tsx`) 및 로딩/에러/복귀 UI
- [x] 마이페이지/설정(`SocialAccountsSettings.tsx`)에서 소셜 계정 연동 현황 확인 및 연동/연동 해제(Unlink) UI 구현

### 4. Phase 15-04: 소셜 인증 통합 테스트 및 서비스 런칭 최종 점검
- [x] 소셜 인증 단위/E2E 테스트 스위트 작성 및 모킹/실서버 격리 검증 (DB 스키마 누락 컬럼 동기화 완료)
- [x] 전사 테스트(376개 테스트 100% Pass), 린트, 빌드 100% 무결성 검증
- [x] `CHANGELOG.md` 및 `README.md` 동기화 및 2-File Rule 하네스 일원화 완료
