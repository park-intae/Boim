# 📋 Boim 변경 이력 (Changelog)

이 문서는 **Boim** 프로젝트의 주요 변경 사항, 신규 기능 추가, 버그 수정 및 보안 패치 내역을 시간 및 단계(Phase)별로 기록하는 패치노트입니다.  
형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)의 규격을 준용합니다.

---

## [Phase 19] - 2026-11-14

### 📱 Expo(React Native) 모바일 앱 구축 및 세션 인증 (Mobile Application)
- **스마트폰 카메라 증권 촬영 OCR 스캔 & 폼 자동완성 연동 (`Phase 19-05`):**
  - **`expo-image-picker` 하드웨어 연동:** 스마트폰 카메라 즉시 촬영 모드 및 사진첩(갤러리) 선택 기능 구축 (`aspect: [4, 3]`, `quality: 0.8` 크롭 편집 지원).
  - **백엔드 OCR 파이프라인 연동 (`documentApi.ts`):** 촬영된 로컬 이미지(`file://...`)를 `FormData`로 래핑하여 백엔드 Tesseract OCR 엔진(`POST /api/documents/upload` & `/parse`)에 전송 및 실시간 텍스트 레이어 파싱.
  - **증권 스캐너 모달 (`PolicyScannerModal.tsx`):** 카메라 촬영, 갤러리 선택 및 시연용 샘플 즉시 체험을 지원하는 세련된 바텀 시트와 AI 분석 진행 스피너 피드백 제공.
  - **보험 등록 폼 자동 입력 (`InsuranceAddModal.tsx`):** OCR 추출 데이터(보험사, 상품명, 카테고리, 월납입액, 만기일) 100% 폼 자동 채움(Prefill) 및 등록 시 캘린더/내 보험 실시간 동기화.
- **모바일 네이티브 UX 고도화 (`Phase 19-04`):**
  - **당겨서 새로고침 (`RefreshControl`):** 4대 탭(일정 캘린더, 내 보험, AI 진단, 마이페이지) 스크롤뷰에 부드러운 스와이프 리로드 제스처 및 인디케이터 장착.
  - **터치 인터랙션 피드백 (`Pressable`):** 모든 날짜 셀, 카테고리 칩, 보험 카드 및 버튼에 눌림 시각 피드백(`pressedScale`, `scale: 0.96~0.98`) 적용.
  - **SafeArea & 플로팅 탭 바 영역 보호:** 스크롤뷰 하단 패딩(`paddingBottom: 110`) 확보로 캡슐 탭 바에 의한 콘텐츠 잘림 방지.
- **캘린더 긴 보험 상품명 텍스트 말줄임 및 레이아웃 오버플로우 방지 (Web & Mobile):**
  - **모바일 (`CalendarScreen.tsx`, `InsuranceListScreen.tsx`):** 상품명 `<Text>`에 `numberOfLines={1}` 및 `ellipsizeMode="tail"` 적용, `scheduleInfo`에 `flex: 1` 부여로 납입 금액 및 뱃지가 카드 바깥으로 밀리는 현상 완벽 방어.
  - **웹 (`MainCalendar.tsx`, `DailyEventsView.tsx`):** 7열 Grid 셀에 `min-w-0` 및 `overflow-hidden` 제약 부여로 긴 상품명으로 인한 달력 찌그러짐 차단, 마우스 호버 시 전체 이름을 확인할 수 있는 `title` 툴팁 지원.
- **모바일 의존성 정합성 교정 (`@babel/runtime` 7.29.7 통일):**
  - Expo SDK 58 및 Metro 번들러 환경에 맞게 `apps/mobile`의 `@babel/runtime` 버전을 8.x(`8.1.2`)에서 생태계 표준인 **`^7.29.7`**로 다운그레이드 및 통일.
  - Metro 번들러 구동 시 발생하던 `./regenerator` exports 서브패스 불일치 경고를 완벽히 제거하고, 모노레포 전체(Expo, Testing Library) 패키지와 동일한 런타임을 공유하도록 최적화.
- **`apps/mobile` 프로젝트 세팅 및 Expo SDK 58 전면 업그레이드 (`Phase 19-01`):**
  - 스마트폰 최신 `Expo Go` 환경에 완벽 대응하는 최신 **Expo SDK 58.0.25**, **React 19 (`react@19.3.0`)**, **React Native 0.88.1** 기반 모바일 패키지 구축.
  - `@boim/shared-types` 공통 패키지 100% 참조 및 Metro 번들러 모노레포 심볼릭 링크 호환(`metro.config.js`).
- **4대 핵심 탭 네이티브 UI 포팅 & 플로팅 탭 네비게이션 (`Phase 19-02`):**
  - `@react-navigation/bottom-tabs` 기반 하단 플로팅 캡슐 탭 바(`TabNavigator.tsx`) 구현:
    - 안드로이드 시스템 3버튼 및 제스처 바와의 영역 겹침을 방지하는 플로팅 카드 아일랜드(`borderRadius: 26`, `height: 72px`) 및 터치 영역 바운더리(`overflow: hidden`) 적용.
    - `useSafeAreaInsets` 기반 기기별 하단 안전 마진 자동 계산.
  - 4대 스크린 Empty State 기본 지원:
    - `CalendarScreen.tsx`: 월간 보험료 납입 캘린더 및 일정 없는 날의 빈 상태 뷰.
    - `InsuranceListScreen.tsx`: 총 월납입액 배너, 카테고리 필터 및 "가입된 보험이 없습니다" Empty State.
    - `DiagnosisScreen.tsx`: Gemini AI 종합 진단 점수 및 "AI 분석 결과가 없습니다" Empty State.
    - `MyPageScreen.tsx`: 프로필, PASS 인증 뱃지, 알림 설정 및 비로그인 상태 안내.
- **백엔드 API 연동 모바일 인증 플로우 & 세션 유지 (`Phase 19-03`):**
  - **조건부 RootNavigator:** 비로그인 사용자 접속 시 로그인 화면(`LoginScreen`)으로 첫 화면(랜딩) 렌더링.
  - **실제 백엔드 API 연동 (`apps/mobile/src/api/authApi.ts`):** NestJS 백엔드(`POST /api/auth/login`)와의 실제 HTTP 통신으로 DB 시드 계정(`test@boim.com` / `password123`) 검증 및 실제 JWT 토큰 발급.
  - **모바일 안전 스토리지 (`safeStorage`):** `@react-native-async-storage/async-storage` 및 메모리 폴백 기반 로그인 세션(`Remember Me`) 영구 보관 및 앱 재실행 시 자동 로그인 지원.
  - **테스트 계정 공식 인식표:** 테스트/데모 계정 로그인 시 마이페이지에 `[테스트 계정]` 뱃지 부착.
  - **실기기(Expo Go) QA 완료:** 스마트폰 실제 기기에서 로그인 ➔ 메인 탭 ➔ 마이페이지 ➔ 로그아웃 플로우 검증 및 전사 399개 단위/통합 테스트 100% Pass 무결성 확인.

