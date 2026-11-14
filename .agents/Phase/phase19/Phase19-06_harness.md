> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 및 백엔드(@[.agents/BACKEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 19-06: 모바일 풀스택 기능 실연동 & 인터랙션 완성 (Real-world Mobile Features)

## 📌 목표 및 개요
단순 UI 껍데기(Mock/Stub) 수준에 머물러 있던 모바일 4대 탭의 기능들을 실제 NestJS 백엔드 REST API와 100% 실연동하고, 누락된 핵심 사용자 인터랙션(등록/수정/삭제, 월 이동 캘린더, 실시간 AI 진단, 알림 저장, 회원가입)을 정석으로 완성합니다.

---

## 📋 세부 단계별 체크리스트

### 1단계: 백엔드 보험 CRUD 실연동 & 상세/수정/삭제 모달 (Insurance CRUD & Detail Modal)
- [x] `apps/mobile/src/api/insuranceApi.ts` 구현:
  - `fetchInsurances()`: `GET /api/insurance-products`
  - `createInsurance(dto)`: `POST /api/insurance-products` (증권 OCR 스캔 후 실제 DB 영구 저장)
  - `updateInsurance(id, dto)`: `PATCH /api/insurance-products/:id`
  - `deleteInsurance(id)`: `DELETE /api/insurance-products/:id`
- [x] `InsuranceAddModal.tsx`에서 '내 보험으로 등록하기' 클릭 시 실제 `createInsurance` API 호출 및 DB 저장
- [x] `InsuranceDetailModal.tsx` 신규 구현:
  - 보험 카드 터치 시 상세 보장 내역 팝업 렌더링
  - 정보 수정(Edit) 및 휴지통 삭제(Delete) 확인 액션 연동
- [x] `InsuranceListScreen.tsx`에 카드 터치 상세 모달 및 실제 백엔드 데이터 패칭/갱신 결합

### 2단계: 캘린더 월 이동(`<`, `>`) & 날짜 자동 계산 + 일정 터치 상세 연동
- [x] `CalendarScreen.tsx` 상단에 이전 달(`<`) 및 다음 달(`>`) 이동 버튼 추가
- [x] 고정 30일 하드코딩 제거 ➔ 해당 년/월의 실제 일수(28/29/30/31일) 및 요일 시작점 동적 계산
- [x] 캘린더 일정 카드 터치 시 해당 보험 상세 보기 모달로 연결

### 3단계: Gemini AI 보장 진단 백엔드 실연동 (Real AI Diagnosis Engine)
- [x] `apps/mobile/src/api/analysisApi.ts` 구현:
  - `requestAiDiagnosis(token)`: `POST /api/analysis/ai-diagnosis` (실시간 Gemini AI 호출)
- [x] `DiagnosisScreen.tsx`에서 고정 Mock(85점) 제거 ➔ 백엔드 AI 진단 엔진 호출 및 분석 스피너 피드백 제공
- [x] 등록된 내 보험 데이터 변화에 따라 실시간으로 진단 점수 및 조언 카드 갱신

### 4단계: 마이페이지 PASS 본인인증 갱신 & 알림 설정 백엔드 영구 저장
- [x] `PassVerificationModal.tsx` 구현: 6자리 인증번호 타이머 및 인증 완료 플로우 연결
- [x] `MyPageScreen.tsx` 알림 토글(푸시, 카카오) 변경 시 `PATCH /api/users/notification-settings` 호출하여 백엔드 DB에 영구 반영

### 5단계: 모바일 회원가입 모달 (`SignUpModal.tsx`) 구현
- [x] 로그인 화면에서 [회원가입] 클릭 시 실제 계정 생성 폼 모달 렌더링
- [x] `POST /api/auth/register` 실제 백엔드 회원가입 및 즉시 로그인 전환

### 6단계: 무결성 검증 및 브리핑 후 커밋 승인
- [x] `pnpm --filter @boim/mobile typecheck` 0 에러 통과
- [x] 전사 단위/통합 테스트 (FE/BE) 무결성 통과 (BE 192개, FE 207개 100% Pass)
- [x] 학습용 구현 설명 브리핑 및 사용자 승인 하 커밋 진행
