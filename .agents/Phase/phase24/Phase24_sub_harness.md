> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 시작 전 백엔드 작업은 @[.agents/BACKEND_HARNESS.md], 프론트엔드 작업은 @[.agents/FRONTEND_HARNESS.md]를 반드시 숙독하고 지침을 준수할 것

# Phase 24 Sub-Harness: 전사 핵심 로직 실패·예외·경계값 시나리오 테스트 보강

---

## Phase 24-01: 백엔드 Auth · User · Common 실패·경계값 테스트 보강
- [x] **Auth 도메인 (`auth.service.spec.ts`, `auth.controller.spec.ts`, `social-auth.service.spec.ts`, `pass.service.spec.ts`, `kakao.strategy.spec.ts`, `naver.strategy.spec.ts`)**
  - [x] `AuthService`: `register` 중복 이메일(`ConflictException`), `login` 소셜 전용 계정·비밀번호 불일치·공백 비밀번호(`'   '`)·`rememberMe: false`, `reauthenticate` 미존재 유저·비밀번호 미설정 계정, `logout` DB/BigInt 예외 흡수 검증
  - [x] `AuthController`: `initiateSocialLink` 미지원 provider(`BadRequestException`)·토큰 누락/무효(`UnauthorizedException`), `mockLinkSocial`/`mockUnlinkSocial` 프로덕션 `ForbiddenException`, `logout` 무효 헤더, 콜백 `isLinked: true` 리다이렉트 검증
  - [x] `SocialAuthService`: `consumeOAuthExchangeCode` 빈 코드·만료 TTL, `exchangeKakaoCode`/`exchangeNaverCode` 프로덕션 미설정·`fetch` 실패·CSRF state 차단, `verifyOAuthState`/`verifyLinkState` 10분/미래 경계, `unlinkSocialAccount`·`setPrimaryAccount` 예외 검증
  - [x] `PassService`: 9자리 vs 10자리 길이 경계, 쿨다운 경과 후 재요청 성공, 프로덕션 슈퍼코드(`000000`, `123456`) 거부, `expiresAt` 경계, DB 갱신 오류 흡수 검증
  - [x] `KakaoStrategy` / `NaverStrategy`: `processSocialUser` 실패 시 `done(error, false)`, `http://`→`https://` 승격, `linkVerification.provider` 불일치 검증
- [x] **User & Common 도메인 (`user.service.spec.ts`, `user.controller.spec.ts`, `http-exception.filter.spec.ts`, `env.validation.spec.ts`)**
  - [x] `UserService`: `updatePassword` 7자 실패 vs 8자 성공 경계·탈퇴 계정 `NotFoundException`, `importData` `null`/비객체/잘못된 날짜/음수·`Infinity` 금액·정상 `createMany`, `softDeleteUser` 인자 검증, `getLoginHistory` `count` 0/양수 분기
  - [x] `UserController`: 전체 보호 엔드포인트 `req.user` 누락 시 `UnauthorizedException` 검증
  - [x] `HttpExceptionFilter`: 배열형 `message` 포맷팅(`join(', ')`) 및 프로덕션 로그 분기 검증
  - [x] `env.validation.spec.ts` 신설: 프로덕션 `JWT_SECRET` 미설정/알려진 기본값/16자 미만·`DATABASE_URL` 누락 시 예외 검증
- [x] **검증 및 커밋:** `@boim/api` ESLint + Jest 전체 Pass 확인 후 `(Phase 24-01)` 커밋 (`7fa8c6d`)

---

## Phase 24-02: 백엔드 InsuranceProduct · Document · Parser 실패·경계값 테스트 보강
- [x] **InsuranceProduct 도메인 (`insurance-product.service.spec.ts`, `insurance-product.controller.spec.ts`)**
  - [x] `create`/`update`: 필수 문자열 공백 입력(`BadRequestException`), `maturityDate < startDate` 역전 및 단일 필드 수정 시 역전, `startDate === maturityDate` 경계, `0`원/`NaN`/`Infinity` 금액 경계, `update`/`remove` 미존재 ID `NotFoundException`, `dto.userId` 스푸핑 무시 검증
  - [x] `InsuranceProductController`: `create`/`findOne`/`update`/`remove` `req.user` 누락 시 `UnauthorizedException` 검증