---

## [Phase 18] - 2026-11-13

### 🐳 DevOps & Infrastructure (컨테이너화 및 CI/CD 자동화 배포 파이프라인)
- **Multi-stage Dockerfile 컨테이너 패키징 (`Phase 18-01`):**
  - **백엔드 (`apps/api/Dockerfile`):** NestJS 11 + Prisma Client + Node 22 Alpine 멀티스테이지 빌드로 **293MB** 초경량화 달성. Non-root `node` 유저 권한 부여로 상용 컨테이너 보안 무결성 확보.
  - **프론트엔드 (`apps/web/Dockerfile`):** React 19 Vite 번들 컴파일 및 Nginx 1.27 Alpine 기반 정적 서빙으로 **26.7MB** 극초경량화 달성.
  - **웹 Nginx 구성 (`apps/web/nginx.conf`):** SPA 라우팅 Fallback(`try_files`), Gzip 압축, 보안 헤더, 정적 자산 1년 장기 캐시 및 `/api/` 리버스 프록시 일괄 탑재.
  - **`.dockerignore` 최적화:** `node_modules`, `dist`, `.turbo`, `.git`, `.env*` 배제로 빌드 컨텍스트 전송 시간 최소화.
- **풀스택 Docker Compose 원클릭 오케스트레이션 (`Phase 18-02`):**
  - `docker-compose.yml` 3대 핵심 서비스 일괄 연동:
    - `postgres`: PostgreSQL 16 Alpine, `pg_isready` 기반 헬스체크 등록, `boim_pgdata` 볼륨 영속화.
    - `api`: NestJS 11, DB 헬스체크 완료(`service_healthy`) 후 기동되는 안전한 의존성 체계, 포트 오버라이드 지원.
    - `web`: React 19 Nginx 웹서버, API 컨테이너 기동 후 시작, 포트 80 매핑.
  - 전용 브릿지 네트워크(`boim-network`) 격리로 컨테이너 간 안전한 통신 보장.
  - pnpm 모노레포 심링크 및 Prisma Client 런타임 호환을 위한 `apps/api/node_modules` 복사 및 `NODE_PATH` 환경변수 보강.
  - 로컬 통합 검증 완료: API 직접 호출(`4001`), 프론트엔드 서빙(`80`), Nginx 리버스 프록시(`/api/health`) 200 OK 무결성 확인.
- **GitHub Actions CI 자동화 파이프라인 구축 (`Phase 18-03`):**
  - `.github/workflows/ci.yml` 구축: `master`, `main`, `develop` 브랜치 Push 및 PR 시 자동 실행.
  - `ubuntu-latest`, Node.js 22, pnpm 9 및 pnpm store 캐싱 최적화.
  - 린트(`pnpm lint`), 백엔드 192개 테스트 + 프론트엔드 202개 테스트(**전사 394개 테스트 100% Pass**), 모노레포 전체 프로덕션 빌드(`pnpm build`), Docker Buildx 이미지 빌드 자동 검증 파이프라인 완비.
- **상용 배포 보안 템플릿 및 배포 운영 가이드 (`Phase 18-04`):**
  - `.env.production.example`: PostgreSQL DB, 64바이트 난수 JWT 시크릿, 카카오/네이버 OAuth2, Google Gemini AI, SMTP 이메일 환경변수 템플릿 완비 (실제 시크릿 제로 격리).
  - `docs/DEPLOYMENT.md`: 시스템 아키텍처 다이어그램(Mermaid), 사전 요구사항 및 방화벽 인바운드 표, 4단계 원클릭 배포 가이드, 헬스체크 모니터링, 무중단 롤링 업데이트 및 롤백 가이드, Host Nginx + Let's Encrypt Certbot 연동 안내 수록.
  - `.gitignore` 갱신 (`!.env*.example`).

---

## [Phase 17] - 2026-11-13

### 🌐 Public Landing Page & First Impression (공개 랜딩 페이지 및 UX 고도화)
- **토스/핀테크 감성의 초고화질 순수 코드 랜딩 페이지 구축 (`Phase 17-01`):**
  - 무거운 래스터 이미지 대신 **100% React 19 + Tailwind CSS + 인라인 SVG**로 구현하여 FCP/LCP를 극대화하고 모바일 고해상도(Retina) 화면에서도 깨짐 없는 벡터 선명도 확보.
  - `apps/web/src/features/landing/` 7개 컴포넌트 모듈화:
    - `LandingPage.tsx`: 랜딩 오케스트레이터 및 동적 Title 메타 관리.
    - `LandingNavbar.tsx`: 스티키 헤더, 앵커 링크, 로그인/회원가입 CTA (로그인 상태 시 '대시보드로 이동'으로 스마트 전환).
    - `HeroSection.tsx`: 핵심 가치 카피(*"흩어진 내 보험, 한눈에 보임."*), 2026년 11월 캘린더 및 보험 가입 지표 실감형 인터랙티브 목업.
    - `FeatureCardsSection.tsx`: WHAT YOU CAN DO 3대 핵심 기능 (내 보험 한눈에 관리, 납입·갱신 일정 알림, Boim AI 85점 안심 등급 게이지 시각화).
    - `StepGuideSection.tsx`: A CLEARER VIEW 3단계 가이드 및 증권 사진 자동 입력 OCR 뱃지가 결합된 보험 등록 폼 목업.
    - `CtaBannerSection.tsx`: START WITH BOIM 다크 네이비 기하학 패턴 배경 & 화이트 CTA 배너.
    - `LandingFooter.tsx`: 미니멀 저작권 및 서비스 푸터.
- **랜딩 인터랙션 및 브랜드 아이덴티티 고도화 (`Phase 17-02`):**
  - **브랜드 심볼 로고 ('B' 라운드 심볼) 전면 통일:** `BrandLogo.tsx` 공통 컴포넌트를 구축하고 랜딩 GNB(`LandingNavbar`), 푸터(`LandingFooter`), 사이드바(`Sidebar.tsx`), 로그인/회원가입(`Login.tsx`, `SignUp.tsx`) 전체 화면에 100% 일관되게 적용.
  - **HeroSection 아이콘 컬러 일원화:** 기존 다색 분산(초록, 파랑, 보라)을 브랜드 대표 컬러인 `text-blue-600` 단일 톤으로 통일하여 시선 분산 방지 및 깔끔한 핀테크 첫인상 완성.
  - **주요 기능 카드 호버 플로팅 마이크로 인터랙션:** 카드 컨테이너 전체에 `hover:-translate-y-1.5`, `hover:border-blue-200`, `hover:shadow-xl`을 적용하여 생동감 넘치는 반응형 UX 제공.
  - **이용방법 3단계 탭 인터랙티브 전환 & 페이드 효과:** 1단계(증권 자동 등록 및 입력 폼), 2단계(월간 캘린더 납입 일정 및 D-2 알림 요약), 3단계(Gemini AI 85점 보장 진단 리포트) 탭 클릭 시 우측 실감형 목업이 부드러운 페이드인 애니메이션과 함께 즉각 전환.
  - **GNB 스크롤 오프셋 안정화:** 브라우저 환경 및 OS 설정과 무관하게 상단 네비게이션 클릭 시 Sticky 헤더 높이(72px)를 보정한 스무스 스크롤 복구.
