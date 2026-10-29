> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것

# Phase 09-04: 로그인 응답 사용자 프로필(name, isPassVerified) DB 동기화

## 1. 백엔드 (Backend) - 로그인 API 응답 확장
- [x] `AuthService.login` 응답 페이로드에 DB의 `user` 프로필 정보(`id`, `email`, `name`, `isPassVerified`) 추가
- [x] 백엔드 단위 테스트(`auth.service.spec.ts`, `auth.controller.spec.ts`) 업데이트 및 검증

## 2. 프론트엔드 (Frontend) - 실제 유저 정보 스토어 연동
- [x] `Login.tsx`에서 백엔드 응답의 `user` 객체를 `useAuthStore.login(user, token)`에 주입하도록 개선
- [x] `user` 정보 누락 시 안전한 fallback 처리 (이메일 기반 기본 이름 등)
- [x] `Login.spec.tsx` 단위 테스트 동기화 및 검증

## 3. 통합 검증 및 커밋
- [x] 백엔드 단위 테스트(`pnpm --filter api test`) 통과 검증 (16개 스위트, 72개 테스트 통과)
- [x] 프론트엔드 단위 테스트(`pnpm --filter web exec vitest run`) 통과 검증 (16개 스위트, 47개 테스트 통과)
- [x] 하네스 업데이트 및 Git 커밋
