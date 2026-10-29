> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것

# Phase 09-05: 회원가입 플로우 구축 및 PASS 본인인증 DB 연동

## 1. 백엔드 (Backend) - 회원가입 API 및 PASS 인증 DB 반영
- [x] 백엔드 `AuthService`에 `register` 메서드 구현
  - 이메일 중복 체크 (`ConflictException`)
  - 비밀번호 `bcrypt.hash` 암호화 및 유저 DB 등록 (`provider: 'local'`, `isPassVerified: false`)
  - 가입 직후 자동 로그인을 위한 토큰 및 유저 프로필 반환
- [x] 백엔드 `AuthController`에 `@Post('register')` 엔드포인트 추가
- [x] `PassController` 및 `PassService`에 사용자 DB 연동
  - 인증 성공 시 JWT 토큰의 `userId`를 통해 DB `isPassVerified = true`, `passCi` 갱신
  - 응답 포맷 표준화 (이중 래핑 방지, 오류 시 예외 발생)
- [x] 백엔드 단위 테스트(`auth.service.spec.ts`, `auth.controller.spec.ts`, `pass.controller.spec.ts`) 작성 및 통과 검증
- [x] 백엔드 빌드 및 린트 검증 후 커밋

## 2. 프론트엔드 (Frontend) - 회원가입 UI 및 플로우 연동
- [x] `SignUp.tsx` 컴포넌트 구현
  - 이메일, 이름, 비밀번호, 비밀번호 확인 필드 및 zod 유효성 검증
  - 회원가입 성공 시 토큰 저장 후 본인인증 화면(`/pass-verify`)으로 자동 이동
- [x] `Login.tsx` 화면에 회원가입 페이지(`/signup`) 이동 링크 추가
- [x] `PassVerification.tsx` 컴포넌트 개선
  - 백엔드 응답 표준화 규격 대응 및 인증 성공 시 DB 반영 API 연동
  - 본인인증 완료 시 메인 대시보드(`/`)로 이동
  - "나중에 인증하기(건너뛰기)" 버튼 제공으로 미인증 상태 테스트 지원
- [x] `router/index.tsx`에 `/signup` 라우트 등록
- [x] 프론트엔드 단위 테스트(`SignUp.spec.tsx` 등) 작성 및 통과 검증
- [x] 프론트엔드 빌드 및 린트 검증 후 커밋

## 3. 통합 검증 및 시나리오 테스트 (수동 QA 완료)
- [x] 브라우저 환경에서 실제 신규 회원가입 ➔ PASS 본인인증 화면 전환 ➔ 인증 완료 ➔ 대시보드 진입 통합 검증
- [x] DB에서 신규 사용자의 `isPassVerified`가 `false`에서 `true`로 갱신되는지 확인
- [x] 최종 커밋 및 보고
