> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 24: 전사 핵심 로직 실패·예외·경계값 시나리오 테스트 보강 (Comprehensive Negative & Edge-case Testing)

## 📌 목표 및 개요
백엔드(`apps/api`)와 프론트엔드(`apps/web`) 전 도메인의 핵심 비즈니스 로직에 대해 **실패·예외·경계값·타임존/윤년·롤백 시나리오 테스트**를 전수 보강합니다.

1. **백엔드 도메인 예외·경계값 전수 검증 (`Phase 24-01 ~ 24-03`)**:
   - Auth, User, Common, InsuranceProduct, Document, OCR Parser, Notification, RuleEvaluator, Analysis(AI/Rule/Export) 전반의 잘못된 입력, 권한 불일치, 외부 API 장애, 날짜/금액 경계값 테스트 보강.
2. **프론트엔드 API·UI·유틸 예외·롤백 검증 (`Phase 24-04 ~ 24-06`)**:
   - TanStack Query 훅의 네트워크/서버 실패 및 Optimistic Update 롤백, 폼/인증/캘린더(윤년·월말)/컴포넌트 에러 상태, `RouteErrorBoundary`·`webNotification`·`demoFallback`·`authStore` 경계값 테스트 보강.
3. **품질 무결성 및 문서 동기화**:
   - 전사 Jest + Vitest 100% Pass, 린트·타입체크 0 에러 유지 및 `.agents/Phase/Phase_harness.md`, `CHANGELOG.md`, `README.md` 최신화, 완료 후 서브 하네스 통합(`Phase24_sub_harness.md`).

---

## 📋 세부 Phase 마일스톤 로드맵
- [x] **Phase 24-01:** 백엔드 Auth · User · Common 실패·경계값 테스트 보강 ([Phase24-01_harness.md](./Phase24-01_harness.md))
- [x] **Phase 24-02:** 백엔드 InsuranceProduct · Document · Parser 실패·경계값 테스트 보강 ([Phase24-02_harness.md](./Phase24-02_harness.md))
- [x] **Phase 24-03:** 백엔드 Notification · RuleEvaluator · Analysis 실패·경계값 테스트 보강 ([Phase24-03_harness.md](./Phase24-03_harness.md))
- [x] **Phase 24-04:** 프론트엔드 API 훅 & `apiClient` 실패·롤백·데모 분기 테스트 보강 ([Phase24-04_harness.md](./Phase24-04_harness.md))
- [ ] **Phase 24-05:** 프론트엔드 Auth · 폼 · 캘린더(윤년/월말) · 핵심 컴포넌트 에러/경계값 테스트 보강 ([Phase24-05_harness.md](./Phase24-05_harness.md))
- [ ] **Phase 24-06:** 프론트엔드 Utils · ErrorBoundary · 전사 검증 및 문서 동기화 ([Phase24-06_harness.md](./Phase24-06_harness.md))
