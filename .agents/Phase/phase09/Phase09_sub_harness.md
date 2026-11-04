> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것

# Phase 09 하위 작업 통합 하네스 (Phase 09 Sub-Harness)

본 문서는 Phase 09(데이터베이스 연동 및 인증 인프라 고도화) 과정에서 진행된 세부 하위 작업(Phase 09-01 ~ 09-06)의 실행 내역과 체크리스트를 하나로 통합 정리한 문서입니다.

---

## 📋 Phase 09-01: 비밀번호 암호화 & DB 연동 (기초 인프라)
- [x] 백엔드 `bcrypt` 도입 및 `seed.ts` 스크립트를 통한 안전한 테스트 유저(`test@boim.com` / `password123`) DB 시딩
- [x] `AuthService.login` 및 `reauthenticate`에 Prisma 연동 및 `bcrypt.compare` 단방향 해시 검증 적용
- [x] 보안 관련 Jest 단위 테스트 작성 및 통과 (Jest 81개 테스트 100% Pass)

---

## 📋 Phase 09-02: 로그아웃 & 세션 무효화
- [x] 백엔드 `POST /auth/logout` API 구현 및 DB `refreshToken` 무효화 처리
- [x] 프론트엔드 `useLogout` 훅 구현: 헤더 프로필 메뉴 연동 및 `localStorage`/`sessionStorage` 전면 초기화
- [x] 로그아웃 후 로그인 화면 리다이렉트 및 클라이언트 캐시 무효화

---

## 📋 Phase 09-03: 하이브리드 토큰 스토리지 & 라우트 보호
- [x] `authStore.ts` 내 하이브리드 스토리지 어댑터 구현:
  - 기기 기억하기(Remember Me) **ON**: `localStorage` 영구 보관
  - 기기 기억하기(Remember Me) **OFF**: `sessionStorage` 브라우저 세션 유지
- [x] `ProtectedRoute.tsx` 컴포넌트 구현: 미인증 사용자의 비인가 라우트 접근 차단 및 `/login` 리다이렉트
- [x] 만료 토큰 자동 감지 및 새로고침 시 인증 세션 복구 로직

---

## 📋 Phase 09-04: 사용자 프로필 DB 동기화
- [x] 로그인 API 응답에 DB의 실제 사용자 이름(`name`) 및 본인인증 여부(`isPassVerified`) 포함
- [x] 헤더 및 사이드바 프로필 UI에 실제 DB 정보 실시간 반영
- [x] 사용자 정보 변경 시 상단 프로필 동기화 처리

---

## 📋 Phase 09-05: 회원가입 플로우 & 간이 PASS 본인인증
- [x] 백엔드 `POST /auth/register` (비밀번호 해시 저장) 및 PASS 인증 완료 시 `isPassVerified=true`, `passCi` 갱신
- [x] 프론트엔드 신규 회원가입 폼 화면(`SignUp.tsx`) 구현
- [x] 통신사(SKT, KT, LGU+, 알뜰폰) 선택 및 간이 인증번호 발송/검증 모달 화면(`PassVerification.tsx`) 구현
- [x] 신규 가입 ➔ PASS 인증 ➔ 캘린더 메인 대시보드 진입 원스톱 UX 완성

---

## 📋 Phase 09-06: 간이(Mock) 소셜 계정 연동 & 레이아웃 최적화
- [x] 백엔드 소셜 연동 상태 조회(`GET /auth/social/status`) 및 간이 연동/해제 API 구현
- [x] 프론트엔드 설정 패널 내 `SocialAccountsSettings.tsx` 구현
- [x] 380px 사이드 패널에 맞춘 반응형 레이아웃(`shrink-0`, `min-w-0`, `truncate`, 여백 최적화)
- [x] 텍스트 깨짐 방지를 위해 고해상도 공식 벡터 SVG 아이콘(`KakaoLogo`, `NaverLogo`) 전면 적용
- [x] 향후 실제 카카오/네이버 공식 SDK 및 REST API 즉시 전환을 위한 상세 코드 주석 배치
