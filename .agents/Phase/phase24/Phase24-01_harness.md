> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 시작 전 백엔드 작업은 @[.agents/BACKEND_HARNESS.md]를 반드시 숙독하고 지침을 준수할 것

# Phase 24-01: 백엔드 Auth · User · Common 실패·경계값 테스트 보강

## 🎯 세부 목표
- Auth, User, Common 영역에서 아직 테스트되지 않은 인증 실패, 소셜 OAuth 예외, PASS 경계값, 비밀번호/백업 복원 예외, 환경변수 부트스트랩 실패 케이스를 전수 검증합니다.

## 📋 작업 체크리스트
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
- [x] **검증 및 커밋:** `@boim/api` ESLint + Jest 전체 Pass 확인 후 `(Phase 24-01)` 커밋
