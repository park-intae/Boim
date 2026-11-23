> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 시작 전 백엔드 작업은 @[.agents/BACKEND_HARNESS.md], 프론트엔드 작업은 @[.agents/FRONTEND_HARNESS.md]를 반드시 숙독하고 지침을 준수할 것

# Phase 23: 전사 보안·인증 무결성 강화 및 치명적 결함 수정 (Security Hardening & Critical Bug Fixes)

## 🎯 목표
1. **인증·인가 전면 정상화:** 미인증 폴백(`OptionalJwtAuthGuard`) 및 무인증 컨트롤러(`InsuranceProductController`)를 제거하고, 모든 사용자 데이터 API에 엄격한 JWT 인증과 Row-level 소유권 검증을 적용합니다.
2. **인증 우회 및 시크릿 노출 차단:** 비밀번호 없는 로그인 우회, OAuth State/Mock 우회, 하드코딩 시크릿 폴백, URL 쿼리 토큰 노출, 민감 필드 노출(`exportData`, 로그)을 제거합니다.
3. **비즈니스 로직 및 연동 버그 수정:** KST/UTC 자정 불일치로 인한 알림 중복 발송, 미구현 스텁(`updatePassword`, `importData`), `ValidationPipe` 부재, OCR 폴백 오인, 프론트엔드 엑셀 다운로드 토큰 누락 및 API 응답 규격 불일치를 해결합니다.
4. **인프라/운영 안정화:** Docker 업로드 볼륨 영속화, 컨테이너 마이그레이션 적용, CORS 제한, 인메모리 세션 누수 방지를 적용합니다.

---

## 📋 작업 체크리스트

### 1. Phase 23-01: 백엔드 인증/인가 가드 및 Row-level 소유권 검증 (Critical)
- [x] **`InsuranceProductController` & `InsuranceProductService` 인증/소유권 강제** (`apps/api/src/insurance-product/`)
  - [x] 컨트롤러에 `@UseGuards(AuthGuard('jwt'))` 적용
  - [x] `create()`에서 DTO의 `userId` 신뢰를 제거하고 `req.user.userId` 기반으로 저장
  - [x] `findAll()`에 `where: { userId }` 필터 적용하여 본인 보험 상품만 조회
  - [x] `findOne()`, `update()`, `remove()`에서 소유권(`product.userId === userId`) 검증 및 타인 접근 시 `ForbiddenException` 반환
- [x] **`OptionalJwtAuthGuard` 제거 및 `AuthGuard('jwt')` 전환**
  - [x] `UserController` (`apps/api/src/user/user.controller.ts`): `@UseGuards(AuthGuard('jwt'))`로 전환, `extractUserId` 폴백(`'1'`) 제거
  - [x] `DocumentController` (`apps/api/src/document/document.controller.ts`): 업로드·파싱·목록·상세·삭제 엔드포인트에 `AuthGuard('jwt')` 적용 (공개 샘플 엔드포인트는 명시적 분리)
  - [x] `AnalysisController` (`apps/api/src/analysis/analysis.controller.ts`): `@UseGuards(AuthGuard('jwt'))` 전환 및 `'1'` 폴백 제거
  - [x] `NotificationController` (`apps/api/src/notification/notification.controller.ts`): `@UseGuards(AuthGuard('jwt'))` 전환, `createNotification`의 임의 `dto.userId` 지정 차단, `trigger-batch`는 관리자/내부 시크릿 헤더 또는 환경 가드로 보호
  - [x] `optional-jwt-auth.guard.ts` 제거 또는 테스트 전용 가드로 격리
- [x] **보안 단위/통합 테스트 작성 및 검증**
  - [x] 미인증(토큰 없음/만료/위조) 요청 시 `401 Unauthorized` 반환 검증
  - [x] 타인 리소스(보험 상품, 문서, 알림) 접근 시 `403 Forbidden` 또는 `404 Not Found` 반환 검증

### 2. Phase 23-02: 로그인·OAuth·PASS 인증 취약점 및 시크릿 관리 수정 (Critical)
- [ ] **`AuthService.login` 비밀번호 검증 우회 차단** (`apps/api/src/auth/auth.service.ts`)
  - [ ] `password` 필수 입력 검증 (`!password`일 경우 즉시 `UnauthorizedException` 발생)
  - [ ] 소셜 전용 계정(`!user.password`)은 일반 로그인 차단
  - [ ] 탈퇴 회원(`user.deletedAt !== null`) 로그인 차단