- **기본 진입점 및 지능형 라우팅 (`RootRoute`):**
  - 비로그인(게스트) 사용자가 루트 경로(`/`)로 접속 시 랜딩 페이지를 기본 첫 화면으로 제공.
  - 로그인 세션이 유효한 사용자는 자동으로 기존 메인 대시보드(`HomePage` + `AppLayout`)로 연결.
  - `/landing` 및 `/dashboard` 명시적 라우트 등록.
  - `AppLayout`에 `children?: ReactNode` 지원을 추가하여 `<Outlet />`과 children 공존 구조 지원.
- **전사 단위/통합 테스트 무결성:**
  - `LandingPage.spec.tsx` (7개 인터랙션 및 탭 전환 단위 테스트) 및 `App.test.tsx` 최신화.
  - 프론트엔드 47개 파일 202개 테스트 100% 통과, 백엔드 27개 파일 192개 테스트 100% 통과 (전사 394개 테스트 100% Pass).
  - TypeScript 0 에러 및 Vite 프로덕션 번들(2.12s, 메인 엔트리 89kB) 빌드 완료.

---

## [Phase 16] - 2026-11-12

### 🚀 Performance & Bundle Optimization (프론트엔드 번들 극한 다이어트)
- **Vite 번들 다이어트 및 코드 스플리팅 (`Phase 16-01`):**
  - `vite.config.ts`의 `manualChunks` 전략을 고도화하여 벤더 라이브러리(`vendor-react`, `vendor-router`, `vendor-query`, `vendor-icons`, `vendor-utils`, `vendor-zod`, `vendor-excel`)를 세분화 분할.
  - 대형 컴포넌트(설정 패널, AI 진단 리포트, 차트 분석, 보험 등록 폼, 알림 리스트) 및 라우트 페이지의 `React.lazy` & `Suspense` 동적 임포트 전환.
  - **메인 엔트리 청크 947.85 kB ➔ 88.01 kB (-90.7% 극적 다이어트 달성)** 및 500kB 초과 경고 0건 완료.
  - `vendor-utils` 번들 크기 124.7 kB ➔ **28.05 kB (-77.5%)** 감축.
  - `vendor-react`에서 `react-router`를 분리하여 React 코어 번들 274.7 kB ➔ **182.5 kB (-33.5%)** 추가 감축.
  - Recharts(320kB)를 비동기 지연 청크로 완전 격리하여 첫 화면 초기 번들 로딩에서 100% 배제.

### 📱 PWA & Offline Resilience (점진적 웹 앱 및 오프라인 회복력)
- **PWA Manifest 및 앱 메타데이터 완비 (`Phase 16-02`):**
  - `manifest.webmanifest` 및 192x192, 512x512 고해상도 SVG 벡터 아이콘 탑재로 모바일 '홈 화면에 추가' 및 Standalone 구동 지원.
- **Service Worker (`sw.js`) 오프라인 캐싱 구축:**
  - Cache Storage 기반 정적 자산(HTML, CSS, JS, 아이콘)의 Stale-While-Revalidate 캐싱 전략 적용.
  - 백엔드 API(`/api/*`) Network-First 및 단절 시 `503 OFFLINE_MODE` 안전 폴백 핸들링.
- **실시간 오프라인 UX 구현:**
  - `useOnlineStatus` 훅 및 `OfflineBanner` 컴포넌트를 구현하여 오프라인 감지 시 상단 고정 안내 배너 노출, 온라인 복구 시 3.5초 자동 페이드아웃 성공 토스트 제공.

### ♿ Accessibility & SEO & Web Quality (웹 접근성 및 품질 극대화)
- **WAI-ARIA 웹 접근성 100점 만점 (`Phase 16-03`):**
  - `Sidebar`, `Header`, `MainCalendar`, `RightPanel`의 아이콘 버튼에 semantic `button` 적용, 누락된 `aria-label`, `aria-expanded`, `aria-haspopup` 완비.
  - 키보드 내비게이션을 위한 `focus-visible:ring-2 focus-visible:ring-indigo-500` 포커스 링 전면 적용.
  - 텍스트-배경 대비 명도비(Contrast Ratio) 4.5:1 이상 고대비 유지.
- **SEO 메타데이터 및 크롤러 자산 100점 만점:**
  - `robots.txt`, `sitemap.xml` 크롤러 엔드포인트 구축.
  - `index.html`에 Schema.org `SoftwareApplication` JSON-LD 구조화 데이터, Open Graph, Twitter Cards 완비.
- **CSS 렌더링 차단 해소 및 모바일 반응형 쉘:**
  - Vite `nonBlockingCssPlugin`을 구현하여 기존 456ms의 CSS 렌더링 차단(Render-blocking)을 0ms로 완전 해소.
  - 불필요한 API 서버 사전 연결(`preconnect`) 경고 제거로 네트워크 종속 항목 트리 감사 해소.
  - 모바일(412px) 뷰포트에 완벽히 대응하는 반응형 인라인 쉘(Mobile/Desktop Shell) 탑재.

### 🏆 Lighthouse 최종 검증 성과
- **성능 (Performance):** 초기 54점 ➔ **96점 (초록색 최상위 등급)**
- **웹 접근성 (Accessibility):** 81점 ➔ **100점 만점 💯**
- **모범 사례 (Best Practices):** 96점 ➔ **100점 만점 💯**
- **검색 최적화 (SEO):** 82점 ➔ **100점 만점 💯**
- **TBT (Total Blocking Time):** **20ms** (체감 렉 제로)
- **CLS (Cumulative Layout Shift):** **0.000** (완벽한 화면 고정)

### 🧪 Tests & Monorepo Quality (`Phase 16-04`)
- **전사 단위/통합 테스트:**
  - 프론트엔드: Vitest 46개 파일, **195개 테스트 100% Pass** (+11개 신규 테스트 추가)
  - 접근성/SEO 무결성 검증 테스트(`seo-a11y.spec.tsx`) 및 PWA 오프라인 훅 테스트 추가.
- **빌드/린트:** Turbo monorepo build(단 7초) 및 oxlint/eslint 0 errors 통과.

---

## [Phase 15] - 2026-11-12

### 🚀 Added (상용 소셜 OAuth2 실연동 및 계정 통합)
- **백엔드 카카오 OAuth2 실연동 파이프라인 (`Phase 15-01`):**
  - `SocialAuthService.exchangeKakaoCode()`: 카카오 인증 서버(`POST https://kauth.kakao.com/oauth/token`) 정규 토큰 교환 연동.
  - `SocialAuthService.getKakaoProfile()`: 카카오 리소스 서버(`GET https://kapi.kakao.com/v2/user/me`) 사용자 프로필(ID, 이메일, 닉네임) 파싱 및 정규화.
  - `KakaoStrategy` & `AuthController`: Passport 기반 리다이렉트(`GET /auth/kakao/callback`) 및 REST 인가 코드 직접 교환(`POST /auth/kakao/login`) 엔드포인트 완비.
