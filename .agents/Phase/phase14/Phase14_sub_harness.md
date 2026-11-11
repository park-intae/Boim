> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 14 통합 서브 하네스 (Phase 14 Sub-Harness)

> **안내:** 본 문서는 Phase 14 마일스톤 완료 후 2-File Rule에 따라 분산되어 있던 `Phase 14-01`부터 `Phase 14-08`까지의 모든 세부 하위 하네스 이력 및 체크리스트를 하나로 통합 보존한 공식 문서입니다.

---

## 📑 1. Phase 14-01: 커버리지 설정 정밀화 및 공통 Test Fixtures 구축
- [x] **Vitest 커버리지 범위 정밀화:** 정적 라우트/타입 배제 및 수집 대상 정규화 (`vitest.config.ts`)
- [x] **공통 표준 Fixture 체계 구축 (`src/test/fixtures/`):**
  - `insurance.fixtures.ts`: 다양한 상태(실비, 암, 종신, 자동차)의 보험 상품 Fixture
  - `auth.fixtures.ts`: 모의 사용자, 토큰, 디바이스 로그인 이력 Fixture
  - `diagnosis.fixtures.ts`: AI 분석 리포트 및 카테고리별 평가 데이터 Fixture
  - `notification.fixtures.ts`: D-7/D-1/만기 알림 및 사용자 알림 설정 Fixture
- [x] **프론트엔드 테스트 회귀 검증:** 기존 86개 테스트 100% Pass

---

## 📑 2. Phase 14-02: `SettingsPanel` 및 주요 부가 컴포넌트 테스트 스위트 작성
- [x] **설정 패널 및 서브 설정 컴포넌트 테스트 완비:**
  - `SettingsPanel.spec.tsx` (메인 탭 및 하위 메뉴 네비게이션)
  - `PasswordSettings.spec.tsx` (비밀번호 변경 및 유효성 검사)
  - `ProfileSettings.spec.tsx` (내 정보 조회 및 수정)
  - `LoginHistorySettings.spec.tsx` (로그인 기기 이력 조회 및 로그아웃)
  - `NotificationTimeSettings.spec.tsx` (방해금지 시간 설정)
  - `PushNotificationItem.spec.tsx` (푸시 알림 브라우저 권한 연동)
  - `PolicyViewer.spec.tsx` (이용약관/개인정보 처리방침 뷰어)
- [x] **온보딩 및 공통 레이아웃 테스트 완비:**
  - `Onboarding.spec.tsx` (신규 사용자 온보딩 단계 인터랙션)
  - `AppLayout.spec.tsx` (메인 공통 3열 레이아웃)
- [x] **커버리지 상승 확인:** 56.93% ➔ 68.95% (+12.08%p 상승, 129개 테스트 통과)

---

## 📑 3. Phase 14-03: `src/api` React Query 훅 단위 테스트 작성
- [x] **API 클라이언트 및 인터셉터 단위 테스트:** `client.spec.ts` (토큰 주입 및 공통 에러 언래핑 100% 커버)
- [x] **전체 React Query 훅 단위 테스트 스위트 작성:**
  - `useInsuranceQueries.spec.ts` (보험 상품 조회, 생성, 수정, 삭제)
  - `useNotificationQueries.spec.ts` (알림 목록, 읽음 처리, 일괄 삭제, 크론 배치)
  - `useUserQueries.spec.ts` (프로필, 비밀번호, 알림 설정, 백업, 탈퇴, 디바이스)
  - `useDiagnosisQueries.spec.ts` (AI 진단 리포트, 재분석, 엑셀 다운로드)
  - `useDocumentQueries.spec.ts` (증권 업로드 및 AI 파싱)
- [x] **목표 기준선 돌파:** `src/api` 라인 커버리지 13.15% ➔ 93.68%, 프론트 전사 커버리지 82.56% (80%+ 목표 조기 달성)

---