- [ ] **OAuth2 / Mock 인증 프로덕션 격리** (`apps/api/src/auth/`)
  - [ ] `SocialAuthService.verifyOAuthState`: `test_`, `random_`, `mock_state` 허용 로직을 `NODE_ENV !== 'production'` 조건으로 엄격 제한
  - [ ] `exchangeKakaoCode` / `exchangeNaverCode`: 프로덕션 환경에서 `CLIENT_ID` 미설정 시 모의 토큰 발급 대신 `InternalServerErrorException` 또는 `UnauthorizedException` 발생
  - [ ] `AuthController`: `social/mock-link`, `social/mock-unlink` 엔드포인트를 비프로덕션 환경으로 제한
  - [ ] 이메일 자동 소셜 연동 시 소셜 제공자의 이메일 검증 여부 확인 및 충돌 정책 강화
  - [ ] OAuth 콜백 리다이렉트 시 URL 쿼리 평문 토큰 전달 대신 일회용 인가 코드(Authorization Code) 교환 방식 또는 단기 교환 토큰으로 전환 검토·적용
- [ ] **JWT 시크릿 및 환경변수 부트스트랩 검증**
  - [ ] `JwtStrategy`, `AuthModule`, `SocialAuthService`의 하드코딩된 시크릿 폴백을 제거하고, 프로덕션 환경에서 `JWT_SECRET` 미설정 시 서버 부트스트랩 실패 처리 (`Zod` 기반 환경변수 스키마 검증 도입)
- [ ] **PASS 인증 보안 및 로깅 마스킹** (`apps/api/src/auth/pass.service.ts`)
  - [ ] 로그에 평문 휴대폰 번호 및 6자리 인증번호(`authCode`) 출력 제거/마스킹
  - [ ] `lastRequestByPhone` 맵 만료 항목 자동 정리(`cleanupExpiredSessions`에 포함)로 메모리 누수 방지
  - [ ] `passCi` 생성 시 동일 번호에 대해 일관된 해시 기반 식별자 생성(중복 가입 방지 가능하도록 개선)
- [ ] **인증 보안 테스트 작성 및 검증**

### 3. Phase 23-03: 백엔드 데이터 무결성·스텁 구현·입력 검증 보강 (High)
- [ ] **전역 `ValidationPipe` 및 DTO 유효성 검증 도입** (`apps/api/src/main.ts`, 각 DTO)
  - [ ] `app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))` 활성화
  - [ ] `CreateInsuranceProductDto`, `UpdateInsuranceProductDto`, 로그인/회원가입/비밀번호 변경 DTO에 `class-validator` 데코레이터 적용
  - [ ] `HttpExceptionFilter`에서 `ValidationPipe` 배열 에러 메시지 포맷팅 지원 및 프로덕션 스택/예외 원문 로깅 마스킹
  - [ ] `BigInt` 직렬화 시 `MAX_SAFE_INTEGER` 초과 값은 문자열로 안전 직렬화 검토
- [ ] **미구현 스텁 API 실제 구현** (`apps/api/src/user/user.service.ts`)
  - [ ] `updatePassword`: 현재 비밀번호 확인 또는 재인증 검증 후 `bcrypt.hash`로 실제 DB `password` 업데이트
  - [ ] `importData`: `Zod` 스키마로 업로드 JSON 검증 후 트랜잭션 내 사용자 보험 데이터 안전 복원 (또는 미지원 시 명확히 `NotImplementedException` 처리)
  - [ ] `exportData`: `select`를 명시하여 `password`, `refreshToken`, `passCi` 등 민감 컬럼 완전 제외
- [ ] **문서 업로드·파싱·엑셀 보안 및 정확도 개선**
  - [ ] `DocumentService.uploadDocument`: 확장자 화이트리스트 검증 및 `productId` 소유권 검증 추가
  - [ ] `DocumentParserService`: OCR/텍스트 추출 실패 시 가짜 샘플 데이터를 `confidence: 0.99`로 반환하지 않고 명확한 파싱 실패 에러 또는 `isFallback: true` + `confidence: 0` 반환
  - [ ] `ExportService`: 엑셀 셀 문자열(`=`, `+`, `-`, `@` 시작) Formula Injection 이스케이프 처리
- [ ] **AI 진단 비용/Rate Limit 보호** (`apps/api/src/analysis/`)
  - [ ] `GET /analysis/ai-diagnosis`에 사용자별 단기 캐시(예: 5분~1시간 TTL 또는 보험 변경 시 무효화) 적용하여 불필요한 Gemini API 중복 호출 방지

