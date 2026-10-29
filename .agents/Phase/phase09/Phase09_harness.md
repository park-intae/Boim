> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것

# Phase 09: 데이터베이스 연동 및 인증 인프라 고도화 (통합 요약)

본 문서는 Phase 09에서 진행된 데이터베이스 연동, 비밀번호 암호화, 인증/인가 보안, 회원가입/PASS 인증, 소셜 연동의 전 과정을 하나로 통합·요약한 마스터 하네스 문서입니다.

---

## 📋 핵심 목표 및 개요
- DB 기반 사용자 인증 및 비밀번호 `bcrypt` 단방향 해시 암호화 적용
- 클라이언트 세션/로컬 스토리지 하이브리드 토큰 관리 및 비인가 라우트 보호
- 신규 사용자 회원가입 및 간이 PASS 본인인증 파이프라인 구축
- 설정 패널 내 간이(Mock) 카카오/네이버 소셜 계정 연동 및 380px 반응형 UI 최적화

---

## 🛠️ 세부 작업 및 완료 내역 요약

### 1. 비밀번호 암호화 & DB 연동 (기초 인프라)
- [x] 백엔드 `bcrypt` 도입 및 `seed.ts` 스크립트를 통한 안전한 테스트 유저(`test@boim.com` / `password123`) DB 시딩
- [x] `AuthService.login` 및 `reauthenticate`에 Prisma 연동 및 `bcrypt.compare` 해시 검증 적용
- [x] 단위 테스트 통과 (Jest 81개 테스트)

### 2. 로그아웃 & 세션 정리 ([09-02])
- [x] 백엔드 `POST /auth/logout` API 구현 및 DB `refreshToken` 무효화 처리
- [x] 프론트엔드 `useLogout` 훅 구현: 헤더 프로필 메뉴 연동 및 `localStorage`/`sessionStorage` 전면 초기화

### 3. 하이브리드 스토리지 & 라우트 보호 ([09-03])
- [x] `authStore.ts` 내 하이브리드 스토리지 어댑터 구현:
  - 기기 기억하기(Remember Me) **ON**: `localStorage` 영구 보관
  - 기기 기억하기(Remember Me) **OFF**: `sessionStorage` 브라우저 세션 유지
- [x] `ProtectedRoute.tsx` 컴포넌트 구현: 미인증 접근 시 `/login` 리다이렉트 처리

### 4. 사용자 프로필 DB 동기화 ([09-04])
- [x] 로그인 API 응답에 DB의 실제 사용자 이름(`name`) 및 본인인증 여부(`isPassVerified`) 포함
- [x] 헤더 및 사이드바 프로필 UI에 실제 DB 정보 실시간 반영

### 5. 회원가입 플로우 & PASS 본인인증 ([09-05])
- [x] 백엔드 `POST /auth/register` (비밀번호 해시 저장) 및 PASS 인증 완료 시 `isPassVerified=true`, `passCi` 갱신
- [x] 프론트엔드 회원가입 폼(`SignUp.tsx`) 및 통신사 간이 PASS 인증 화면(`PassVerification.tsx`) 연동
- [x] 신규 가입 ➔ PASS 인증 ➔ 캘린더 메인 대시보드 진입 원스톱 UX 완성

### 6. 간이(Mock) 소셜 계정 연동 & 레이아웃 최적화 ([09-06])
- [x] 백엔드 소셜 연동 상태 조회(`GET /auth/social/status`) 및 간이 연동/해제 API 구현
- [x] 프론트엔드 설정 패널 내 `SocialAccountsSettings.tsx` 구현
- [x] 380px 사이드 패널에 맞춘 반응형 레이아웃(`shrink-0`, `min-w-0`, `truncate`, 여백 최적화)
- [x] 텍스트 깨짐 방지를 위해 고해상도 공식 벡터 SVG 아이콘(`KakaoLogo`, `NaverLogo`) 전면 적용
- [x] 향후 실제 카카오/네이버 공식 SDK 및 REST API 즉시 전환을 위한 상세 코드 주석 배치

---

## 🧪 품질 보증 (QA) 및 테스트 결과
- **프론트엔드:** Vitest 18개 테스트 파일 / **51개 테스트 전체 통과 (100% Pass)**
- **백엔드:** Jest 16개 테스트 파일 / **81개 테스트 전체 통과 (100% Pass)**
- **정적 분석:** `oxlint` 에러 0건
- **수동 QA:** 회원가입 ➔ PASS 인증 ➔ 로그인 ➔ 소셜 연동/해제 ➔ 로그아웃 전 시나리오 검증 완료
