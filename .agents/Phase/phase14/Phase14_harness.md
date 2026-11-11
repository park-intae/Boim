> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 14: 프론트엔드 테스트 커버리지 강화 및 컴포넌트/로직 책임 분리 (Architecture Refactoring)

## 📌 목표 및 개요
프론트엔드(`@boim/web`)의 테스트 커버리지를 **80% 이상**으로 끌어올려 견고한 품질 안전망을 먼저 구축한 후, 비대해진 핵심 컴포넌트 및 백엔드 서비스 로직을 단일 책임 원칙(SRP)에 입각하여 분리/모듈화합니다.
또한, 프론트엔드 코드 내에 산재하던 임시 모킹 데이터를 제거하고 체계적인 테스트 전용 Fixture/Handler를 도입하여 실제 API 통신 흐름과 100% 동일한 테스트 환경을 확보합니다.

---

## 📋 세부 단계별 체크리스트

### [Part 1] 프론트엔드 테스트 커버리지 강화 (목표: 80%+) & 테스트 Fixture 체계화

#### 1. Phase 14-01: 커버리지 측정 정밀화 및 테스트 데이터 Fixture 체계 구축
- [x] **커버리지 측정 범위 정밀화 (`vite.config.ts`):**
  - 단순 타입 선언, 정적 라우트 설정(`src/router/index.tsx`), 엔트리 파일(`main.tsx`) 등 비즈니스 로직이 없는 파일들을 커버리지 수집 대상에서 제외(exclude)
- [x] **프론트 내부 하드코딩 모킹 제거 및 공통 Test Fixture 구축 (`src/test/fixtures/`):**
  - 프론트 컴포넌트/훅 내부에 흩어져 있던 임시 모킹 데이터 정리
  - 보험 데이터, 사용자 프로필, 알림 목록, 캘린더 이벤트 등 표준 Fixture 생성 및 공통 재사용
- [x] 단위 검증 실행 및 커버리지 베이스라인 확인

#### 2. Phase 14-02: 설정(Settings) 패널 및 부가 컴포넌트 테스트 스위트 작성
- [x] **`PasswordSettings.spec.tsx`:** 현재 비밀번호/새 비밀번호 유효성 검사 및 변경 API 호출 검증
- [x] **`ProfileSettings.spec.tsx`:** 프로필(이름/이메일) 수정 폼 인터랙션 및 제출 검증
- [x] **`LoginHistorySettings.spec.tsx` / `NotificationTimeSettings.spec.tsx` / `PolicyViewer.spec.tsx`:** 로그인 기기 이력, 방해금지 시간 설정, 약관 뷰어 검증
- [x] **`SettingsPanel.spec.tsx`:** 탭 전환(알림/보안/프로필/약관 등) 및 데이터 내보내기/탈퇴 검증
- [x] **`Onboarding.spec.tsx`:** 온보딩 단계별(환영 -> 등록 안내 -> 완료) 이동 및 인터랙션 검증
- [x] **`AppLayout.test.tsx` / `NotificationList.test.tsx`:** 레이아웃 렌더링 및 알림 읽음/삭제 인터랙션 엣지 케이스 검증

#### 3. Phase 14-03: `src/api` React Query 훅 및 데이터 파이프라인 단위 테스트
- [ ] **핵심 커스텀 훅 단위 테스트 (`renderHook` 기반):**
  - `useInsurances` (목록 조회, 생성, 수정, 삭제 쿼리/뮤테이션)
  - `useNotifications` (목록 조회, 읽음 처리, 일괄 삭제)
  - `useCalendarEvents` (월별 이벤트 조회 및 캐시 무효화)
- [ ] 프론트엔드 전사 커버리지 중간 측정 (커버리지 80%+ 달성 여부 검증)

---

### [Part 2] 컴포넌트 분리 및 책임 단일화 리팩토링 (Clean Architecture)

#### 4. Phase 14-04: `RightPanel.tsx` 서브 컴포넌트 분리
- [ ] `RightPanel.tsx`에서 일별 일정 뷰 컴포넌트(`DailyEventsView.tsx`) 독립 분리
- [ ] 우측 패널 메인 탭(기본/일정/진단/알림/설정) 라우팅 로직 간소화 및 가독성 개선
- [ ] 기존 기능 및 인터랙션 회귀 테스트(Regression Test) 100% 통과

#### 5. Phase 14-05: `AiDiagnosisReport.tsx` 리포트 서브 컴포넌트 분리
- [ ] `AiDiagnosisReport.tsx`에서 하위 UI 컴포넌트 분리:
  - `DiagnosisScoreCard.tsx` (점수 및 등급 뱃지)
  - `CoverageProgressList.tsx` (보장 영역별 진행률 바)
  - `DiagnosisAdviceCards.tsx` (부족 보장 및 AI 개선 조언 카드)
- [ ] 리포트 컨테이너 단순화 및 각 서브 컴포넌트 단위 테스트 작성/통과

#### 6. Phase 14-06: 백엔드 도메인 비즈니스 규칙 엔진 분리
- [ ] `AiDiagnosisService`에서 순수 규칙 기반 진단 엔진(`RuleBasedDiagnosisEngine.ts`) 분리
- [ ] `NotificationSchedulerService`에서 만기/도래 판정 순수 도메인 규칙 엔진(`NotificationRuleEvaluator.ts`) 분리
- [ ] 백엔드 단위 테스트 100% 통과 및 의존성 주입 구조 최적화

#### 7. Phase 14-07: `InsuranceForm.tsx` 비즈니스 로직 훅 분리
- [ ] 폼 상태 관리, 유효성 검증, 데이터 변환 로직을 커스텀 훅(`useInsuranceForm.ts`)으로 분리
- [ ] `InsuranceForm.tsx` 뷰 레이어 경량화 및 훅 단위 테스트 작성

---

### [Part 3] 마일스톤 완료 및 최종 무결성 검증

#### 8. Phase 14-08: 전체 품질 무결성 검증 및 Phase 14 마일스톤 마무리
- [ ] 모노레포 전체 단위/통합 테스트 (Vitest & Jest 100% Pass)
- [ ] 최종 테스트 커버리지 측정 (프론트엔드 80%+ 및 백엔드 90% 유지 확인)
- [ ] 전사 빌드(`pnpm build`) 및 린트(`pnpm lint`) 무결성 검증
- [ ] 하네스 2-File Rule 단일화 (`Phase14_sub_harness.md`)
- [ ] `CHANGELOG.md` 및 `README.md` 최종 동기화
