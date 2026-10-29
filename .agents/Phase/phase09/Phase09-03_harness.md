> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것

# Phase 09-03: 세션 스토리지 기반 인증 유지 및 라우트 보호(ProtectedRoute)

## 1. 인증 스토어 스토리지 개선 (authStore.ts)
- [x] `localStorage`와 `sessionStorage`를 동적으로 스위칭하는 하이브리드 스토리지 어댑터 구현
  - `rememberMe === true`: `localStorage`에 영구 보관 (브라우저 종료 후 재접속 시에도 유지)
  - `rememberMe === false`: `sessionStorage`에 임시 보관 (새로고침 시 유지, 브라우저 탭 종료 시 자동 파기)
- [x] 로그아웃(`logout`) 시 `localStorage` 및 `sessionStorage` 양쪽 모두 초기화 보장
- [x] `authStore` 스토리지 스위칭 동작 단위 테스트 작성 및 통과 확인

## 2. 라우트 보호 가드 구현 (ProtectedRoute)
- [x] `ProtectedRoute.tsx` 컴포넌트 생성 (`isAuthenticated` 및 `accessToken` 존재 여부 검사 후 비인가 시 `/login` 리다이렉트)
- [x] `router/index.tsx`에 `ProtectedRoute` 적용 (메인 `/` 및 하위 페이지 보호)
- [x] `ProtectedRoute.spec.tsx` 단위 테스트 작성 및 통과 확인

## 3. 통합 검증 및 커밋
- [x] 프론트엔드 전체 단위 테스트(`pnpm --filter web exec vitest run`) 통과 검증 (16개 스위트, 47개 테스트 통과)
- [x] 린트(`pnpm --filter web lint`) 및 타입 검사 확인
- [x] 작업 완료 하네스 업데이트 및 Git 커밋
