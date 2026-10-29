> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것

# Phase 09-06: 설정 패널 내 간이(Mock) 소셜 계정(카카오/네이버) 연동 구현

## 1. 백엔드 (Backend) - 간이 소셜 계정 연동 API
- [x] 백엔드 `AuthService`에 소셜 계정 연동 관리 메서드 구현
  - `getSocialLinkStatus(userId: string)`: 현재 계정의 카카오/네이버 연동 여부 반환
  - `mockLinkSocial(userId: string, provider: 'kakao' | 'naver')`: 간이 연동 처리 및 DB 갱신
  - `mockUnlinkSocial(userId: string, provider: 'kakao' | 'naver')`: 간이 연동 해제 처리 및 DB 갱신
- [x] 백엔드 `AuthController`에 엔드포인트 추가 (`@UseGuards(AuthGuard('jwt'))`)
  - `GET /auth/social/status`
  - `POST /auth/social/mock-link`
  - `POST /auth/social/mock-unlink`
- [x] 백엔드 단위 테스트(`auth.service.spec.ts`, `auth.controller.spec.ts`) 작성 및 통과 검증
- [x] 백엔드 빌드 및 린트 검증 후 커밋

## 2. 프론트엔드 (Frontend) - 소셜 계정 연동 UI 구현
- [ ] `SocialAccountsSettings.tsx` 컴포넌트 구현
  - 카카오/네이버 계정 연동 상태 카드(로고, 연동 상태 뱃지, 연동하기/해제 버튼)
  - 간이 연동 시 시뮬레이션 안내 및 확인 창
  - TanStack Query를 활용한 실시간 상태 조회 및 뮤테이션 연동
- [ ] `SettingsPanel.tsx` 메뉴에 "소셜 계정 연동" 항목 추가 및 화면 전환 연동
- [ ] 프론트엔드 단위 테스트(`SocialAccountsSettings.spec.tsx`) 작성 및 통과 검증
- [ ] 프론트엔드 빌드 및 린트 검증 후 커밋

## 3. 통합 검증 및 수동 테스트
- [ ] 브라우저 환경에서 설정 ➔ 소셜 계정 연동 진입 후 카카오/네이버 간이 연동 및 해제 동작 검증
- [ ] 하네스 업데이트 및 최종 커밋
