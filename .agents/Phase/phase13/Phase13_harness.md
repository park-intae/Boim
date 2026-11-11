> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 13: 더미(Mock) 제거 & 실제 서비스 실연동 고도화 (Real-world Integration)

## 📌 목표 및 개요
기존 Phase 01~12를 거치며 구축된 아키텍처 중에서 개발/테스트 편의를 위해 임시로 더미(Mock) 또는 하드코딩 처리해두었던 주요 기능들을 **실제 100% 살아 움직이는 상용 수준의 실동작 기능**으로 고도화합니다.

1. 대시보드 미납/주의 알림 카운트 실시간 집계 및 캘린더 일정 클릭 시 보험 수정(Edit) 모드 실연동
2. 브라우저 데스크톱 실제 웹 알림(Notification API) 및 이메일(Nodemailer Ethereal/SMTP) 실발송 연동
3. PASS 본인인증 3분 유효시간 타이머, 실시간 세션 랜덤 코드 및 재전송 제어 실감형 인증 파이프라인 구축
4. 전사 단위/통합 테스트, 빌드/린트 검증 및 2-File Rule 하네스 단일화

---

## 📋 세부 단계별 체크리스트

### 1. Phase 13-01: 대시보드 미납 알림 실시간 집계 & 캘린더 일정 클릭 시 보험 수정(Edit) 모드 실연동
- [x] **대시보드 "미납 알림" 카드 실시간 데이터 연동 (`HomePage.tsx`):**
  - 하드코딩된 `value: '0'` 제거
  - 실제 가입된 보험 중 당월 납입일이 지난 건 또는 읽지 않은 납입 알림(`type: 'payment' && !isRead`) 실시간 집계 쿼리 연동
  - 클릭 시 해당 알림 패널 또는 관련 보험 목록으로 바로 이동하는 인터랙션 지원
- [x] **캘린더 일정 카드 클릭 시 '보험 수정(Edit) 모드' 연동 (`RightPanel.tsx`, `InsuranceForm.tsx`):**
  - 일정 카드 클릭 이벤트(`onClick`)에 해당 보험 ID 선택 및 수정 모드(`mode: 'edit'`) 진입 로직 연동
  - `InsuranceForm.tsx`에 기존 보험 데이터 자동 바인딩(Prefill) 및 수정 저장(`useUpdateInsurance`) 완료 후 캘린더/상세 즉시 갱신
  - 단위 테스트 작성 및 통과

### 2. Phase 13-02: 알림 다중 채널 실제 발송 (브라우저 OS 푸시 & 이메일 실발송)
- [x] **브라우저 Web Notification API 실연동 (`apps/web`):**
  - 사용자 브라우저 알림 권한(`Notification.requestPermission()`) 요청 및 설정 연동
  - 스케줄러 동기화 또는 수동 스캔 실행 시 실제 Windows/Mac 우측 하단 데스크톱 알림 토스트 팝업 발송
- [x] **백엔드 Nodemailer 기반 이메일 실발송 파이프라인 (`apps/api`):**
  - Nodemailer 연동 (`NotificationSchedulerService` 내 `sendEmail`)
  - 개발/테스트 환경용 Ethereal Mail 가상 메일함 URL 생성 및 콘솔 안내 (미리보기 지원)
  - 상용 SMTP 환경변수 대응 (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`)
  - 단위 테스트 작성 및 통과

### 3. Phase 13-03: PASS 본인인증 실감형 인터랙션 고도화 (타이머 & 세션 코드)
- [x] **백엔드 PASS 인증 서비스 고도화 (`pass.service.ts`):**
  - 고정 우회 코드(`123456`) 의존 탈피: 세션별 암호화 랜덤 6자리 코드 발급 및 3분(180초) TTL 만료 캐시 관리
  - 유효시간 만료 검증 및 30초 내 재요청 방지(Rate-limiting / Cooldown)
- [x] **프론트엔드 PASS 인증 UI 고도화 (`PassVerification.tsx`):**
  - 3분(180초) 실시간 카운트다운 타이머 UI (`03:00` -> `00:00`)
  - 유효시간 만료 시 에러 안내 및 '인증번호 재전송' 버튼 활성화
  - 단위 테스트 작성 및 통과

### 4. Phase 13-04: 전체 품질 무결성 검증 및 Phase 13 마일스톤 마무리
- [ ] 모노레포 전체 단위/통합 테스트 (Vitest & Jest 100% Pass)
- [ ] 전사 빌드(`pnpm build`) 및 린트(`pnpm lint`) 무결성 검증
- [ ] 하네스 2-File Rule 단일화 (`Phase13_sub_harness.md`)
- [ ] `CHANGELOG.md` 및 `README.md` 최종 동기화
