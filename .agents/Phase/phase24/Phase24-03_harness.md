> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 시작 전 백엔드 작업은 @[.agents/BACKEND_HARNESS.md]를 반드시 숙독하고 지침을 준수할 것

# Phase 24-03: 백엔드 Notification · RuleEvaluator · Analysis 실패·경계값 테스트 보강

## 🎯 세부 목표
- 알림 스케줄러·이메일·날짜 규칙(윤년/월말/방해금지 경계)과 AI/규칙 진단 엔진·엑셀 내보내기의 장애 및 경계값 시나리오를 검증합니다.

## 📋 작업 체크리스트
- [x] **Notification & Scheduler (`notification.service.spec.ts`, `notification.controller.spec.ts`, `notification-rule.evaluator.spec.ts`, `notification-scheduler.service.spec.ts`, `email.service.spec.ts`)**
  - [x] `NotificationService` / `NotificationController`: 빈 목록, 타인 알림/미존재 `NotFoundException`, 보호 엔드포인트 `req.user` 누락 `UnauthorizedException`
  - [x] `NotificationRuleEvaluator`: 윤년/평년 2월 말일(28/29일)·30일 월말 납입일 보정, 12월→익년 1월 연도 이월, 야간 방해금지 `22:00`~`08:00` 정각 경계(`21:59`, `22:00`, `08:00`, `08:01`), 주간 방해금지, `determineChannel` 우선순위(`kakao > push > email > in_app`) 검증
  - [x] `NotificationSchedulerService`: 500건 초과 청크 페이징, `channel === 'in_app'` 외부 미발송, `userEmail === null` 폴백, 미지원 채널 경고 처리 검증
  - [x] `EmailService`: `sendMail` 실패 예외 전파, `NODE_ENV === 'test'` `jsonTransport`, Ethereal 실패 폴백 검증
- [x] **Analysis 도메인 (`rule-based-diagnosis.engine.spec.ts`, `ai-diagnosis.service.spec.ts`, `analysis.controller.spec.ts`, `export.service.spec.ts`)**
  - [x] `RuleBasedDiagnosisEngine`: 0원/음수/`null` 금액, 미분류 카테고리(`'기타'`), `cancerAmount`·`totalMonthlyPayment` 경계값, 점수 클램핑(20~95), `scoreToGrade`/`validateGrade` 경계값 검증
  - [x] `AiDiagnosisService`: `response.text` 빈 문자열 폴백, 마크다운 코드블록·비정상 JSON 타입 보정, 전체 모델 실패 시 규칙 기반 폴백, 5분 `diagnosisCache` 히트 및 `forceRefresh: true` 갱신 검증
  - [x] `AnalysisController` / `ExportService`: `getDiagnosis`/`exportExcel` 미인증 `UnauthorizedException`, `\t`/`\r` 수식 이스케이프 및 `totalPayment === 0` 비중 `0` 계산 검증
- [x] **검증 및 커밋:** `@boim/api` ESLint + Jest 전체 Pass 확인 후 `(Phase 24-03)` 커밋
