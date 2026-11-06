> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것

# Phase 11 하위 작업 통합 하네스 (Phase 11 Sub-Harness)

본 문서는 Phase 11(보험 만기 & 보험료 납입일 스케줄러 배치 및 알림 발송 시스템) 과정에서 진행된 세부 하위 작업(Phase 11-01 ~ 11-04)의 실행 내역과 체크리스트를 하나로 통합 정리한 문서입니다.

---

## 📋 Phase 11-01: Prisma 스키마 고도화 및 인앱 알림 DB 연동 CRUD

> **목표:** 알림 데이터의 영속성 확보를 위해 Prisma Notification 스키마를 고도화하고, 기존 인메모리 방식의 NotificationService를 데이터베이스 연동 방식으로 전면 교체하여 사용자별(Row-level) 알림 CRUD를 구현합니다.

### 1. Prisma 스키마 및 DB 모델링
- [x] `prisma/schema.prisma`의 `Notification` 모델 보강
  - `userId`, `productId`, `type`, `title`, `message`, `channel`, `isRead`, `createdAt` 필드 구성
  - `User`, `InsuranceProduct` 관계 정립
  - `prisma generate` 및 `prisma db push` 적용
- [x] `packages/shared-types`: `NotificationDto`, `CreateNotificationDto`, `NotificationType` 인터페이스 동기화

### 2. 백엔드 알림 CRUD 서비스 및 컨트롤러 구현
- [x] `NotificationService` 인메모리 더미 데이터를 Prisma 영속 저장소 연동으로 전환:
  - `findAll(userId)`: 본인 소유 알림 최신순 조회
  - `markAsRead(userId, id)`: 개별 알림 읽음 처리
  - `markAllAsRead(userId)`: 본인 알림 일괄 읽음 처리
  - `remove(userId, id)`: 본인 알림 삭제
  - `createNotification(data)`: 시스템 및 스케줄러용 알림 생성
- [x] `NotificationController` 구현:
  - `OptionalJwtAuthGuard` 및 데모 사용자 폴백 로직 적용
  - Swagger API 문서화 (`@ApiOperation`, `@ApiResponse`)
- [x] 단위 테스트 작성 (`notification.service.spec.ts`, `notification.controller.spec.ts`, 13건 100% 통과)

---

## 📋 Phase 11-02: 스케줄러 배치 및 만기/납입일 탐색 엔진 (`@nestjs/schedule`)

> **목표:** `@nestjs/schedule`을 연동하여 매일 자정(KST 00:00) 자동으로 가입 보험 상품의 납입일과 만기일을 계산하고, 중복 발송 방지 및 사용자 방해 금지 시간을 고려한 탐색 및 알림 생성 엔진을 구축합니다.

### 1. 스케줄러 모듈 및 크론 등록
- [x] `@nestjs/schedule` 패키지 설치 및 `AppModule`에 `ScheduleModule.forRoot()` 등록
- [x] `NotificationSchedulerService` 구현 및 크론 등록:
  - `@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: 'Asia/Seoul' })`
  - 수동 실행 및 테스트를 위한 `runBatch(targetDate)` 지원

### 2. 날짜 탐색 알고리즘 및 비즈니스 룰
- [x] **월 보험료 납입 예정일 계산:**
  - `startDate` 일자(Day) 기준 당월/익월 납입 예정일 계산 (월말 일수 보정 포함)
  - D-7, D-1 대상 상품 자동 감지
- [x] **보험 만기일 계산:**
  - `maturityDate` 기준 D-30, D-7, D-Day 대상 상품 감지
- [x] **중복 발송 방지 (Idempotency):**
  - 동일 사용자/상품/알림제목 기준 당일(00:00:00 ~ 23:59:59) 발송 내역 조회 후 중복 생성 스킵
- [x] **사용자 알림 설정 연동:**
  - `UserNotificationSettings`의 야간 방해 금지 시간(`quietHoursStart` ~ `quietHoursEnd`) 감지 시 외부 채널 발송을 차단하고 `in_app` 채널로 격리 적재

### 3. 단위 테스트 검증
- [x] `notification-scheduler.service.spec.ts` 14건 단위 테스트 작성 및 100% 통과

---

## 📋 Phase 11-03: 다중 채널 발송 처리 및 수동 트리거 API

> **목표:** 생성된 알림을 외부 채널(이메일, 웹푸시, 카카오톡 알림톡 Mock)로 분기 발송하는 어댑터 인터페이스를 연동하고, 결함 격리(Fault Tolerance) 및 개발/관리용 수동 배치 구동 엔드포인트를 구현합니다.

### 1. 다중 채널 분기 발송 어댑터 연동
- [x] `sendEmail`, `sendPush`, `sendKakao` 모의 발송 인터페이스 연동 및 발송 로그 기록
- [x] 외부 발송 실패 시에도 인앱 DB 저장이 보호되는 결함 격리(Fault Tolerance) 예외 처리

### 2. 수동 배치 트리거 API 구현
- [x] `POST /notifications/trigger-batch` 엔드포인트 구현:
  - `TriggerBatchDto` (`targetDate?: string`) 지원으로 특정 기준일자 강제 배치 실행
  - Swagger 문서화 및 Optional JWT Guard 연동

### 3. 단위 테스트 검증
- [x] 알림 모듈 전체 단위 테스트 34건 100% 통과 검증

---

## 📋 Phase 11-04: 프론트엔드 알림 연동 확인 및 전체 품질 검증

> **목표:** 프론트엔드 알림 UI 및 쿼리 훅을 백엔드 DB 연동 사양에 맞게 고도화하고, 전사 단위/컴포넌트 테스트 및 빌드/린트 검증을 완료합니다.

### 1. 프론트엔드 알림 인터페이스 & UI 연동
- [x] `useNotificationQueries.ts`:
  - `useMarkAllNotificationsRead` 훅 추가 (`PATCH /notifications/read-all`)
  - `useTriggerBatch` 훅 추가 (`POST /notifications/trigger-batch`)
  - `NotificationDto` 백엔드 스키마 일치 (`productId`, `channel` 등)
- [x] `NotificationList.tsx`:
  - 만기(`maturity`) 및 갱신(`renewal`) 알림 타입별 아이콘 분기
  - '모두 읽음' 일괄 처리 버튼 및 '즉시 스캔' 수동 배치 트리거 버튼 추가
  - 알림 개수 뱃지 카운트 및 상대 시간 표시 UX 개선

### 2. 품질 무결성 검증 (빌드, 린트, 테스트)
- [x] 프론트엔드 단위/컴포넌트 테스트: 19개 파일, 56개 테스트 100% 통과
- [x] 백엔드 단위 테스트: 20개 스위트, 131개 테스트 100% 통과
- [x] 모노레포 전체 빌드(`pnpm build`) 100% 통과
- [x] 모노레포 전체 린트(`pnpm lint`) 100% 통과 (0 errors)
- [x] Phase 11 하위 하네스 단일화 (2-File Rule) 및 문서 동기화 완료