- [x] **Document & Parser 도메인 (`document.service.spec.ts`, `document.controller.spec.ts`, `document-parser.service.spec.ts`)**
  - [x] `DocumentService`: `uploadDocument` 파일 크기 초과·`productId` 미존재(`NotFoundException`), `getDocument`/`deleteDocument`/`parseDocument` 미존재(`NotFoundException`) 및 타인 접근(`ForbiddenException`), `getUserDocuments` 빈 목록, `parseSampleDocument` 샘플 파일 미존재 폴백 검증
  - [x] `DocumentController`: `getDocument` 테스트 및 인증 엔드포인트 `req.user` 누락 시 `UnauthorizedException` 검증
  - [x] `DocumentParserService`: `extractTextFromFile` 파일 미존재·`.txt` 읽기·OCR 호출·`ocrImage` 실패 시 `BadRequestException` 및 `worker.terminate()` 보장, `parseInsuranceText` 빈 텍스트/미분류 카테고리/단일 날짜(+10년)/범위 밖 `paymentDay`(0, 32일)/금액 경계(`5,000~3,000,000`, 억·천만 단위) 검증
- [x] **검증 및 커밋:** `@boim/api` ESLint + Jest 전체 Pass 확인 후 `(Phase 24-02)` 커밋 (`df20865`)

---

## Phase 24-03: 백엔드 Notification · RuleEvaluator · Analysis 실패·경계값 테스트 보강
- [x] **Notification & Scheduler (`notification.service.spec.ts`, `notification.controller.spec.ts`, `notification-rule.evaluator.spec.ts`, `notification-scheduler.service.spec.ts`, `email.service.spec.ts`)**
  - [x] `NotificationService` / `NotificationController`: 빈 목록, 타인 알림/미존재 `NotFoundException`, 보호 엔드포인트 `req.user` 누락 `UnauthorizedException`
  - [x] `NotificationRuleEvaluator`: 윤년/평년 2월 말일(28/29일)·30일 월말 납입일 보정, 12월→익년 1월 연도 이월, 야간 방해금지 `22:00`~`08:00` 정각 경계(`21:59`, `22:00`, `08:00`, `08:01`), 주간 방해금지, `determineChannel` 우선순위(`kakao > push > email > in_app`) 검증
  - [x] `NotificationSchedulerService`: 500건 초과 청크 페이징, `channel === 'in_app'` 외부 미발송, `userEmail === null` 폴백, 미지원 채널 경고 처리 검증
  - [x] `EmailService`: `sendMail` 실패 예외 전파, `NODE_ENV === 'test'` `jsonTransport`, Ethereal 실패 폴백 검증
- [x] **Analysis 도메인 (`rule-based-diagnosis.engine.spec.ts`, `ai-diagnosis.service.spec.ts`, `analysis.controller.spec.ts`, `export.service.spec.ts`)**
  - [x] `RuleBasedDiagnosisEngine`: 0원/음수/`null` 금액, 미분류 카테고리(`'기타'`), `cancerAmount`·`totalMonthlyPayment` 경계값, 점수 클램핑(20~95), `scoreToGrade`/`validateGrade` 경계값 검증
  - [x] `AiDiagnosisService`: `response.text` 빈 문자열 폴백, 마크다운 코드블록·비정상 JSON 타입 보정, 전체 모델 실패 시 규칙 기반 폴백, 5분 `diagnosisCache` 히트 및 `forceRefresh: true` 갱신 검증
  - [x] `AnalysisController` / `ExportService`: `getDiagnosis`/`exportExcel` 미인증 `UnauthorizedException`, `\t`/`\r` 수식 이스케이프 및 `totalPayment === 0` 비중 `0` 계산 검증
- [x] **검증 및 커밋:** `@boim/api` ESLint + Jest 전체 Pass 확인 후 `(Phase 24-03)` 커밋 (`f1e3de4`)

---

## Phase 24-04: 프론트엔드 API 훅 & `apiClient` 실패·롤백·데모 분기 테스트 보강
- [x] `apps/web/src/api/client.spec.ts`: `isDemoSession() === true`일 때 401 응답 시 `logout()` 미호출, 500 에러 시 `logout()` 미호출 검증
- [x] `apps/web/src/api/useInsuranceQueries.spec.ts`: 생성/수정/삭제 `success: false`, `data` 누락, 네트워크/500 에러 reject, 데모 세션 분기 검증
- [x] `apps/web/src/api/useNotificationQueries.spec.ts`: 조회/읽음/삭제/배치 네트워크 에러 reject, `data` `undefined` 시 `[]` 폴백, 데모 세션 분기 검증
- [x] `apps/web/src/api/useDocumentQueries.spec.ts`: 업로드/파싱/샘플 파싱 API 실패 reject, `productId` 미전달 빈 params, `unwrapResponse` 중첩 경계값 검증
- [x] `apps/web/src/api/useUserQueries.spec.ts`: **`useUpdateNotificationSettings` 실패 시 `onError` Optimistic Update 캐시 롤백**, 전체 훅 `success: false`/reject/데모 분기 검증
- [x] `apps/web/src/api/useDiagnosisQueries.spec.ts`: 진단 조회/생성 API 실패 reject, `useExportExcel` `fetch` reject·`blob()` 실패·토큰 `null` 헤더 미전송 검증
- [x] **검증 및 커밋:** `@boim/web` Vitest + Typecheck + oxlint 통과 확인 후 `(Phase 24-04)` 커밋 (`9e99b92`)

