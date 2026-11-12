> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 15 통합 서브 하네스 (Phase 15 Sub-Harness)

> **안내:** 본 문서는 Phase 15 마일스톤 완료 후 2-File Rule에 따라 분산되어 있던 `Phase 15-01`부터 `Phase 15-04`까지의 모든 세부 하위 하네스 이력, 기술 구현 상세 및 체크리스트를 하나로 통합 보존한 공식 문서입니다.

---

## 📑 1. Phase 15-01: 백엔드 카카오 OAuth2 실연동 파이프라인
- [x] **카카오 OAuth2 환경 변수 템플릿 및 듀얼 모드(Fallback Mock) 구축:**
  - `apps/api/.env.example` 및 `.env`에 `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`, `KAKAO_CALLBACK_URL` 규격 정립
  - 키 미입력 및 로컬 테스트 환경 시 `mock-kakao-client-id`로 안전하게 자동 격리 동작
- [x] **`SocialAuthService` 카카오 REST API 연동 로직 완비:**
  - `exchangeKakaoCode(code, redirectUri)`: 카카오 인증 서버(`POST https://kauth.kakao.com/oauth/token`) 토큰 교환
  - `getKakaoProfile(accessToken)`: 카카오 리소스 서버(`GET https://kapi.kakao.com/v2/user/me`) 사용자 프로필(ID, 이메일, 닉네임) 조회
  - `processSocialUser(profile, linkUserId?)`: 
    - Case A (계정 연동): 로그인 회원 `providerId`에 `kakao:${id}` 누적 업데이트 (타 계정 중복 연동 방어)
    - Case B (자동 연동): 기존 동일 이메일 회원 존재 시 자동 연동
    - Case C (신규 가입): 미가입 회원 자동 생성 및 30일 JWT 발급
  - `unlinkSocialAccount(userId, 'kakao')`: 연동 해제 로직 완비
- [x] **Passport `KakaoStrategy` & `AuthController` 엔드포인트 연동:**
  - `GET /api/auth/kakao`: Passport 기반 카카오 인가 리다이렉트
  - `GET /api/auth/kakao/callback`: 인가 완료 후 프론트엔드 토큰 전달 리다이렉트
  - `POST /api/auth/kakao/login`: SPA/모바일용 인가 코드 수신 직접 로그인
  - `POST /api/auth/kakao/link` & `POST /api/auth/kakao/unlink`: 계정 연동 및 연동 해제
- [x] **단위 테스트:** `social-auth.service.spec.ts`, `kakao.strategy.spec.ts`, `auth.controller.spec.ts` 100% Pass

---

## 📑 2. Phase 15-02: 백엔드 네이버 OAuth2 실연동 파이프라인
- [x] **CSRF 방지용 HMAC-SHA256 OAuth State 보안 파이프라인 구축:**
  - `generateOAuthState()`: `timestamp.nonce.signature` 구조의 무상태(Stateless) 서명 토큰 생성
  - `verifyOAuthState(state)`: 10분 유효 시간 체크 및 64자리 SHA256 HEX 서명 정밀 검증 (`crypto.timingSafeEqual`), 위변조 차단
- [x] **`SocialAuthService` 네이버 REST API 연동 로직 완비:**
  - `exchangeNaverCode(code, state)`: state 검증 후 토큰 교환 엔드포인트(`https://nid.naver.com/oauth2.0/token`) 통신
  - `getNaverProfile(accessToken)`: 네이버 회원 프로필(`https://openapi.naver.com/v1/nid/me`) 파싱 및 정규화
  - `unlinkSocialAccount(userId, 'naver')`: 네이버 연동 해제
- [x] **Passport `NaverStrategy` & `AuthController` 엔드포인트 연동:**
  - `GET /api/auth/naver`, `GET /api/auth/naver/callback`, `POST /api/auth/naver/login`, `POST /api/auth/naver/link`, `POST /api/auth/naver/unlink`
- [x] **단위 테스트:** `naver.strategy.spec.ts` 신설 및 네이버 관련 단위 테스트 100% Pass

---

## 📑 3. Phase 15-03: 프론트엔드 소셜 로그인 인가 및 계정 관리 UI 완성
- [x] **OAuth 콜백 전용 라우트 및 페이지 구축 (`OAuthCallbackPage.tsx`):**
  - `/auth/callback` 라우트 등록 (`apps/web/src/router/index.tsx`)
  - URL 파라미터(`token`, `code`, `state`, `error`, `error_description`) 파싱
  - 토큰 수신 시 `authStore.login()` 세션 동기화 후 메인 대시보드로 이동
  - 인가 코드 수신 시 백엔드 직접 교환 로그인 처리
  - 인가 에러/취소 수신 시 직관적인 에러 안내 및 로그인 복귀 버튼 제공
- [x] **로그인 및 설정 패널 연동 UI:**
  - `Login.tsx`: 카카오/네이버 공식 로고 버튼 및 인가 플로우 연결
  - `SocialAccountsSettings.tsx`: 카카오/네이버 연동 상태 실시간 조회, [연동하기], [연동 해제] 인터랙션 완성
- [x] **프론트엔드 단위 테스트:** `OAuthCallbackPage.spec.tsx` (5개 테스트 100% Pass), `SocialAccountsSettings.spec.tsx` 100% Pass

---

## 📑 4. Phase 15-04: 소셜 인증 통합 검증, 하네스 일원화 및 마일스톤 완료
- [x] **데이터베이스 스키마 동기화 완료:**
  - `Notification` 테이블 누락 컬럼(`userId`) `prisma db push`를 통해 실제 PostgreSQL DB에 완벽 동기화 완료 (500 에러 근본 해소)
- [x] **상용 Developers 키 발급 시점 최적화 전략 확립:**
  - 로컬 개발 단계는 안전한 듀얼 모드(Mock 격리)로 100% 기능/보안 무결성 확보
  - 실제 개발자 센터 키 발급 및 운영 도메인 등록은 Phase 17 상용 Docker/도메인 배포 완료 후 딱 한 번 정식 등록하여 중복 작업 방지
- [x] **모노레포 전사 품질 검증 (All Green):**
  - 린트: `pnpm lint` 0 Errors 통과
  - 빌드: `pnpm build` (`@boim/api`, `@boim/web`) 100% 성공
  - 전사 테스트: `pnpm test` 총 70개 파일, **376개 테스트 100% Pass** (백엔드 192개 + 프론트엔드 184개)
- [x] **문서 최신화 및 2-File Rule 준수:**
  - `Phase15_sub_harness.md` 단일 파일로 일원화 통합 및 기존 하위 파일 정리
  - `Phase_harness.md`, `CHANGELOG.md`, `README.md` 최신화 완료
