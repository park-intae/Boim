# 📋 Boim 변경 이력 (Changelog)

이 문서는 **Boim** 프로젝트의 주요 변경 사항, 신규 기능 추가, 버그 수정 및 보안 패치 내역을 시간 및 단계(Phase)별로 기록하는 패치노트입니다.  
형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)의 규격을 준용합니다.

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
