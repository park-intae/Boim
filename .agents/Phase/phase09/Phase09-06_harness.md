> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것

# Phase 09-06: 설정 패널 내 간이(Mock) 소셜 계정(카카오/네이버) 연동 구현

## 1. 백엔드 (Backend) - 간이 소셜 계정 연동 API
- [x] 백엔드 `AuthService`에 소셜 계정 연동 관리 메서드 구현 (실제 OAuth2 전환 가이드 주석 포함)
  - `getSocialLinkStatus(userId: string)`: 현재 계정의 카카오/네이버 연동 여부 반환
  - `mockLinkSocial(userId: string, provider: 'kakao' | 'naver')`: 간이 연동 처리 및 DB 갱신
  - `mockUnlinkSocial(userId: string, provider: 'kakao' | 'naver')`: 간이 연동 해제 처리 및 DB 갱신
- [x] 백엔드 `AuthController`에 엔드포인트 추가 (`@UseGuards(AuthGuard('jwt'))`)
  - `GET /auth/social/status`
  - `POST /auth/social/mock-link`
  - `POST /auth/social/mock-unlink`
- [x] 백엔드 단위 테스트(`auth.service.spec.ts`, `auth.controller.spec.ts`) 작성 및 통과 검증 (81개 테스트 전체 통과)
- [x] 백엔드 빌드 및 린트 검증 후 커밋

## 2. 프론트엔드 (Frontend) - 소셜 계정 연동 UI 구현
- [x] `SocialAccountsSettings.tsx` 컴포넌트 구현
  - 카카오/네이버 계정 연동 상태 카드(로고, 연동 상태 뱃지, 간이 연동하기/해제 버튼)
  - 380px 사이드 패널 맞춤형 반응형 레이아웃 (`min-w-0`, `shrink-0`, `truncate`, 여백 최적화)
  - 텍스트 깨짐 방지를 위한 공식 벡터 SVG 아이콘(`KakaoLogo`, `NaverLogo`) 적용
  - 실제 상용 OAuth2 연동 컴포넌트 삽입 및 API 교체를 위한 상세 가이드 주석 삽입
  - TanStack/Fetch 기반 실시간 상태 조회 및 연동/해제 처리
- [x] `SettingsPanel.tsx` 메뉴에 "소셜 계정 연동" 항목 추가 및 화면 전환 연동
- [x] 프론트엔드 단위 테스트(`SocialAccountsSettings.spec.tsx`) 작성 및 통과 검증 (실제 OAuth 테스트 전환 주석 포함)
- [x] 프론트엔드 빌드 및 린트 검증 후 커밋

## 3. 통합 검증 및 수동 테스트
- [x] 브라우저 환경에서 설정 ➔ 소셜 계정 연동 진입 후 카카오/네이버 간이 연동 및 해제 동작 검증
- [x] 하네스 업데이트 및 최종 커밋