---

## Phase 24-05: 프론트엔드 Auth · 폼 · 캘린더(윤년/월말) · 핵심 컴포넌트 에러/경계값 테스트 보강
- [x] **Auth UI (`Login.spec.tsx`, `SignUp.spec.tsx`, `PassVerification.spec.tsx`, `ReAuthModal.spec.tsx`, `OAuthCallbackPage.spec.tsx`, `ProtectedRoute.spec.tsx`)**
  - [x] 스키마 유효성 실패(이메일 형식, 8자 미만, 비밀번호 불일치), 서버 에러 reject 시 에러 UI/alert, `oauth_code` 교환 실패 검증
- [x] **캘린더·폼 (`MainCalendar.test.tsx`, `DailyEventsView.spec.tsx`, `InsuranceForm.test.tsx`, `useInsuranceForm.spec.ts`, `PolicyDocumentUploader.test.tsx`)**
  - [x] `MainCalendar` / `DailyEventsView`: 윤년 2월(`2024-02-29`) vs 평년(`2025-02`), 월말(31일) 가입 상품 2월 렌더링 경계, 삭제 취소(`confirm === false`) 및 `undefined` 안전 렌더링 검증
  - [x] `InsuranceForm` / `useInsuranceForm`: 필수값 누락 시 미호출, `isPending` 비활성화, 미존재 `editingProductId` 방어 검증
  - [x] `PolicyDocumentUploader`: 업로드/파싱/샘플 파싱 실패 시 `error` 상태 및 메시지 표시 검증
- [x] **대시보드·설정 UI (`AiDiagnosisReport.test.tsx`, `PremiumAnalysis.test.tsx`, `NotificationList.test.tsx`, `MyInsuranceList.test.tsx`, `SettingsPanel.spec.tsx`, `SocialAccountsSettings.spec.tsx`, `LoginHistorySettings.spec.tsx`)**
  - [x] `isError` 다시 시도 UI, 0원 빈 상태(`NaN%` 방어), 배치 실패 에러 배너, 탈퇴 취소·실패 분기, `social_link_error` 파라미터, `location: null` 폴백 검증
- [x] **검증 및 커밋:** `@boim/web` Vitest + Typecheck + oxlint 통과 확인 후 `(Phase 24-05)` 커밋 (`11741c4`)

---

## Phase 24-06: 프론트엔드 Utils · ErrorBoundary · 전사 검증 및 문서 동기화
- [x] `apps/web/src/components/common/RouteErrorBoundary.spec.tsx` 신설: 일반 에러 Fallback UI + 새로고침 버튼, `ChunkLoadError` 시 `sessionStorage('boim_chunk_retry')` 10초 이내 리로드 무한 루프 방지 검증
- [x] `apps/web/src/test/webNotification.test.ts`: 미지원 환경(`'Notification' in window === false`), `requestPermission()` reject, `new Notification` 생성자 throw 예외 검증
- [x] `apps/web/src/features/auth/utils/demoFallback.spec.ts`: 빈/undefined 이메일, 토큰 기반 데모 세션 판별, `resetDemoFallbackState` 복원 검증
- [x] `apps/web/src/features/auth/store/authStore.spec.ts`: `setPassVerified(true)` null 유저/인증 유저 분기, `rememberMe` 전환 시 스토리지 마이그레이션 검증
- [x] **하네스 정리 & 문서화:** `Phase24-01~06` → `Phase24_sub_harness.md` 2-File Rule 통합, `Phase_harness.md`, `CHANGELOG.md`, `README.md` 업데이트
- [x] **전사 최종 검증:** `@boim/api` (29 Suites / 256 Tests) & `@boim/web` (50 Files / 269 Tests) 전체 통과 확인 후 `(Phase 24-06)` 커밋
