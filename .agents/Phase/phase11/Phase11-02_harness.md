> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 11-02: 스케줄러 배치 및 만기/납입일 탐색 엔진 (`@nestjs/schedule`)

## 📌 목표
`@nestjs/schedule` 기반으로 매일 자정(KST) 실행되는 크론 배치를 구축하고,
등록된 전체 보험 상품의 **월 납입일(D-7, D-1)** 및 **만기일(D-30, D-7, D-Day)** 도래 여부를 정밀하게 계산하여
중복 발송 방지 및 사용자 알림 설정(`UserNotificationSettings`)에 따라 알림 레코드를 안전하게 생성하는 엔진을 구현합니다.

---

## 📋 세부 체크리스트
- [x] 1. `@nestjs/schedule` 패키지 설치 및 `AppModule`에 `ScheduleModule.forRoot()` 등록
- [x] 2. `NotificationSchedulerService` 구현
  - `@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: 'Asia/Seoul' })` 크론 스케줄링
  - KST 기준 당일 날짜 계산 및 수동 실행 지원 (`runBatch(targetDate?: Date)`)
  - **월 보험료 납입일 탐색:** `startDate` 일자(day) 기준 D-7, D-1 도래 상품 탐색
  - **보험 만기일 탐색:** `maturityDate` 기준 D-30, D-7, D-Day 도래 상품 탐색
  - **중복 생성 방지:** 동일 상품, 동일 알림 유형, 당일 이미 발송/생성된 알림 중복 검증
  - **사용자 알림 설정 연동:** `UserNotificationSettings` (채널 허용 여부, 방해 금지 시간 체크)
- [x] 3. `NotificationModule`에 `NotificationSchedulerService` 제공 및 exports 등록
- [x] 4. 스케줄러 단위 테스트 (`notification-scheduler.service.spec.ts`) 작성 및 통과 검증 (14 passed, 100%)
- [x] 5. 전체 빌드 및 린트 검증
- [x] 6. git 커밋 (`feat(api): Phase 11-02 스케줄러 배치 및 만기/납입일 탐색 엔진 구현`)
