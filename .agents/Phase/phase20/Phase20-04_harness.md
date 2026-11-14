> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것

# 📌 Phase 20-04: 실제 소셜 계정(카카오/네이버) 실시간 OAuth 연동 및 해제(Link/Unlink) 실 파이프라인 구축

## 🎯 목표
- `SocialAccountsSettings.tsx`에 임시 mock으로 남아있던 `mock-link`, `mock-unlink`를 완전히 제거하고, 실제 카카오 및 네이버 실계정 OAuth 연동/해제 파이프라인 구축
- 기존 등록된 OAuth Callback URL(`http://localhost/api/auth/kakao/callback`, `http://localhost/api/auth/naver/callback`)을 활용하여 카카오/네이버 개발자 콘솔의 Redirect URI 불일치(KOE006 등) 방지
- 백엔드 `state` 기반 유저 세션 바인딩(HMAC 서명 state: `link:${userId}:${timestamp}:${signature}`)을 통한 안전한 소셜 계정 연동 구현
- 소셜 계정 연동 해제(`POST /api/auth/kakao/unlink`, `POST /api/auth/naver/unlink`) 시 해당 플랫폼 정보 초기화 및 대표 본계정 자동 복구(`local`) 로직 완성
- 프론트엔드 및 백엔드 테스트 최신화 (100% 통과 보장)
- 도커 컨테이너 빌드 및 실 서비스 검증

---

## 📋 세부 체크리스트

### Task 1: 백엔드 실계정 OAuth 연동 인가 및 콜백 바인딩 구현
- [x] `SocialAuthService.generateLinkState(userId, provider)`:
  - 연동 모드 식별자(`link`)와 사용자 `userId`, 만료시간, HMAC-SHA256 서명을 포함한 보안 state 생성
- [x] `SocialAuthService.verifyLinkState(state)`:
  - 일반 로그인 state 및 `link` 연동 state 구분 검증 지원
- [x] `AuthController`:
  - `GET /api/auth/social/link/:provider`: 로그인된 사용자의 JWT 토큰을 기반으로 인가 URL 생성 및 카카오/네이버 인가 페이지로 302 리다이렉트
  - `GET /api/auth/kakao/callback` & `GET /api/auth/naver/callback`:
    - `state`가 `link` 연동 모드인 경우: 현재 로그인 유저에게 소셜 프로필 바인딩(`processSocialUser(profile, targetUserId)`) 후 프론트엔드 설정 페이지(`/dashboard?tab=settings&social_link_success=:provider`)로 안전하게 302 리다이렉트
    - 일반 로그인인 경우: 기존대로 JWT 발급 후 `/auth/callback?token=...` 리다이렉트
- [x] `SocialAuthService.unlinkSocialAccount`:
  - 연동 해제 시 `kakaoNickname`, `kakaoProfileImage`, `kakaoEmail` (네이버는 `naver...`) 필드를 `null`로 초기화
  - 만약 해제되는 provider가 `primaryAccountProvider`인 경우 `local`로 자동 복구

### Task 2: 프론트엔드 `SocialAccountsSettings.tsx` 실제 연동/해제 연계
- [x] "연동하기" 버튼 클릭 시:
  - 더 이상 `mock-link` alert나 mock API 호출을 하지 않고, 백엔드 연동 엔드포인트(`${apiBaseUrl}/auth/social/link/${provider}?token=${accessToken}`)로 이동하여 실제 카카오/네이버 로그인 및 동의창 호출
- [x] "해제" 버튼 클릭 시:
  - 실제 백엔드 연동 해제 API (`POST /api/auth/${provider}/unlink`) 호출
  - 성공 후 연동 상태 최신화 및 안내 메시지 제공
- [x] 대시보드 복귀 시:
  - URL 쿼리 파라미터(`social_link_success`, `social_link_error`) 감지하여 연동 성공/실패 토스트 및 연동 상태 최신화

### Task 3: 단위 및 통합 테스트 검증
- [x] 백엔드 `social-auth.service.spec.ts` & `auth.controller.spec.ts` 테스트 추가 및 통과
- [x] 프론트엔드 `SocialAccountsSettings.spec.tsx` 테스트 최신화 및 통과
- [x] 전사 테스트 실행: `pnpm --filter @boim/api test` (205/205 통과) & `pnpm --filter @boim/web test run` (210/210 통과)

### Task 4: 도커 빌드 및 실 환경 배포 검증
- [x] `docker compose up -d --build --no-deps api web` 무중단 컨테이너 갱신 완료
- [x] 컨테이너 헬스체크 및 실계정 연동 흐름 302 리다이렉트 검증 완료
