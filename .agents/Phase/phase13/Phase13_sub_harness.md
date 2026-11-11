> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 13: 더미(Mock) 제거 & 실제 서비스 실연동 고도화 (통합 세부 하네스)

> 본 문서는 Phase 13의 모든 하위 작업(Phase 13-01 ~ 13-04)을 통합 관리하는 2-File Rule 준수용 통합 하위 하네스입니다.

---

## 📌 Phase 13 세부 단계별 구현 및 검증 내역

### 1. Phase 13-01: 대시보드 미납 알림 실시간 집계 & 캘린더 일정 수정(Edit) 모드 연동
- [x] **대시보드 미납 알림 실시간 집계 (`HomePage.tsx`):**
  - 하드코딩 `0건` 제거 후 `useGetNotifications` 쿼리 기반 미확인 납입 알림 및 당월 납입일 경과 건수 실시간 계산
  - 요약 카드 클릭 시 알림 패널(`panelMode = 'notifications'`)로 즉시 이동하는 인터랙션 연결
- [x] **캘린더 일정 클릭 시 보험 수정 모드 실연동 (`RightPanel.tsx`, `InsuranceForm.tsx`, `useAppStore.ts`):**
  - 전역 스토어 `editingInsuranceId` 상태 관리
  - 캘린더 일정 카드 클릭 시 해당 보험 정보를 폼에 자동 바인딩(Prefill)하고 수정 폼 오픈
  - 폼 제출 시 신규 등록 대신 `useUpdateInsurance`를 호출하여 실제 보험 정보 수정 및 화면 즉시 갱신
- [x] **단위 테스트:** `HomePage.test.tsx`, `RightPanel.test.tsx`, `InsuranceForm.test.tsx` 100% Pass

### 2. Phase 13-02: 알림 다중 채널 실제 발송 및 이메일 탈착형 아키텍처 리팩토링
- [x] **브라우저 Web Notification API 실연동 (`webNotification.ts`, `NotificationSettingsSection.tsx`, `NotificationList.tsx`):**
  - HTML5 Web Notification API 헬퍼 유틸리티 구현 (`isNotificationSupported`, `requestNotificationPermission`, `showDesktopNotification`)
  - 환경설정에서 '푸시 알림' 토글 시 브라우저 권한 요청 연결 및 거부 시 안내 처리
  - 수동 스캔 또는 신규 알림 감지 시 실제 OS 데스크톱 토스트 알림 팝업 발송
- [x] **백엔드 Nodemailer 기반 이메일 발송 독립 Provider 분리 (`EmailService`):**
  - `nodemailer` 패키지 설치 및 독립 서비스 `EmailService` 분리 구축
  - 상용 SMTP(`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`) 연동 및 Ethereal 가상 계정/미리보기 URL(`getTestMessageUrl`) 로깅 지원
  - `NotificationSchedulerService`에 `@Optional()` 주입 및 `ENABLE_EMAIL_NOTIFICATION` 기능 플래그 지원으로 무중단 탈착 가능 구조 완성
- [x] **프론트엔드 탈착형 컴포넌트화 (`EmailNotificationItem.tsx`, `PushNotificationItem.tsx`):**
  - 각 채널별 설정을 독립 컴포넌트로 분리하여 필요 시 한 줄 수정으로 자유로운 탈착 지원
- [x] **단위 테스트:** `email.service.spec.ts`, `notification-scheduler.service.spec.ts`, `webNotification.test.ts`, `NotificationSettingsSection.spec.tsx` 100% Pass

### 3. Phase 13-03: PASS 본인인증 실감형 인터랙션 고도화 (3분 타이머 & 세션 코드)
- [x] **백엔드 PASS 인증 세션 & 3분 TTL 파이프라인 (`PassService`):**
  - 고정 우회 코드 의존 탈피: 요청마다 고유 트랜잭션 ID 발급 및 6자리 보안 난수 생성/메모리 캐시 매핑
  - 3분(180초) TTL 만료 검증(`400 Bad Request: 인증 유효시간 만료`) 및 검증 성공 시 일회용 즉시 세션 파기
  - 동일 휴대폰 번호 30초 내 연속 요청 방지(Rate-limiting / Cooldown)
- [x] **프론트엔드 PASS 인증 3분 타이머 & 재전송 UI (`PassVerification.tsx`):**
  - 3분(180초) 실시간 카운트다운 타이머(`03:00` ➔ `00:00`) 및 1분 미만 잔여 시각적 경고 스타일 적용
  - 3분 만료 시 입력창 및 확인 버튼 비활성화, 만료 안내 표시
  - '인증번호 재전송' 버튼을 통한 새 세션 요청 및 타이머 리셋 지원
- [x] **안내 문서화 (`README.md`):**
  - 실제 통신사 PASS는 유료 계약 제약으로 인해 미연동 상태임을 명시하고, 추후 실 대행사 모듈을 바로 장착할 수 있도록 실사와 최대한 유사하게 프로토콜을 구축했음을 상세 안내
- [x] **단위 테스트:** `pass.service.spec.ts`, `PassVerification.spec.tsx` 100% Pass

### 4. Phase 13-04: 전체 품질 무결성 검증 및 Phase 13 마일스톤 마무리
- [x] 모노레포 전체 단위/통합 테스트 (Vitest 86개 & Jest 150개 = 총 236개 테스트 100% Pass)
- [x] 전사 빌드(`pnpm build`) 및 린트(`pnpm lint`) 무결성 검증 (0 errors)
- [x] 하네스 2-File Rule 단일화 (`Phase13_harness.md`, `Phase13_sub_harness.md`)
- [x] `CHANGELOG.md` 및 `README.md`, `Phase_harness.md` 최종 동기화
