> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 11: 보험 만기 & 보험료 납입일 스케줄러 배치 및 알림 발송 시스템 구현

## 📌 목표 및 개요
가입된 보험 상품의 **월 납입일(D-7, D-1)**과 **만기 도래일(D-30, D-7, D-Day)**을 정기적으로 탐색하는 스케줄러 배치(`@nestjs/schedule`)를 구축하고,
사용자 알림 설정(`UserNotificationSettings`: 방해 금지 시간, 채널별 On/Off)에 따라 인앱 알림(DB 저장) 및 외부 발송 채널(이메일/웹푸시 Mock)로 안전하게 발송하는 시스템을 완성합니다.

---

## 📋 세부 단계별 체크리스트

### 1. Phase 11-01: Prisma 스키마 고도화 및 인앱 알림 DB 연동 CRUD
- [x] `prisma/schema.prisma`의 `Notification` 모델 보강
  - `userId`, `title`, `message`, `isRead`, `createdAt` 필드 추가 및 `User`, `InsuranceProduct` 관계 정립
  - `prisma generate` 및 `prisma db push` (또는 migrate) 적용
- [x] `NotificationService` 인메모리 더미 데이터를 Prisma DB 연동으로 전환
  - `findAll(userId)`: 로그인 사용자 본인의 알림 목록 최신순 조회 (Row-level 보안)
  - `markAsRead(userId, id)`: 본인 알림 읽음 처리
  - `markAllAsRead(userId)`: 본인 알림 전체 읽음 처리
  - `remove(userId, id)`: 본인 알림 삭제
  - `createNotification(data)`: 내부 시스템 및 스케줄러용 알림 생성 메서드 구현
- [x] `NotificationController` 인증 가드(`JwtAuthGuard`) 및 User 데코레이터 적용
- [x] 인앱 알림 관련 서비스/컨트롤러 단위 테스트 작성

### 2. Phase 11-02: 스케줄러 배치 및 만기/납입일 탐색 엔진 (`@nestjs/schedule`)
- [ ] `@nestjs/schedule` 패키지 설치 및 `AppModule`에 `ScheduleModule.forRoot()` 등록
- [ ] `NotificationSchedulerService` 구현
  - `@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)` 매일 자정 배치 실행 크론 등록
  - KST 기준 당일 날짜 계산
  - **보험료 납입일 계산:** 매월 시작일의 일자(Day) 기준 D-7, D-1 대상 상품 탐색
  - **보험 만기일 계산:** `maturityDate` 기준 D-30, D-7, D-Day 대상 상품 탐색
  - **중복 발송 방지 로직:** 동일 상품, 동일 알림 유형, 동일 발송일자에 이미 알림이 생성되었는지 중복 검증
- [ ] 사용자 알림 설정 및 방해 금지 시간 필터링
  - `UserNotificationSettings` 조회
  - 채널별 On/Off(`pushEnabled`, `emailEnabled`, `kakaoEnabled`) 체크
  - `quietHoursStart` ~ `quietHoursEnd` 방해 금지 시간대 체크 (방해 금지 시간일 경우 발송 유예 또는 인앱 알림만 적재)

### 3. Phase 11-03: 다중 채널 발송 디스패처 및 수동 트리거 API
- [ ] `NotificationDispatcherService` 구현
  - In-app 알림 저장 (`Notification` DB insert)
  - Email 발송 어댑터 (`nodemailer` 기반 모의/실제 전송 로깅)
  - WebPush / 카카오 알림톡 모의 인터페이스
- [ ] 스케줄러 수동 실행 및 테스트를 위한 개발용 엔드포인트 제공 (`POST /notifications/trigger-batch`)
- [ ] 스케줄러 및 디스패처 단위 테스트 작성

### 4. Phase 11-04: 프론트엔드 연동 확인 및 전체 품질 검증
- [ ] 프론트엔드 `NotificationList` 컴포넌트와 백엔드 DB 응답 인터페이스 정합성 확인
- [ ] 프론트엔드 알림 읽음/삭제 및 설정 패널 동작 확인
- [ ] 전체 빌드(`pnpm build`), 린트(`pnpm lint`), 테스트(`pnpm test`) 무결성 검증
- [ ] `CHANGELOG.md`, `README.md`, `Phase_harness.md` 작업 이력 동기화