- **백엔드 네이버 OAuth2 실연동 및 CSRF 방어 파이프라인 (`Phase 15-02`):**
  - **HMAC-SHA256 OAuth State 보안:** `generateOAuthState()` 및 `verifyOAuthState()`를 통해 10분 만료 검증 및 64자리 SHA256 서명 일치 여부 정밀 검증 (`crypto.timingSafeEqual`)으로 CSRF 공격 차단.
  - `SocialAuthService.exchangeNaverCode()` & `getNaverProfile()`: 네이버 인증/프로필 API 실연동.
  - `NaverStrategy` & `AuthController`: 네이버 로그인 리다이렉트, 콜백 및 REST 로그인 엔드포인트 완비.
- **다중 계정 연동/해제 파이프라인 (Account Linking/Unlinking):**
  - `SocialAuthService.processSocialUser()`: 동일 이메일 기존 회원 자동 연동, 미가입 유저 신규 생성, 타 계정 중복 연동 시 `ConflictException` 방어.
  - `unlinkSocialAccount()`: 원클릭 소셜 계정 연동 해제 및 단일 사용자 다중 provider(`kakao:xxx|naver:yyy`) 관리 지원.
- **프론트엔드 OAuth 콜백 및 연동 관리 UI (`Phase 15-03`):**
  - `OAuthCallbackPage.tsx` (`/auth/callback`): 토큰 수신 시 세션 동기화 및 메인 대시보드 리다이렉트, 인가 실패/취소 시 직관적인 에러 안내 및 복귀 버튼 제공.
  - `Login.tsx`: 카카오/네이버 공식 SVG 로고 버튼 및 인가 플로우 연결.
  - `SocialAccountsSettings.tsx`: 카카오/네이버 실시간 연동 현황 확인 및 [연동하기]/[해제] 인터랙션 완성.
- **데이터베이스 스키마 동기화 및 무결성 확보 (`Phase 15-04`):**
  - PostgreSQL `Notification` 테이블에 누락된 `userId` 컬럼 `prisma db push`를 통해 동기화 완료 (알림 조회 500 에러 원천 해소).
  - 상용 API 키는 Phase 17 상용 도메인 배포 시점에 주입하도록 최적 배포 전략 확립 (로컬은 Mock 격리 듀얼 모드 유지).

### 🧪 Tests & Quality
- **전사 단위/통합 테스트 무결성:**
  - 백엔드: Jest 27개 파일, **192개 테스트 100% Pass** (+22개 신규 테스트 추가)
  - 프론트엔드: Vitest 43개 파일, **184개 테스트 100% Pass** (+5개 신규 테스트 추가)
  - **전사 총 376개 테스트 100% Pass 달성 (회귀 버그 0건)**
- **빌드/린트:** Turbo monorepo build 및 oxlint/eslint 무결성 100% 검증 통과.

---

## [Phase 14] - 2026-11-11

