> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 21-01: Auth & 소셜 콜백 잔여 임시/더미 코드 정리 및 에러 핸들링 고도화

## 📌 작업 개요
`OAuthCallbackPage.tsx` 및 `Login.tsx` 등 프론트엔드 인증 플로우 전반에 남아있는 레거시 더미 데이터(`social_user`, `social@boim.internal`, `'mock_state'`, `'user_id'`, `temp_token` 등)를 완전히 제거하고, 실제 프로필 조회 실패나 토큰 누락 시 사용자에게 친절한 에러 안내 및 안전한 재시도를 유도하도록 인증 무결성을 확립합니다.

---

## 📋 세부 체크리스트

### 1. `OAuthCallbackPage.tsx` 리팩토링 및 더미 제거
- [x] 토큰 파라미터 수신 시 로컬스토리지 임시 잔류 키(`temp_token`) 설정 제거
- [x] 프로필 조회(`/users/me`) 실패 시 더미 계정(`social_user`, `social@boim.internal`) 자동 로그인 폴백 전면 제거
- [x] 프로필 조회 실패 시 명확한 에러 메시지(`"사용자 정보를 불러올 수 없습니다. 다시 로그인해 주세요."`) 상태로 설정하여 실패 화면 렌더링
- [x] 네이버 인가 코드 처리 시 하드코딩된 `'mock_state'` 폴백 제거 (state 누락 시 적절한 유효성 검증 또는 방어)
- [x] 소셜 사용자 생성/로그인 응답 검증 시 필수 필드(id, email) 누락에 대한 안전한 방어 처리

### 2. `Login.tsx` 중복/더미 코드 정리
- [x] `Login.tsx` 내 구버전 토큰 리다이렉트 처리 로직(소셜 콜백 중복 로직 및 `social_user` 더미 폴백) 정리 (소셜 콜백은 `OAuthCallbackPage`가 전담)
- [x] 일반 로그인 성공 응답 처리 시 `id: 'user_id'` 임의 하드코딩 폴백 제거 및 응답 유효성 검증 강화

### 3. 테스트 코드 동기화 및 전사 검증
- [x] `OAuthCallbackPage.spec.tsx` 내 더미 폴백 검증 테스트를 정식 에러 핸들링 및 실데이터 바인딩 검증으로 갱신
- [x] 프론트엔드 단위 테스트 스위트 211개 전수 100% Pass 검증
- [x] 프론트엔드 `oxlint` 0 에러 및 `tsc -b` 무결성 검증 완료
