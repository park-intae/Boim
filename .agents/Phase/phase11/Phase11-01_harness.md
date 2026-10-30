> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 11-01: Prisma Notification 스키마 고도화 및 DB 연동 인앱 알림 CRUD

## 📌 목표
기존 인메모리 더미 배열로 동작하던 `NotificationService`를 실제 PostgreSQL + Prisma 기반 영속성 저장소로 전환하고,
사용자 격리(Row-level security), 읽음 처리, 전체 읽음 처리, 알림 삭제 기능을 완벽한 타입 안정성과 함께 구현합니다.

---

## 📋 세부 체크리스트
- [x] 1. `prisma/schema.prisma` 스키마 수정
  - `Notification` 모델 필드 확장: `userId`, `productId?`, `type`, `title`, `message`, `channel`, `isRead`, `createdAt`
  - `User`, `InsuranceProduct` 관계 정의
  - `npx prisma generate` 실행 완료 (Prisma Client v6.19.3 생성)
- [x] 2. `packages/shared-types` 및 DTO 타입 정리
  - `NotificationDto`, `CreateNotificationDto`, `NotificationType`, `NotificationChannel` 공통 인터페이스 최신화
- [x] 3. `NotificationService` DB 연동 리팩토링
  - `PrismaService` 주입
  - `findAll(userId)`: 본인 알림만 최신 생성일자 순으로 조회
  - `markAsRead(userId, id)`: 본인 소유 확인 후 `isRead: true` 갱신
  - `markAllAsRead(userId)`: 본인 소유 미읽음 알림 전체 `isRead: true` 일괄 갱신
  - `remove(userId, id)`: 본인 소유 확인 후 삭제
  - `createNotification(data)`: 알림 생성 메서드 구현
- [x] 4. `NotificationController` 리팩토링
  - `OptionalJwtAuthGuard` 적용 및 데모/비로그인 폴백 및 JWT 유저 추출
  - 공통 응답 및 Swagger 데코레이터 적용
- [x] 5. 단위 테스트 (`notification.service.spec.ts`, `notification.controller.spec.ts`) 작성 및 통과 (13 passed, 100%)
- [x] 6. git 커밋 (`feat(api): Phase 11-01 알림 스키마 고도화 및 Prisma DB 연동 알림 CRUD 구현`)
