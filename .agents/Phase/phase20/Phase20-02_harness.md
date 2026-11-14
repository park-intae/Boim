> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것

# 📌 Phase 20-02: 카카오 OAuth2 소셜 로그인 실제 연동 및 엔드투엔드 검증

## 🎯 목표
- 발급받은 실제 카카오 Developers REST API 키(`KAKAO_CLIENT_ID`)를 환경 변수 및 Docker 컨테이너에 연동
- 카카오 인가 URL(`GET /api/auth/kakao`) 호출 시 실제 `kauth.kakao.com`으로 정상 리다이렉트 확인
- 실제 브라우저 환경에서 카카오 로그인 시도 시 인가 코드 발급, 토큰 교환 및 프로필(`id`, `nickname`) 처리 확인
- 이메일 권한이 없는 개인 개발자 앱 계정에서도 Fallback 이메일(`kakao_${id}@social.boim.internal`)을 통한 정상 회원가입 및 JWT 로그인 발급 확인
- 단위/통합 테스트 통과 확인

---

## 📋 세부 체크리스트

### Task 1: 환경 변수 및 Docker 연동 구성
- [x] `docker-compose.yml`에서 `KAKAO_CLIENT_ID` 등 하드코딩 기본값 오버라이드 제거하여 `apps/api/.env` 우선 로드 보장
- [x] `docker compose up -d --no-deps api` 실행하여 컨테이너 환경 변수 적용
- [x] 컨테이너 내부 환경 변수에 실제 카카오 클라이언트 ID가 반영되었는지 검증

### Task 2: 카카오 인가 및 로그인 엔드포인트 동작 검증
- [x] 백엔드 `GET /api/auth/kakao` 엔드포인트 호출 시 302 Found로 `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=...` 로 리다이렉트되는지 검증
- [x] 응답 헤더의 Location URL에 실제 REST API 키와 등록된 `redirect_uri`가 정확히 포함되는지 확인
- [x] 카카오 이메일 미제공 시 Fallback 이메일 정상 생성 및 로그인/회원가입 로직 단위 테스트 확인 (17/17 PASS, 전체 auth 69/69 PASS, 프론트엔드 207/207 PASS)
- [x] 카카오 Client Secret 불일치 오류 해결 및 `UserController` 내 `userId = 1n` 하드코딩 제거 (`OptionalJwtAuthGuard` 연동 및 실제 토큰 기반 유저 프로필 조회 지원)

### Task 3: 프론트엔드 연동 및 실제 로그인 테스트
- [x] 프론트엔드 로그인 화면(`http://localhost:5173` 또는 `http://localhost`)의 [카카오 로그인] 버튼 클릭 흐름 검토
- [x] `OAuthCallbackPage.tsx` 및 `Login.tsx`에서 실제 유저 프로필 조회 및 상태 동기화 처리 완료
- [x] `boim-api` 및 `boim-web` 도커 컨테이너 최신 코드 빌드 및 재기동 완료

### Task 4: 결과 기록 및 문서화
- [x] Phase 20 마스터 하네스(`Phase20_harness.md`) 진행 상황 동기화
- [x] 발생 에러 및 해결 내역 `.agents/errorlog.md`에 기록 (26번 항목: passport-kakao Client Secret 및 UserController 하드코딩 제거 완료)
- [x] 실제 사용자 프로필 사진 렌더링 지원 (DB 컬럼, 소셜 프로필 추출, Header UI 반영) 완료