## 📑 4. Phase 14-04: `RightPanel.tsx` 서브 컴포넌트 분리
- [x] **`DailyEventsView.tsx` 독립 분리:** 우측 패널에서 일별 일정 렌더링, 상태 뱃지, 수정 모드 전환 책임을 분리하여 252줄 ➔ 150줄(-40%) 경량화
- [x] **단위 테스트 작성:** `DailyEventsView.spec.tsx` 6개 테스트 100% 통과 (커버리지 93.75%)

---

## 📑 5. Phase 14-05: `AiDiagnosisReport.tsx` 서브 컴포넌트 분리
- [x] **프레젠테이션 서브 컴포넌트 3종 분리 (`apps/web/src/components/layout/diagnosis/`):**
  - `DiagnosisScoreCard.tsx` (종합 점수 0~100점, 등급 뱃지, AI 총평)
  - `CoverageProgressList.tsx` (카테고리별 보장액 대조, 적정/부족 뱃지, 프로그레스 바)
  - `DiagnosisAdviceCards.tsx` (강점, 개선점, 월 납입료 절감 팁)
- [x] **메인 리포트 뷰 경량화:** 347줄 ➔ 178줄(-49%) 컴포지션 컨테이너로 리팩토링
- [x] **단위 테스트:** `DiagnosisComponents.spec.tsx` 5개 테스트 및 회귀 테스트 100% Pass

---

## 📑 6. Phase 14-06: 백엔드 도메인 비즈니스 규칙 엔진 분리
- [x] **`RuleBasedDiagnosisEngine` 분리 (`apps/api/src/analysis/rule-based-diagnosis.engine.ts`):**
  - DB/외부 API와 무관한 순수 진단 점수/등급/카테고리 평가/조언 알고리즘 분리
  - `AiDiagnosisService`는 485줄 ➔ 184줄(-62%)로 축소되어 Gemini 호출 및 fallback 위임에 집중
- [x] **`NotificationRuleEvaluator` 분리 (`apps/api/src/notification/notification-rule.evaluator.ts`):**
  - 크론/DB/메일 I/O와 무관한 납입일(D-7, D-1), 만기일(D-30, D-7, D-Day), 방해금지 시간 판정 순수 도메인 엔진 분리
  - `NotificationSchedulerService`는 522줄 ➔ 291줄(-44%)로 경량화
- [x] **단위 테스트:** `rule-based-diagnosis.engine.spec.ts`, `notification-rule.evaluator.spec.ts` 작성, 백엔드 26개 스위트 170개 테스트 100% Pass

---

## 📑 7. Phase 14-07: `InsuranceForm.tsx` 비즈니스 로직 훅 분리
- [x] **`useInsuranceForm.ts` 커스텀 훅 분리 (`apps/web/src/hooks/useInsuranceForm.ts`):**
  - 폼 유효성 검사(Zod), 신규/수정 모드 Prefill, 자동 분석 파싱 데이터 매핑, React Query 뮤테이션 호출 위임 분리
- [x] **`InsuranceForm.tsx` 뷰 경량화:** 231줄 ➔ 125줄(-46%)로 대폭 가독성 향상
- [x] **단위 테스트:** `useInsuranceForm.spec.ts` 5개 테스트 및 `InsuranceForm.test.tsx` 4개 테스트 100% Pass

---

## 📑 8. Phase 14-08: 전체 품질 무결성 검증 및 Phase 14 마일스톤 마무리
- [x] **전사 테스트 100% 통과:** Vitest 179개 + Jest 170개 = **총 349개 테스트 100% Pass**
- [x] **최종 커버리지 달성:** 프론트엔드 Lines **83.15%**, 백엔드 Lines **90.22%** 달성
- [x] **빌드 및 린트 검증:** Vite/NestJS 프로덕션 빌드 성공 및 oxlint 0 warnings/0 errors 무결성 통과
- [x] **문서 최신화:** `TEST_COVERAGE.md`, `CHANGELOG.md`, `README.md`, `Phase_harness.md` 업데이트 완료
