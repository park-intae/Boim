> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 14-06: 백엔드 도메인 비즈니스 규칙 엔진 분리

## 📌 목표 및 개요
현재 백엔드의 `AiDiagnosisService`와 `NotificationSchedulerService`는 DB 조회, 외부 API 연동, 알림 디스패치 등의 I/O 로직과 순수 비즈니스 계산/평가 로직(룰 기반 점수 산출, 연령/성별 권장 보장액 산출, 만기/도래 기간 판정 알고리즘 등)이 강하게 결합되어 있습니다.
이를 해결하기 위해 순수 도메인 비즈니스 규칙을 담당하는 순수 클래스/엔진(Pure Domain Engines)을 분리하여, 단일 책임 원칙(SRP)을 준수하고 단위 테스트 용이성과 유지보수성을 극대화합니다.

---

## 📋 세부 체크리스트

- [x] **1. `RuleBasedDiagnosisEngine` 분리 (`apps/api/src/analysis/rule-based-diagnosis.engine.ts`):**
  - DB 또는 외부 API 의존성이 없는 순수 계산 로직 분리
  - 연령대/성별 기준 권장 보장액 및 보험료 계산
  - 사용자 보유 담보 대비 보장 적정도(ADEQUATE, INSUFFICIENT, EXCESSIVE) 판정
  - 종합 점수(0~100) 및 등급 산출, 조언 텍스트 생성
- [x] **2. `AiDiagnosisService` 리팩토링:**
  - 분리된 `RuleBasedDiagnosisEngine`을 주입받아(또는 컴포지션) 순수 계산을 위임
  - 서비스 본연의 역할(DB 조회, OpenAI 호출 및 fallback 제어, 캐싱)에 집중
- [x] **3. `NotificationRuleEvaluator` 분리 (`apps/api/src/notification/notification-rule.evaluator.ts`):**
  - 계약 만기일, 갱신일, 납입일 기준 D-30, D-7, D-Day 등의 알림 대상 도출 판정 로직 분리
  - 타임존(KST) 및 날짜 계산 순수 함수화
- [x] **4. `NotificationSchedulerService` 리팩토링:**
  - 분리된 `NotificationRuleEvaluator`를 활용하여 판정된 이벤트에 대해서만 알림 레코드 생성 및 전송 수행
- [x] **5. 단위 테스트 작성 및 기존 테스트 회귀 검증:**
  - `rule-based-diagnosis.engine.spec.ts` 단위 테스트 작성
  - `notification-rule.evaluator.spec.ts` 단위 테스트 작성
  - 백엔드 전체 테스트(`pnpm --filter @boim/api test`) 100% Pass 검증
  - 빌드 및 린트 검증
- [x] **6. 작업 완료 후 커밋:**
  - `refactor: Phase 14-06 백엔드 순수 도메인 비즈니스 규칙 엔진(AI진단/알림판정) 분리`
