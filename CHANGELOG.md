# 📋 Boim 변경 이력 (Changelog)

이 문서는 **Boim** 프로젝트의 주요 변경 사항, 신규 기능 추가, 버그 수정 및 보안 패치 내역을 시간 및 단계(Phase)별로 기록하는 패치노트입니다.  
형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)의 규격을 준용합니다.

---

## [Phase 09] - 2026-10-29

### 🚀 Added (신규 기능)
- **회원가입 플로우 및 간이 PASS 본인인증 ([Phase 09-05](file:///C:/Users/pit19/OneDrive/바탕%20화면/프로그래밍/Boim/.agents/Phase/phase09/Phase09-05_harness.md))**
  - 신규 이메일/비밀번호 기반 회원가입 화면(`SignUp.tsx`) 구현
  - 간이 PASS 본인인증 화면(`PassVerification.tsx`) 및 통신사(SKT, KT, LGU+, 알뜰폰) 선택/인증번호 발송 로직 추가
  - 백엔드 `AuthService.register` 및 PASS 인증 완료 시 DB `isPassVerified` 및 `passCi` 동기화
- **설정 내 간이(Mock) 소셜 계정 연동 ([Phase 09-06](file:///C:/Users/pit19/OneDrive/바탕%20화면/프로그래밍/Boim/.agents/Phase/phase09/Phase09-06_harness.md))**
  - 설정 패널에 '소셜 계정 연동' 메뉴 및 상세 뷰(`SocialAccountsSettings.tsx`) 구현
  - 백엔드 카카오/네이버 연동 상태 조회(`GET /auth/social/status`) 및 원클릭 간이 연동/해제 API 구현
  - 향후 상용 OAuth2 연동으로 즉시 교체할 수 있는 공식 SDK/컴포넌트 삽입 가이드 주석 추가
- **로그아웃 및 세션 정리 ([Phase 09-02](file:///C:/Users/pit19/OneDrive/바탕%20화면/프로그래밍/Boim/.agents/Phase/phase09/Phase09-02_harness.md))**
  - 백엔드 `POST /auth/logout` 엔드포인트 및 DB `refreshToken` 제거
  - 프론트엔드 `useLogout` 훅을 통한 상태/스토리지 전면 초기화

### 🔒 Security & Infrastructure
- **비밀번호 암호화 및 시드 인프라**
  - 백엔드 `bcrypt` 도입 및 `seed.ts` 스크립트를 통한 안전한 테스트 계정(`test@boim.com`) 시딩
  - 로그인 및 재인증(Re-Auth) 시 DB 조회 및 `bcrypt.compare` 해시 검증 적용
- **하이브리드 인증 스토리지 및 라우트 보호 ([Phase 09-03](file:///C:/Users/pit19/OneDrive/바탕%20화면/프로그래밍/Boim/.agents/Phase/phase09/Phase09-03_harness.md))**
  - '기기 기억하기(Remember Me)' 옵션에 따라 `localStorage`(ON) 또는 `sessionStorage`(OFF)로 토큰 저장소를 동적으로 전환하는 하이브리드 스토리지 어댑터 적용
  - 비인가 사용자의 메인 페이지 접근 차단 및 `/login` 리다이렉트(`ProtectedRoute.tsx`)
- **사용자 프로필 동기화 ([Phase 09-04](file:///C:/Users/pit19/OneDrive/바탕%20화면/프로그래밍/Boim/.agents/Phase/phase09/Phase09-04_harness.md))**
  - 로그인 및 인증 시 DB에 저장된 실제 사용자 이름(`name`)과 `isPassVerified` 상태를 프론트엔드 스토어에 동기화

### 🎨 Fixed & Improved
- **소셜 연동 화면 380px 사이드 패널 레이아웃 및 아이콘 깨짐 개선**
  - 텍스트 박스 형태의 로고를 고해상도 공식 벡터 SVG 아이콘(`KakaoLogo`, `NaverLogo`)으로 전면 교체
  - `shrink-0`, `min-w-0`, `truncate` 및 최적화된 패딩(`p-4`)을 적용하여 380px 너비 내에서 줄바꿈 및 찌그러짐 현상 완벽 해결

---

## [Phase 08] - 2026-10-28

### 🔒 Security (보안 강화)
- **민감 정보 보호 및 재인증(Re-Authentication) 모달**
  - 비밀번호 변경, 계정 삭제, 민감 개인정보 열람 시 비밀번호를 다시 확인하는 `ReAuthModal` 컴포넌트 구현
  - 백엔드 `POST /auth/reauthenticate` 엔드포인트 구현 및 DTO 검증

---

## [Phase 07] - 2026-10-28

### 🧪 Tests & Quality Assurance
- **전사 테스트 커버리지 및 신뢰성 확보**
  - 프론트엔드(Vitest + React Testing Library): UI 컴포넌트, 훅, 스토어 전수 테스트 작성
  - 백엔드(Jest): Auth, User, Insurance, Notification 등 전 모듈 단위 테스트 작성
  - 프론트엔드 51개, 백엔드 81개 테스트 전체 통과 (Pass Rate 100%)

---

## [Phase 06] - 2026-10-28

### 🎨 UI/UX & Responsive Detailing
- **반응형 사이드 패널 및 모바일 전환**
  - `AppLayout`, `Sidebar`, `RightPanel`의 반응형 레이아웃 튜닝 (모바일/태블릿 시트 전환)
  - 부드러운 화면 전환 애니메이션 및 마이크로 인터랙션 최적화
  - 설정 화면(비밀번호 변경, 프로필, 알림 시간, 로그인 기록) 반응형 UI 폴리싱

---

## [Phase 05] - 2026-10-28

### 🚀 Added (핵심 대시보드 기능)
- **내 보험(My Insurance) 리스트 패널**
  - 가입한 보험 상품 목록 조회, 상세 모달, 수정 및 삭제 기능
- **보험료 분석(Insurance Premium Analysis) 차트**
  - 카테고리별(실손, 암, 종신, 운전자 등) 납입액 도넛 차트 및 통계 분석 뷰 구현
- **알림(Notifications) 패널**
  - 보험료 납입일 및 만기 예정 알림 리스트 뷰 및 백엔드 API 연동
- **설정(Settings) 패널**
  - 프로필 관리, 알림 채널/방해금지 시간 설정, 로그인 이력 조회 기능

---

## [Phase 04] - 2026-10-27

### 🚀 Added (MVP CRUD 연동)
- **우측 상세 패널(RightPanel) 기반 보험 상품 CRUD**
  - 중앙 캘린더 읽기 전용 뷰어와 우측 패널 입력/수정/삭제 폼 양방향 연동
  - TanStack Query를 활용한 서버 상태 캐싱 및 즉각적인 UI 반영

---

## [Phase 03] - 2026-10-27

### 🎨 UI & Layout Structuring
- **SPA 메인 레이아웃 및 디자인 시스템 와이어프레임 구축**
  - `docs/design/` 색상 팔레트 및 와이어프레임을 준수한 Tailwind CSS 테마 설정
  - 중앙 캘린더(MainCalendar), 좌측 네비게이션(Sidebar), 우측 인터랙션 패널 구조화

---

## [Phase 02] - 2026-10-27

### 🚀 Added (코어 비즈니스 로직)
- **보험 상품(InsuranceProduct) CRUD 백엔드 API**
  - NestJS 기반 도메인 모듈 생성 및 PostgreSQL/Prisma DB 연동

---

## [Phase 01] - 2026-10-27

### 🏗️ Architecture & Project Setup
- **모노레포 및 기본 아키텍처 수립**
  - pnpm 워크스페이스 기반 모노레포 구축 (`apps/web`, `apps/api`, `packages/shared-types`)
  - React 19 (Vite, TypeScript, oxlint) 및 NestJS 11 환경 구성
  - 공통 API 응답 규격(`ApiResponse<T>`) 및 Prisma 스키마 모델링 정의