### 4. Phase 23-04: 알림 스케줄러 KST 자정 불일치 버그 수정 (High)
- [ ] **`NotificationSchedulerService.runBatch` 날짜 경계 수정** (`apps/api/src/notification/notification-scheduler.service.ts`)
  - [ ] `startOfDay` / `endOfDay`를 UTC 자정이 아닌 **실제 KST 자정(`Date.UTC(year, month - 1, day, 0, 0, 0) - 9 * 60 * 60 * 1000`)** 기준으로 계산하여 크론(KST 00:00)과 낮 수동 실행 간 중복 방지 조건 일치
  - [ ] 조회 대상에서 탈퇴 회원(`user: { deletedAt: null }`) 필터링
  - [ ] 대용량 대비 배치 커서/청크(`take`/`skip`) 조회 도입
- [ ] **`NotificationRuleEvaluator` 월말 일수 계산 보정** (`apps/api/src/notification/notification-rule.evaluator.ts`)
  - [ ] `new Date(currentYear, currentMonth, 0)` 대신 `new Date(Date.UTC(currentYear, currentMonth, 0)).getUTCDate()` 사용하여 서버 로컬 타임존 의존성 제거
- [ ] **크론 자정 + 낮 재실행 시나리오 단위 테스트 작성 및 검증**

### 5. Phase 23-05: 프론트엔드 API 연동 규격 통일 및 401/엑셀 버그 수정 (High)
- [ ] **API 응답 포맷 단일화**
  - [ ] `UserController`의 이중 래핑(`{ success: true, data: ... }`) 제거하여 `TransformInterceptor` 단일 포맷으로 통일
  - [ ] 프론트엔드 훅(`useUserQueries.ts`, `useNotificationQueries.ts`, `useDocumentQueries.ts`, `useDiagnosisQueries.ts`, `OAuthCallbackPage.tsx`)의 응답 파싱을 일관된 단일 규격으로 정리
- [ ] **엑셀 다운로드 인증 토큰 버그 수정** (`apps/web/src/api/useDiagnosisQueries.ts`)
  - [ ] 존재하지 않는 `boim_access_token` 키 조회를 제거하고 `useAuthStore.getState().accessToken`을 사용하도록 수정 (또는 `apiClient` `responseType: 'blob'` 활용)
- [ ] **`useCreateInsurance` 하드코딩 `userId: 1` 제거** (`apps/web/src/api/useInsuranceQueries.ts`)
- [ ] **`apiClient` 전역 401 응답 인터셉터 추가** (`apps/web/src/api/client.ts`)
  - [ ] 서버에서 `401 Unauthorized` 반환 시 `useAuthStore.getState().logout()` 호출 및 로그인 페이지 유도
- [ ] **프론트엔드 관련 단위/통합 테스트 업데이트 및 검증**

### 6. Phase 23-06: 인프라·운영 보안 설정 및 전체 품질 무결성 검증 (Medium)
- [ ] **Docker & CORS 운영 보안 강화**
  - [ ] `docker-compose.yml`: `api` 서비스에 업로드 파일 영속 볼륨(`boim_uploads:/app/apps/api/uploads`) 추가 및 `JWT_SECRET` 기본값 폴백 제거(필수 환경변수 `${JWT_SECRET:?...}`)
  - [ ] `apps/api/Dockerfile`: 기동 시 `prisma migrate deploy` 실행 후 서버 시작하도록 `CMD` 개선
  - [ ] `apps/api/src/main.ts`: `app.enableCors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true })`로 출처 제한
- [ ] **전사 검증, 에러로그 및 문서 동기화**
  - [ ] `apps/api` 단위/E2E 테스트 전체 Pass 확인
  - [ ] `apps/web` Vitest 전체 Pass 확인
  - [ ] 전 워크스페이스 `tsc --noEmit` 및 `lint` 통과 확인
  - [ ] Docker 이미지 빌드 및 컨테이너 기동 검증 (`docker compose build` / `up` 또는 설정 검증)
  - [ ] 작업 중 발생한 오류·수정 내역 `.agents/errorlog.md` 기록
  - [ ] `.agents/Phase/Phase_harness.md`, `CHANGELOG.md`, `README.md` 업데이트 후 완료 커밋

---

> **진행 규칙:** 각 서브 Phase(`Phase 23-01` ~ `Phase 23-06`) 완료 시 테스트 통과 확인 → 본 하네스 `- [x]` 체크 → `Conventional Commits` + `(Phase 23-XX)` 태그로 즉시 커밋한다.
