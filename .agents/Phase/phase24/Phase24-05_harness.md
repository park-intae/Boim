> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 시작 전 프론트엔드 작업은 @[.agents/FRONTEND_HARNESS.md]를 반드시 숙독하고 지침을 준수할 것

# Phase 24-05: 프론트엔드 Auth · 폼 · 캘린더(윤년/월말) · 핵심 컴포넌트 에러/경계값 테스트 보강

## 🎯 세부 목표
- 프론트엔드 인증 UI, 보험 입력 폼, 캘린더 날짜 계산(윤년/월말), 대시보드/설정 컴포넌트의 실패 및 경계값 UI 동작을 검증합니다.

## 📋 작업 체크리스트
- [x] **Auth UI (`Login.spec.tsx`, `SignUp.spec.tsx`, `PassVerification.spec.tsx`, `ReAuthModal.spec.tsx`, `OAuthCallbackPage.spec.tsx`, `ProtectedRoute.spec.tsx`)**
  - [x] 스키마 유효성 실패(이메일 형식, 8자 미만, 비밀번호 불일치), 서버 에러 reject 시 에러 UI/alert, `oauth_code` 교환 실패 및 유저/토큰 누락, `isAuthenticated && !accessToken` 리다이렉트 검증
- [x] **캘린더·폼 (`MainCalendar.test.tsx`, `DailyEventsView.spec.tsx`, `InsuranceForm.test.tsx`, `useInsuranceForm.spec.ts`, `PolicyDocumentUploader.test.tsx`)**
  - [x] `MainCalendar` / `DailyEventsView`: 윤년 2월(`2024-02-29`) vs 평년(`2025-02-28`), 월말(31일) 가입 상품 2월 렌더링 경계, 삭제 취소(`confirm === false`) 검증
  - [x] `InsuranceForm` / `useInsuranceForm`: 음수/`NaN`/필수값 누락 유효성 에러, `isPending` 비활성화, `handleParsedData` 카테고리 매핑 및 비객체 early return 검증
  - [x] `PolicyDocumentUploader`: 업로드/파싱/샘플 파싱 실패 시 `error` 상태 및 메시지 표시, 빈 드롭/비유효 결과 경계 검증
- [x] **대시보드·설정 UI (`AiDiagnosisReport.test.tsx`, `PremiumAnalysis.test.tsx`, `NotificationList.test.tsx`, `MyInsuranceList.test.tsx`, `SettingsPanel.spec.tsx`, `SocialAccountsSettings.spec.tsx`, `LoginHistorySettings.spec.tsx`)**
  - [x] `isError` 다시 시도 UI, 0원 빈 상태, 배치 실패 에러 배너, 삭제/탈퇴/연동해제 취소·실패 분기, 잘못된 백업 JSON 파싱 에러, `location: null` 폴백 검증
- [x] **검증 및 커밋:** `@boim/web` Vitest + Typecheck + oxlint 통과 확인 후 `(Phase 24-05)` 커밋