### 🚀 Completed (마일스톤 완료 및 클린 아키텍처 리팩토링)
- **프론트엔드 테스트 커버리지 대폭 확보 (56.87% ➔ 83.15%) ([TEST_COVERAGE.md](file:///C:/Users/pit19/OneDrive/바탕%20화면/프로그래밍/Boim/.agents/TEST_COVERAGE.md))**
  - **테스트 환경 및 Fixtures 구축 (`Phase 14-01`):** v8 커버리지 프로바이더 적용 및 `insurance.fixtures.ts`, `auth.fixtures.ts`, `diagnosis.fixtures.ts`, `notification.fixtures.ts` 표준 목 데이터 구축.
  - **설정 패널 및 미커버 컴포넌트 테스트 스위트 보강 (`Phase 14-02`):** `SettingsPanel`, `PasswordSettings`, `ProfileSettings`, `LoginHistorySettings`, `PolicyViewer`, `PushNotificationItem` 등 129개 테스트 통과 (커버리지 68.95% 달성).
  - **`src/api` React Query 훅 단위 테스트 스위트 구축 (`Phase 14-03`):** `client.spec.ts`, `useInsuranceQueries`, `useNotificationQueries`, `useUserQueries`, `useDiagnosisQueries`, `useDocumentQueries` 단위 테스트 완비로 `src/api` 라인 커버리지 13.15% ➔ 93.68% 급상승, 전사 커버리지 82.56% 돌파.

### 🧩 Refactored (컴포넌트 및 도메인 규칙 엔진 분리 / Clean Architecture)
- **`RightPanel.tsx` 일별 일정 뷰 분리 (`Phase 14-04`):**
  - 일별 캘린더 일정 및 납입/만기 뱃지 렌더링 책임을 `DailyEventsView.tsx`로 분리하여 252줄에서 150줄(-40%)로 경량화.
- **`AiDiagnosisReport.tsx` 프레젠테이션 서브 컴포넌트 분리 (`Phase 14-05`):**
  - `DiagnosisScoreCard.tsx` (종합 점수 및 등급 뱃지)
  - `CoverageProgressList.tsx` (카테고리별 보장액 대비 적정도 프로그레스)
  - `DiagnosisAdviceCards.tsx` (강점, 개선점, 보험료 절감 팁)
  - 리포트 화면을 컴포지션 컨테이너로 리팩토링 (347줄 ➔ 178줄, -49% 경량화).
- **백엔드 순수 비즈니스 규칙 엔진 분리 (`Phase 14-06`):**
  - `RuleBasedDiagnosisEngine` (`apps/api/src/analysis/rule-based-diagnosis.engine.ts`): DB/AI I/O와 분리된 100% 순수 규칙 기반 점수 및 등급 산출 엔진 구축.
  - `NotificationRuleEvaluator` (`apps/api/src/notification/notification-rule.evaluator.ts`): 크론 및 메일 발송과 분리된 D-30/D-7/D-Day 만기/납입일 및 방해금지 시간 판정 순수 도메인 엔진 구축.
- **`InsuranceForm.tsx` 비즈니스 로직 및 뮤테이션 커스텀 훅 분리 (`Phase 14-07`):**
  - `useInsuranceForm.ts` (`apps/web/src/hooks/useInsuranceForm.ts`): 폼 유효성 검사, 자동 파싱 데이터 매핑, 생성/수정 뮤테이션 위임 분리 (231줄 ➔ 125줄, -46% 경량화).

### 🧪 Tests & Quality
- **전사 단위/통합 테스트 무결성:**
  - 프론트엔드: Vitest 42개 파일, 179개 테스트 통과 (Lines 83.15%)
  - 백엔드: Jest 26개 파일, 170개 테스트 통과 (Lines 90.22%)
  - **전사 총 349개 테스트 100% Pass**
- **빌드/린트:** Turbo monorepo build 및 oxlint (0 errors, 0 warnings) 100% 검증 통과.

---

## [Phase 13-04] - 2026-11-11

### 🚀 Completed (마일스톤 완료 및 하네스 단일화)
- **Phase 13 전체 품질 무결성 검증 및 마일스톤 마무리 ([Phase 13 Sub-Harness](file:///C:/Users/pit19/OneDrive/바탕%20화면/프로그래밍/Boim/.agents/Phase/phase13/Phase13_sub_harness.md))**
  - **전사 단위/통합 테스트 무결성 확인:**
    - 백엔드 Jest 단위 테스트 155건 100% Pass
    - 프론트엔드 Vitest 컴포넌트/유틸 테스트 86건 100% Pass (총 241건 전사 통과)
  - **프로덕션 빌드 및 린트 검증:**
    - `tsc -b && vite build` 및 `nest build` 정상 통과
    - oxlint 및 eslint 0 errors 무결성 통과
  - **하네스 정리 및 2-File Rule 준수:**
    - `.agents/Phase/phase13/` 디렉토리 내 분산 하위 하네스(`Phase13-01`, `02`, `03`)를 `Phase13_sub_harness.md`로 통합 단일화 완료
    - `README.md` 및 `Phase_harness.md`의 Phase 13 진행 현황 '완료' 갱신

---

## [Phase 13-03] - 2026-11-11

### 🚀 Added (신규 기능)
- **PASS 본인인증 실감형 인터랙션 고도화 (3분 타이머 & 세션 랜덤 코드) ([Phase 13-03](file:///C:/Users/pit19/OneDrive/바탕%20화면/프로그래밍/Boim/.agents/Phase/phase13/Phase13-03_harness.md))**
  - **백엔드 PASS 인증 세션 & 3분 TTL 파이프라인 (`PassService`):**
    - 고정 우회 코드 의존 탈피: 요청 시 고유 트랜잭션 ID 발급 및 보안 난수 6자리 인증코드 메모리 캐시 매핑
    - 3분(180초) TTL 만료 검증 및 검증 성공 시 일회용 즉시 세션 파기
    - 동일 휴대폰 번호 30초 내 연속 요청 방지(Rate-limiting / Cooldown)
  - **프론트엔드 PASS 인증 3분 카운트다운 타이머 & 재전송 UI (`PassVerification.tsx`):**
    - 3분(180초) 실시간 카운트다운 타이머(`03:00` ➔ `00:00`) 및 1분 미만 잔여 시각적 경고 스타일 적용
    - 유효시간 만료 시 입력창 및 확인 버튼 비활성화, 만료 안내 표시
    - '인증번호 재전송' 버튼을 통한 새 세션 요청 및 타이머 리셋 지원
  - **문서화 (`README.md`):**
    - 실제 통신사 PASS(NICE/KCB)는 유료 계약 제약으로 인해 미연동 상태임을 명시하고, 추후 실 대행사 모듈을 바로 장착할 수 있도록 실사와 최대한 유사하게 프로토콜을 구축했음을 상세 안내
  - **단위 테스트 및 품질 검증:**
    - 백엔드 `pass.service.spec.ts` 9건 및 프론트엔드 `PassVerification.spec.tsx` 3건 100% Pass
    - 모노레포 전체 테스트(API 150건, Web 86건) 및 빌드/린트 무결성 검증

---

## [Phase 13-02] - 2026-11-11

### 🚀 Added (신규 기능)
- **알림 다중 채널 실제 발송 (브라우저 OS 푸시 & 이메일 실발송) 연동 ([Phase 13-02](file:///C:/Users/pit19/OneDrive/바탕%20화면/프로그래밍/Boim/.agents/Phase/phase13/Phase13-02_harness.md))**
  - **백엔드 Nodemailer 이메일 발송 파이프라인 (`NotificationSchedulerService`):**
    - `nodemailer` 기반의 트랜스포터 초기화 및 HTML 템플릿 메일 실발송 로직 구축
    - 상용 SMTP 환경변수(`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`) 연동 지원 및 미설정 시 Ethereal 가상 계정/미리보기 URL(`getTestMessageUrl`) 로깅 지원
    - 테스트 환경 네트워크 격리 및 외부 발송 실패 시에도 인앱 알림을 안전하게 보존하는 내결함성 확보
  - **프론트엔드 브라우저 Web Notification API 실연동 (`webNotification.ts`, `NotificationSettingsSection.tsx`, `NotificationList.tsx`):**
    - HTML5 Web Notification API 헬퍼 유틸리티(`isNotificationSupported`, `requestNotificationPermission`, `showDesktopNotification`) 구현
    - 환경설정에서 '푸시 알림' 토글 시 브라우저 권한 요청 인터랙션 연결 및 권한 거부 시 안내 처리
    - 수동 스캔 또는 신규 알림 감지 시 실제 OS 데스크톱 토스트 알림 발송

### 🔄 Refactored (탈착형 아키텍처 고도화)
- **이메일 발송 책임 독립 모듈/컴포넌트 분리 (Pluggable Architecture):**
  - **백엔드 (`EmailService`):** 스케줄러에서 메일 전송 및 `nodemailer` 의존성을 완전히 분리하여 독립 서비스(`EmailService`)로 캡슐화, `@Optional()` 주입 및 `ENABLE_EMAIL_NOTIFICATION` 기능 플래그를 통해 모듈 또는 설정 수준에서 무중단 탈착 가능하도록 설계
  - **프론트엔드 (`EmailNotificationItem.tsx`, `PushNotificationItem.tsx`):** 설정 화면의 각 알림 채널 항목을 독립 컴포넌트로 분리하여 필요 시 언제든 한 줄 수정으로 특정 채널을 탈착/주석 처리할 수 있는 유연한 슬롯 구조 완성
  - **전사 단위 테스트 갱신:** API 149건, Web 84건 100% 통과 (Vitest/Jest)

---

## [Phase 13-01] - 2026-11-11

### 🚀 Added (신규 기능)
- **대시보드 미납 알림 실시간 집계 및 캘린더 일정 수정 모드 연동 ([Phase 13-01](file:///C:/Users/pit19/OneDrive/바탕%20화면/프로그래밍/Boim/.agents/Phase/phase13/Phase13-01_harness.md))**
  - **대시보드 미납 알림 실시간 데이터 연동 (`HomePage.tsx`):**
    - 하드코딩 `0건` 제거 및 `useGetNotifications` 쿼리를 기반으로 미확인 납입 알림 및 당월 납입일 경과 미납 건수 실시간 계산
    - 미납 알림 요약 카드 클릭 시 알림 패널(`panelMode = 'notifications'`)로 즉시 이동하는 반응형 내비게이션 연결
  - **캘린더 일정 클릭 시 보험 수정(Edit) 모드 실연동 (`RightPanel.tsx`, `InsuranceForm.tsx`):**
    - 전역 스토어 `editingInsuranceId` 및 상태 제어 함수 추가
    - 캘린더 우측 일정 카드 클릭 시 해당 보험 정보를 기반으로 수정 폼 오픈 및 기존 값 자동 바인딩(Prefill)
    - 폼 제출 시 신규 등록 대신 `useUpdateInsurance`를 호출하여 실제 보험 정보 수정 및 캘린더/요약 즉각 갱신
  - **테스트 및 검증 (`HomePage.test.tsx`, `RightPanel.test.tsx`, `InsuranceForm.test.tsx`):**
    - 미납 알림 집계 및 인터랙션, 일정 카드 클릭 시 수정 모드 진입 및 폼 프리필/수정 제출 테스트 통과 (Vitest 71개 테스트 100% Pass)
    - 린트(oxlint 0 errors) 및 빌드(`tsc -b && vite build`) 무결성 통과

---

## [Phase 12-04] - 2026-11-06

### 🚀 Added (신규 기능)
- **리포트 내보내기/인쇄 연동 및 Phase 12 AI 종합 진단 시스템 완성 ([Phase 12 Sub-Harness](file:///C:/Users/pit19/OneDrive/바탕%20화면/프로그래밍/Boim/.agents/Phase/phase12/Phase12_sub_harness.md))**
  - **프론트엔드 원클릭 Excel(.xlsx) 리포트 다운로드 연동 (`AiDiagnosisReport.tsx`, `useDiagnosisQueries.ts`):**
    - 백엔드 `ExportService` 바이너리 스트림과 연동하여 한글 파일명 및 MIME 타입이 보장된 Blob 다운로드 파이프라인 구축
    - 상단 헤더 액션 버튼 및 하단 리포트 액션 바에서 원클릭으로 엑셀 리포트 즉시 다운로드 지원
  - **브라우저 인쇄 친화적(Print-friendly) PDF 리포트 뷰 및 출력 기능:**
    - `window.print()` 호출 및 `@media print` 스타일(`print:hidden`, 백그라운드 색상 보존)을 적용하여 깔끔한 PDF 저장/인쇄 기능 구현
  - **품질 무결성 검증 (Tests & Builds):**
    - 프론트엔드 단위/컴포넌트 테스트 65건 100% Pass (Vitest)
    - 백엔드 단위 테스트 145건 100% Pass (Jest)
    - TypeScript strict 모드 빌드(`pnpm build`) 및 린트(`pnpm lint`, oxlint/eslint) 전사 통과
  - **하네스 정리 및 2-File Rule 준수:**
    - `.agents/Phase/phase12/` 디렉토리 내 `Phase12_harness.md` 및 `Phase12_sub_harness.md` 단일화 완료

### 🐛 Fixed (버그 수정)
- **리포트 인쇄 시 뷰포트 높이 고정으로 인한 내용 짤림 버그 수정:**
  - 상위 레이아웃(`AppLayout`, `RightPanel`, `AiDiagnosisReport`)의 `h-screen`, `overflow-hidden`, `overflow-y-auto` 제약을 `@media print` 및 `print:h-auto print:overflow-visible`로 일괄 해제
  - 인쇄 시 사이드바, 헤더, 캘린더 및 버튼 UI를 숨기고 리포트를 A4 전체 폭(100%)으로 확장
  - 카드 요소에 `break-inside: avoid`를 적용하여 페이지 경계선에서 카드가 잘리지 않고 자연스럽게 다음 페이지로 넘어가도록 개선
  - 인쇄 전용 공식 리포트 타이틀 및 발행일시 헤더 추가

---

## [Phase 12-03] - 2026-11-06

### 🚀 Added (신규 기능)
- **프론트엔드 AI 종합 진단 리포트 UI 및 시각화 구현 ([Phase 12 Sub-Harness](file:///C:/Users/pit19/OneDrive/바탕%20화면/프로그래밍/Boim/.agents/Phase/phase12/Phase12_sub_harness.md))**
  - **전역 상태 및 진단 쿼리 훅 연동 (`useAppStore.ts`, `useDiagnosisQueries.ts`):**
    - `panelMode === 'ai-diagnosis'` 전역 패널 모드 지원 및 `RightPanel.tsx` 조건부 렌더링 추가
    - TanStack Query 기반 `useGetDiagnosis`, `useGenerateDiagnosis`, `useExportExcel` 훅 구현
  - **네비게이션 진입점 연동:**
    - 좌측 사이드바(`Sidebar.tsx`)에 'AI 종합 진단' 메뉴 항목 추가 (`Sparkles` 아이콘)
    - 보험료 분석 패널(`PremiumAnalysis.tsx`) 상단에 'AI 맞춤 종합 진단' 배너 바로가기 링크 탑재
  - **AI 종합 진단 리포트 UI 컴포넌트 (`AiDiagnosisReport.tsx`):**
    - 종합 건강 점수 카드 (0~100점 점수, `EXCELLENT` ~ `WARNING` 등급 배지, AI 총평, 총 월 납입액 및 총 보장금액 칩)
    - 카테고리별 보장 적정도 프로그레스 바 및 뱃지 (`적정`, `부족`, `과다`, `미가입`)
    - AI 1:1 맞춤형 리모델링 조언 카드 (든든한 보장 포인트, 보완 필요 항목, 월 보험료 절감 팁)
    - 규칙 기반 폴백 엔진 감지 시 배지 안내
    - 가입 보험이 없을 때의 Empty State 및 새 보험 등록 전환 지원
  - **프론트엔드 단위 테스트 작성 (`AiDiagnosisReport.test.tsx`):**
    - 리포트 UI 정상 렌더링, 재분석/엑셀다운로드/인쇄 인터랙션, Empty State 검증 테스트 추가 (6건 100% Pass)

---

## [Phase 12-02] - 2026-11-06

### 🚀 Added (신규 기능)
- **백엔드 데이터 내보내기 (Excel XLSX 리포트) 서비스 및 API 구현 ([Phase 12-02](file:///C:/Users/pit19/OneDrive/바탕%20화면/프로그래밍/Boim/.agents/Phase/phase12/Phase12-02_harness.md))**
  - **`exceljs` 기반 다중 시트 엑셀 보고서 자동 생성 엔진 구축 (`ExportService`):**
    - **시트 1 (가입 보험 상세):** 번호, 보험사, 상품명, 카테고리, 월 납입액, 보장금액, 가입일, 만기일 및 하단 합계 통계 (통화 서식 및 Indigo-600 브랜드 헤더 스타일링 적용)
    - **시트 2 (카테고리별 통계):** 실손, 암/건강, 종신, 자동차 등 카테고리별 건수, 총 월 납입액, 총 보장금액, 납입 비중(%) 요약 테이블
    - **시트 3 (AI 종합 진단):** 종합 진단 점수 및 등급, 한줄평, 카테고리별 보장 적정도(ADEQUATE, UNDER_COVERED 등), 강점/보완점/절감팁 구조화 요약
  - **다운로드 스트림 엔드포인트 구현 (`AnalysisController`):**
    - `GET /analysis/export/excel`: 바이너리 스트림 다운로드 헤더(`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `boim_insurance_report_YYYYMMDD.xlsx`) 적용
  - **단위 테스트 작성 (`export.service.spec.ts`):**
    - 엑셀 버퍼 생성 및 시트 복원 유효성 검증 테스트 추가 (백엔드 단위 테스트 총 145건 100% 통과)

---

## [Phase 12-01] - 2026-11-06

### 🚀 Added (신규 기능)
- **백엔드 Gemini AI 보험 종합 진단 엔진 및 API 구현 ([Phase 12-01](file:///C:/Users/pit19/OneDrive/바탕%20화면/프로그래밍/Boim/.agents/Phase/phase12/Phase12-01_harness.md))**
  - **Google Gemini SDK (`@google/genai`) 기반 보장 진단 엔진 구축 (`AiDiagnosisService`):**
    - 사용자 가입 보험 목록, 월간 총 납입액, 카테고리별 보장액 집계를 바탕으로 `gemini-2.5-flash` 모델을 통한 정밀 분석 수행
    - 대한민국 3040 표준 권장 기준(실손 5천만원, 암/주요 3대 질병 5천만원, 사망 1억원 등) 대비 보장 과다/부족 판정
    - 종합 점수(0~100점), 등급(`EXCELLENT` ~ `WARNING`), 카테고리별 상태 평가, 강점/보완점/월 납입료 절감 팁 구조화 JSON 출력
  - **무결점 규칙 기반(Rule-based) 폴백 진단 엔진 탑재:**
    - `GEMINI_API_KEY` 환경변수 미설정 또는 네트워크 장애/할당량 초과 시에도 서비스가 중단 없이 100% 동작하도록 정교한 규칙 기반 진단 알고리즘 병행 구현 (`isFallback: true` 플래그 제공)
  - **공유 타입 정의 (`packages/shared-types`):**
    - `InsuranceDiagnosisDto`, `CategoryEvaluation`, `DiagnosisGrade`, `CoverageStatus` 인터페이스 정의
  - **엔드포인트 구현 (`AnalysisController`):**
    - `POST /analysis/ai-diagnosis` 및 `GET /analysis/ai-diagnosis` 구현 (Optional JWT Guard 및 소유권 통제 적용)
    - Swagger API 문서화 완료
  - **단위 테스트 작성 (`ai-diagnosis.service.spec.ts`, `analysis.controller.spec.ts`):**
    - 백엔드 단위 테스트 10건 추가 작성 (백엔드 총 141건 100% 통과)

---

## [Phase 11-04] - 2026-11-06

### 🚀 Added (신규 기능)
- **프론트엔드 알림 연동 및 Phase 11 스케줄러 배치/알림 시스템 완성 ([Phase 11 Sub-Harness](file:///C:/Users/pit19/OneDrive/바탕%20화면/프로그래밍/Boim/.agents/Phase/phase11/Phase11_sub_harness.md))**
  - **프론트엔드 실시간 알림 쿼리 훅 보강 (`useNotificationQueries.ts`):**
    - `useMarkAllNotificationsRead`: 본인 소유 모든 알림 일괄 읽음 처리 (`PATCH /notifications/read-all`)
    - `useTriggerBatch`: 개발/테스트용 스케줄러 즉시 실행 훅 (`POST /notifications/trigger-batch`)
    - 백엔드 스키마 일치 (`productId`, `channel`, `isRead` 등)
  - **알림 리스트 UI/UX 고도화 (`NotificationList.tsx`):**
    - 알림 종류별(`maturity`, `renewal`, `payment`) 맞춤형 아이콘 렌더링
    - '모두 읽음' 원클릭 처리 및 스케줄러 즉시 동기화 버튼 연동
    - 동기화 버튼 클릭 시 스캔 결과(검사 건수, 신규 알림 건수 등) 실시간 인앱 피드백 배너 안내 탑재
    - 읽지 않은 알림 뱃지 카운트 및 상대 시간 표시 UX 개선
  - **품질 무결성 검증 (Tests & Builds):**
    - 프론트엔드 단위/컴포넌트 테스트 56건 100% Pass (Vitest)
    - 백엔드 단위 테스트 131건 100% Pass (Jest)
    - TypeScript strict 모드 빌드(`pnpm build`) 및 린트(`pnpm lint`, oxlint/eslint) 전사 통과
  - **하네스 정리 및 2-File Rule 준수:**
    - Phase 11 하위 하네스들을 단일 `Phase11_sub_harness.md`로 통합 정리

---

## [Phase 11-03] - 2026-11-04

### 🚀 Added (신규 기능)
- **다중 채널 발송 처리 및 수동 배치 트리거 API 구현 ([Phase 11 Sub-Harness](file:///C:/Users/pit19/OneDrive/바탕%20화면/프로그래밍/Boim/.agents/Phase/phase11/Phase11_sub_harness.md))**
  - **다중 채널 분기 발송 어댑터 연동 (`NotificationSchedulerService`):**
    - 알림 생성 후 채널에 따른 외부 분기 발송 인터페이스(`sendEmail`, `sendPush`, `sendKakao`) 연동 및 전송 로깅
    - 외부 발송 실패 시에도 인앱 DB 저장이 안전하게 보존되는 예외 격리(Fault Tolerance) 처리
  - **스케줄러 수동 실행 엔드포인트 (`POST /notifications/trigger-batch`):**
    - `TriggerBatchDto`(`targetDate?: string`)를 통해 원하는 기준 날짜로 즉시 배치를 실행할 수 있는 관리/테스트용 API 추가
    - Swagger 문서화 및 Optional JWT Guard 적용
  - `NotificationController` 및 `NotificationSchedulerService` 단위 테스트 보강 (알림 모듈 총 34건 100% 통과)

---

## [Phase 11-02] - 2026-11-04

### 🚀 Added (신규 기능)
- **스케줄러 배치 및 만기/납입일 탐색 엔진 구현 ([Phase 11 Sub-Harness](file:///C:/Users/pit19/OneDrive/바탕%20화면/프로그래밍/Boim/.agents/Phase/phase11/Phase11_sub_harness.md))**
  - NestJS 11 호환 `@nestjs/schedule` 패키지 설치 및 `AppModule` 내 `ScheduleModule.forRoot()` 등록
  - `NotificationSchedulerService` 구현:
    - `@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: 'Asia/Seoul' })` 매일 자정 KST 배치 실행 크론 등록
    - **월 보험료 납입일 탐색:** `startDate` 일자(day) 기준 당월/익월 납입일 D-7, D-1 도래 상품 정밀 계산 (월말 일수 보정 포함)
    - **보험 만기일 탐색:** `maturityDate` 기준 D-30, D-7, D-Day 도래 상품 자동 감지
    - **중복 발송 방지 (Idempotency):** 동일 사용자/상품/알림제목 기준 당일(00:00:00~23:59:59) 기발송 레코드 존재 여부 체크 및 중복 스킵
    - **사용자 알림 설정 연동:** `UserNotificationSettings`의 야간 방해 금지 시간(`quietHoursStart` ~ `quietHoursEnd`) 감지 시 외부 채널 발송을 차단하고 `in_app` 채널로 격리 적재
    - 테스트 및 관리자용 수동 배치 구동 메서드(`runBatch(targetDate)`) 및 결과 통계(`scannedProducts`, `createdNotifications`, `skippedCount`) 제공
  - `NotificationSchedulerService` 단위 테스트 14건 작성 및 100% 통과

---

## [Phase 11-01] - 2026-10-30

### 🚀 Added (신규 기능)
- **Prisma Notification 스키마 고도화 및 DB 연동 인앱 알림 CRUD ([Phase 11 Sub-Harness](file:///C:/Users/pit19/OneDrive/바탕%20화면/프로그래밍/Boim/.agents/Phase/phase11/Phase11_sub_harness.md))**
  - `Notification` 모델 필드 확장 (`userId`, `title`, `message`, `channel`, `isRead`, `createdAt`) 및 `User`, `InsuranceProduct` 관계 정립
  - `NotificationService` 인메모리 더미 배열에서 PostgreSQL + Prisma 영속 저장소 연동으로 전면 전환
  - 본인 소유 알림 최신순 조회(`findAll`), 개별 읽음 처리(`markAsRead`), 전체 일괄 읽음 처리(`markAllAsRead`), 삭제(`remove`), 알림 생성(`createNotification`) API 구현
  - Swagger API 문서화 및 `OptionalJwtAuthGuard`를 통한 JWT 인증 및 데모 사용자 폴백 보안 로직 적용
  - `packages/shared-types` 내 `NotificationDto`, `CreateNotificationDto` 인터페이스 최신화
  - `NotificationService` 및 `NotificationController` 단위 테스트 13건 작성 및 100% 통과

---

## [Phase 10] - 2026-10-30

### 🚀 Added (신규 기능)
- **보험 증권 파일 업로드 & 패턴 매칭 데이터 자동 추출 ([Phase 10 Sub-Harness](file:///C:/Users/pit19/OneDrive/바탕%20화면/프로그래밍/Boim/.agents/Phase/phase10/Phase10_sub_harness.md))**
  - 백엔드 `Multer` 기반 증권 파일(PDF, PNG, JPG, TXT) 안전 업로드 API (`POST /documents/upload`)
  - `Tesseract.js` OCR 연동 및 고성능 정규식/휴리스틱 패턴 매칭 파서 엔진 구현
  - 토큰 소모 없는 즉각적 보험 계약 데이터(보험사, 상품명, 카테고리, 월납입액, 만기일 등) 추출
  - 가상 모의 증권 샘플 프리셋 및 즉시 분석 API (`POST /documents/sample/parse`)
- **프론트엔드 증권 업로더 UI 및 폼 자동 채우기(Prefill)**
  - 우측 패널 내 증권 파일 드래그 앤 드롭 및 원클릭 모의 증권 테스트 버튼(`PolicyDocumentUploader.tsx`)
  - 분석 완료 시 `InsuranceForm` 입력 필드(보험사, 상품명, 카테고리, 납입액 등) 자동 채우기 연동
  - TanStack Query 기반 `useDocumentQueries.ts` 훅 구현

### 🔒 Security & Architecture
- **Row-level 문서 소유권 통제**
  - `Document` 테이블에 `userId` 컬럼 추가 및 JWT Guard 기반 본인 소유 문서만 조회/삭제/파싱하도록 보안 강제
  - 상품 등록 전 사전 업로드를 지원하도록 `productId`를 nullable로 유연화
- **AI 역할 최적화 재배치**
  - 단순 증권 글자 파싱은 패턴 매칭으로 가볍게 처리하고, Gemini AI는 차기 '내 보험 종합 진단/분석 리포트' 전담으로 역할을 명확히 분리

---

## [Phase 09] - 2026-10-29

### 🚀 Added (신규 기능)
- **회원가입 플로우 및 간이 PASS 본인인증 ([Phase 09 Sub-Harness](file:///C:/Users/pit19/OneDrive/바탕%20화면/프로그래밍/Boim/.agents/Phase/phase09/Phase09_sub_harness.md))**
  - 신규 이메일/비밀번호 기반 회원가입 화면(`SignUp.tsx`) 구현
  - 간이 PASS 본인인증 화면(`PassVerification.tsx`) 및 통신사(SKT, KT, LGU+, 알뜰폰) 선택/인증번호 발송 로직 추가
  - 백엔드 `AuthService.register` 및 PASS 인증 완료 시 DB `isPassVerified` 및 `passCi` 동기화
- **설정 내 간이(Mock) 소셜 계정 연동 ([Phase 09 Sub-Harness](file:///C:/Users/pit19/OneDrive/바탕%20화면/프로그래밍/Boim/.agents/Phase/phase09/Phase09_sub_harness.md))**
  - 설정 패널에 '소셜 계정 연동' 메뉴 및 상세 뷰(`SocialAccountsSettings.tsx`) 구현
  - 백엔드 카카오/네이버 연동 상태 조회(`GET /auth/social/status`) 및 원클릭 간이 연동/해제 API 구현
  - 향후 상용 OAuth2 연동으로 즉시 교체할 수 있는 공식 SDK/컴포넌트 삽입 가이드 주석 추가
- **로그아웃 및 세션 정리 ([Phase 09 Sub-Harness](file:///C:/Users/pit19/OneDrive/바탕%20화면/프로그래밍/Boim/.agents/Phase/phase09/Phase09_sub_harness.md))**
  - 백엔드 `POST /auth/logout` 엔드포인트 및 DB `refreshToken` 제거
  - 프론트엔드 `useLogout` 훅을 통한 상태/스토리지 전면 초기화

### 🔒 Security & Infrastructure
- **비밀번호 암호화 및 시드 인프라**
  - 백엔드 `bcrypt` 도입 및 `seed.ts` 스크립트를 통한 안전한 테스트 계정(`test@boim.com`) 시딩
  - 로그인 및 재인증(Re-Auth) 시 DB 조회 및 `bcrypt.compare` 해시 검증 적용
- **하이브리드 인증 스토리지 및 라우트 보호 ([Phase 09 Sub-Harness](file:///C:/Users/pit19/OneDrive/바탕%20화면/프로그래밍/Boim/.agents/Phase/phase09/Phase09_sub_harness.md))**
  - '기기 기억하기(Remember Me)' 옵션에 따라 `localStorage`(ON) 또는 `sessionStorage`(OFF)로 토큰 저장소를 동적으로 전환하는 하이브리드 스토리지 어댑터 적용
  - 비인가 사용자의 메인 페이지 접근 차단 및 `/login` 리다이렉트(`ProtectedRoute.tsx`)
- **사용자 프로필 동기화 ([Phase 09 Sub-Harness](file:///C:/Users/pit19/OneDrive/바탕%20화면/프로그래밍/Boim/.agents/Phase/phase09/Phase09_sub_harness.md))**
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
