> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 11-03: 다중 채널 발송 디스패처 및 배치 수동 트리거 API 구현

## 📌 목표
스케줄러가 탐색한 알림을 채널별(`in_app`, `email`, `push`, `kakao`)로 안전하게 분기 발송하는 `NotificationDispatcherService`를 구축하고,
개발 및 운영 환경에서 스케줄러 배치를 특정 일자 기준으로 즉시 수동 구동하고 테스트할 수 있는 관리용 엔드포인트(`POST /notifications/trigger-batch`)를 제공합니다.

---

## 📋 세부 체크리스트
- [ ] 1. `NotificationDispatcherService` 구현
  - 채널별 발송 어댑터 분기 처리:
    - `in_app`: Prisma DB 저장 (`NotificationService.createNotification`)
    - `email`: `Nodemailer` 모의/실제 발송 인터페이스 및 전송 로깅
    - `push`: WebPush / 모바일 푸시 모의 발송 인터페이스 및 로깅
    - `kakao`: 카카오 알림톡 모의 템플릿 발송 인터페이스 및 로깅
  - 전송 실패 시 방어 로직 및 에러 로깅
- [ ] 2. `NotificationSchedulerService`와 `NotificationDispatcherService` 결합
  - 배치 탐색 후 디스패처를 통해 적재/발송되도록 연동
- [ ] 3. 관리자/개발용 수동 배치 트리거 API 구현
  - 엔드포인트: `POST /notifications/trigger-batch`
  - 요청 Body: `{ targetDate?: string }` (ISO 문자열 또는 YYYY-MM-DD, 미입력 시 당일 KST)
  - 응답: `{ success: true, data: BatchExecutionResult }`
  - Swagger 데코레이터 및 DTO 검증 적용
- [ ] 4. 단위 테스트 작성 및 검증
  - `notification-dispatcher.service.spec.ts` 작성
  - `notification.controller.spec.ts`에 `triggerBatch` 엔드포인트 테스트 케이스 추가
- [ ] 5. 전체 빌드(`pnpm build`) 및 린트(`pnpm lint`) 무결성 검증
- [ ] 6. git 커밋 (`feat(api): Phase 11-03 다중 채널 발송 디스패처 및 배치 수동 트리거 API 구현`)
