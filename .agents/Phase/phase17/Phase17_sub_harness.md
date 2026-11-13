> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 17 세부 작업 하네스 (Sub Harness)

## 📌 Phase 17-01 세부 작업 내역 (공개 랜딩 페이지 구현) - [완료]

### 1. 컴포넌트 아키텍처 (`apps/web/src/features/landing/`)
- [x] `LandingPage.tsx`: 랜딩 메인 오케스트레이터 및 dynamic title 태그 관리
- [x] `components/LandingNavbar.tsx`: 스티키 반응형 GNB (로고, 섹션 앵커 네비게이션, 로그인/무료 시작하기 CTA, 로그인 시 '대시보드로 이동' 스마트 전환)
- [x] `components/HeroSection.tsx`: 헤드카피(*"흩어진 내 보험, 한눈에 보임."*), 가치 제안, 2026-11 캘린더 & 가상 보험(OO 종합건강보험, OO 안심 운전자보험) 요약 카드 목업
- [x] `components/FeatureCardsSection.tsx`: WHAT YOU CAN DO 3대 핵심 기능 (내 보험 한눈에 관리, 납입·갱신 일정 알림, Boim AI 85점 안심 등급 게이지)
- [x] `components/StepGuideSection.tsx`: A CLEARER VIEW 3단계 가이드 & 실제 Boim 증권 자동 업로더 + 가상 모의 분석 버튼 + 실제 폼 입력 목업
- [x] `components/CtaBannerSection.tsx`: START WITH BOIM 기하학 패턴 배경 & 화이트 CTA 배너
- [x] `components/LandingFooter.tsx`: 미니멀 푸터 및 저작권 정보
- [x] 상표명/실제 보험사 제거: 모든 예시 데이터를 가상 보험사(`OO손해보험`) 및 가상 상품(`OO 맞춤 종합보장보험`)으로 표준화

### 2. 라우터 및 레이아웃 연동
- [x] `RootRoute`: 루트 경로(`/`) 접근 시 비로그인 방문자에게는 `<LandingPage />`를 기본 화면으로 제공, 로그인 상태인 경우 `<AppLayout><HomePage /></AppLayout>`으로 대시보드 표시
- [x] `/landing`: 직접 접속 가능한 명시적 라우트 등록
- [x] `/dashboard`: 로그인 회원 전용 대시보드 라우트 등록
- [x] `AppLayout`: `children?: ReactNode` 지원 추가로 `<Outlet />`과 children 공존 구조 지원

---

## 📌 Phase 17-02 세부 작업 내역 (인터랙션 및 UX 고도화) - [완료]

### 1. 브랜드 심볼 로고 ('B' 라운드 심볼) 전면 통일
- [x] 공통 컴포넌트 `BrandLogo.tsx` 구현 (sm, md, lg 반응형 사이즈 지원)
- [x] 랜딩 페이지 GNB(`LandingNavbar`) 및 푸터(`LandingFooter`) 로고 일원화
- [x] 메인 서비스 사이드바(`Sidebar.tsx`) 및 로그인/회원가입(`Login.tsx`, `SignUp.tsx`) 화면 로고 일원화
- [x] 서비스 전체의 브랜드 아이덴티티(BI) 일관성 100% 확보

### 2. HeroSection 3대 핵심 포인트 아이콘 컬러 통일 (UX/브랜딩 정돈)
- [x] 기존 다색 분산(초록, 파랑, 보라) 제거
- [x] 3개 항목 모두 Boim 대표 브랜드 컬러인 `text-blue-600`으로 100% 통일하여 시선 분산 방지 및 깔끔한 핀테크 첫인상 완성

### 3. 주요 기능(FeatureCardsSection) 블럭 호버 스케일 인터랙션 고도화
- [x] 현재 카드 내부의 작은 아이콘에만 적용된 효과를 카드 블럭 컨테이너 전체로 확장
- [x] 각 카드 블럭에 마우스 호버 시 부드러운 플로팅(`hover:-translate-y-1.5`), 테두리 컬러 강조(`hover:border-blue-200`), 그림자 부각(`hover:shadow-xl hover:shadow-blue-500/5`) 마이크로 인터랙션 구현

### 4. 이용방법 인터랙티브 단계 전환 & 페이드 효과
- [x] `activeStep` (1 | 2 | 3) 상태 관리 및 탭 접근성(role="tab", aria-selected) 지원
- [x] 1/2/3단계 탭 클릭 시 활성화 상태 전환 및 우측 예시 카드가 페이드 트랜지션으로 교체
  - 1단계: 실제 Boim 증권 자동 업로더 & 등록 폼 목업
  - 2단계: 캘린더 일정 및 월별 납입 정리(257,000원, D-2 알림) 요약 목업
  - 3단계: Gemini AI 85점 안심 보장 분석 리포트 카드 목업

### 5. 상단 네비게이션 스크롤 안정화
- [x] 브라우저 CSS와 충돌 없는 순수/안정적 스무스 스크롤 복구
- [x] 상단 Sticky 헤더(72px) 오프셋 보정으로 가림 현상 완벽 방지

### 6. 품질 검증 및 릴리즈
- [x] `LandingPage.spec.tsx` 인터랙션 단위 테스트 추가 및 전체 테스트 100% Pass (웹 202개, 백엔드 192개, 전사 394개)
- [x] TypeScript 및 Vite 프로덕션 번들 빌드(2.12s) 0 에러 무결성 검증
