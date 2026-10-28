> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것

# Phase 09-02: 로그아웃(Logout) 기능 구현 및 세션 정리

## 1. 백엔드 (Backend) - 로그아웃 API 구현
- [x] 백엔드 `AuthService`에 `logout` 메서드 구현 (전달받은 userId의 DB refreshToken 제거)
- [x] 백엔드 `AuthController`에 `@Post('logout')` 엔드포인트 추가 (Authorization Bearer 토큰 검증 및 로그아웃 처리)
- [x] 백엔드 로그아웃 단위 테스트(`auth.service.spec.ts`, `auth.controller.spec.ts`) 작성 및 통과 검증
- [x] 백엔드 빌드(`pnpm --filter api build`) 및 린트(`pnpm --filter api lint`) 검증 후 커밋

## 2. 프론트엔드 (Frontend) - 스토어 초기화 및 공통 로그아웃 처리
- [x] `useAuthStore`의 `logout` 액션 검증 및 로컬 스토리지(`boim-auth-storage`) 상태 초기화
- [x] API 호출(`POST /auth/logout`), TanStack Query 캐시 초기화(`queryClient.clear()`), 로그인 화면(`/login`) 이동을 포함한 공통 로그아웃 로직 작성
- [x] `Login.tsx`의 로그인 성공 후 라우트 이동 경로 정상화 (`/dashboard` -> `/`)
- [x] 프론트엔드 인증 스토어/유틸 단위 테스트 작성 및 통과 검증 후 커밋

## 3. 프론트엔드 UI (Header & SettingsPanel) - 로그아웃 연동
- [x] `Header.tsx` 우측 상단 프로필 영역에 드롭다운 메뉴(내 정보, 설정, 로그아웃 버튼) UI 구현
- [x] `SettingsPanel.tsx` 기존 임시 `handleLogout`을 실제 공통 로그아웃 로직으로 연동
- [x] 프론트엔드 컴포넌트 단위 테스트 작성 및 통과 검증
- [x] 프론트엔드 빌드(`pnpm --filter web build`) 및 린트 검증 후 커밋

## 4. 최종 통합 검증
- [ ] 브라우저 환경에서 로그인 후 헤더 드롭다운 및 설정 패널 양쪽에서 로그아웃 정상 동작 확인
- [ ] 로그아웃 후 로컬 스토리지 토큰 삭제 및 보호된 페이지 접근 제어 검증
- [ ] 최종 완료 커밋 및 보고
