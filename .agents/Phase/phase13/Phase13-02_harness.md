> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 13-02: 알림 다중 채널 실제 발송 (브라우저 OS 푸시 & 이메일 실발송)

## 📌 목표
1. **백엔드 이메일 실발송 파이프라인 구축 (`apps/api`):**
   - `nodemailer` 패키지를 설치하고 `NotificationSchedulerService`에 실제 전송 파이프라인을 구축합니다.
   - 상용 SMTP 환경변수(`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`)가 존재하면 실서버 전송을 수행하고, 로컬/개발 환경에서는 `nodemailer.createTestAccount()`(Ethereal Mail)를 통해 미리보기 URL(`nodemailer.getTestMessageUrl`)을 로깅하여 즉각적인 검증을 지원합니다.
2. **프론트엔드 브라우저 Web Notification 연동 (`apps/web`):**
   - HTML5 Web Notification API를 활용하여 사용자가 알림 권한을 승인했을 때 실제 OS 데스크톱 토스트 알림을 띄웁니다.
   - 설정 화면(`NotificationSettingsSection.tsx`)에서 '푸시 알림' 토글 ON 시 브라우저 권한 요청(`Notification.requestPermission()`)을 연동하고, 브라우저가 알림을 거부한 경우 친절한 안내를 제공합니다.
   - 신규 알림 수신 또는 알림 패널 인터랙션 시 데스크톱 알림 팝업을 발생시킵니다.
3. **단위 테스트 및 품질 무결성 검증:**
   - 백엔드 `notification-scheduler.service.spec.ts`에 Nodemailer 연동(상용 SMTP 및 Ethereal 폴백) 테스트 추가
   - 프론트엔드 `NotificationSettingsSection` 및 웹 알림 유틸 단위 테스트 작성
   - 전체 테스트 통과(`pnpm test`), 린트(`pnpm lint`), 빌드(`pnpm build`) 100% 통과 후 단위 커밋

---

## 📋 세부 체크리스트

### 1. 백엔드 Nodemailer 이메일 발송 파이프라인 (`apps/api`)
- [x] `@boim/api`에 `nodemailer` 및 `@types/nodemailer` 의존성 설치
- [x] `NotificationSchedulerService`에 Nodemailer Transporter 초기화 및 `sendEmail` 실제 발송 로직 구현
  - 환경변수(`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`) 존재 시: 상용 SMTP 트랜스포터 생성
  - 미설정 시: Ethereal 가상 계정 생성 및 메일 발송 후 `nodemailer.getTestMessageUrl(info)` 로깅
  - 예외 발생 시 인앱 알림은 안전하게 보존하고 에러 상세 로깅
- [x] `notification-scheduler.service.spec.ts` 단위 테스트 갱신 (Nodemailer 모킹 및 발송 테스트)

### 2. 프론트엔드 Web Notification API 실연동 (`apps/web`)
- [x] 웹 알림 유틸리티 모듈 구현 (`apps/web/src/shared/utils/webNotification.ts`):
  - `isNotificationSupported()`: 브라우저 지원 여부 확인
  - `requestNotificationPermission()`: 권한 요청
  - `showDesktopNotification(title, options)`: 실제 데스크톱 알림 토스트 띄우기
- [x] 알림 설정 화면 연동 (`NotificationSettingsSection.tsx`):
  - 푸시 알림 토글 시 브라우저 권한 요청 트리거 및 권한 거부 시 상태 안내
- [x] 신규 알림 또는 알림 패널 연동 시 데스크톱 알림 팝업 트리거
- [x] 프론트엔드 단위 테스트 작성 (`NotificationSettingsSection.spec.tsx` 및 `webNotification.test.ts`)

### 3. 품질 검증 및 단위 커밋
- [x] 모노레포 전체 단위 테스트 통과 (`pnpm test` - API 147개, Web 81개 통과)
- [x] 전사 린트(`pnpm lint`) 및 빌드(`pnpm build`) 무결성 검증
- [x] CHANGELOG.md 업데이트
- [x] git commit (`feat: Phase 13-02 알림 다중 채널 실제 발송 (브라우저 OS 푸시 & 이메일 실발송) 연동`)
