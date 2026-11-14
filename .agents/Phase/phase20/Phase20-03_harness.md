> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것

# 📌 Phase 20-03: 네이버 Developers OAuth2 연동 및 본계정 기본값 & SNS 본계정(대표 계정) 전환 파이프라인

## 🎯 목표
- 네이버 Developers 키(`NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`) 실연동 및 302 인가 리다이렉트 검증
- 네이버 인증 라이브러리(`passport-naver-v2`)의 `profileImage` 카멜케이스 파싱 및 `https://` 승격 파이프라인 적용
- **회원가입한 원래 계정이 항상 본계정 기본값(local)으로 작동하도록 보장**
- **소셜 계정(카카오, 네이버)이 연동되어 있을 때, 사용자가 [대표 본계정(Primary Identity)]을 직접 [기본 가입 계정], [카카오], [네이버] 중 하나로 선택/전환할 수 있는 기능 구축**
- 대표 본계정 전환 시 서비스 전반(상단 헤더 아바타, 닉네임, 표시 이메일)이 해당 계정의 원본 정보로 실시간 동기화
- 백엔드 DB 스키마(`primaryAccountProvider`: `'local' | 'kakao' | 'naver'`) 및 본계정 전환 API(`PATCH /api/auth/social/primary-account`) 개발
- 단위/통합 테스트 통과 및 도커 무중단 배포 검증

---

## 📋 세부 체크리스트

### Task 1: 네이버 Developers 등록 안내 및 키 설정
- [x] 네이버 Developers 콘솔에서 애플리케이션 등록 가이드 제공
  - 서비스 URL: `http://localhost`
  - Callback URL: `http://localhost:4000/api/auth/naver/callback`, `http://localhost/api/auth/naver/callback`
  - 제공 정보: 회원이름(필수), 이메일주소(필수), 프로필사진(추가)
- [x] `apps/api/.env`에 실제 `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET` 등록 확인
- [x] `docker-compose.yml` 및 컨테이너 환경 변수 연동 확인

### Task 2: 네이버 OAuth2 인가 & 백엔드 파이프라인 검증
- [x] 백엔드 `GET /api/auth/naver` 호출 시 302 Found로 `https://nid.naver.com/oauth2.0/authorize?client_id=TjVUHYYyqx...` 정상 리다이렉트 검증
- [x] State 매개변수 생성 및 검증(CSRF 방지) 정상 동작 확인
- [x] 네이버 토큰 교환(`exchangeNaverCode`) 및 프로필 조회(`getNaverProfile`) 단위 테스트 확인
- [x] `naver.strategy.ts`의 `profileImage` 카멜케이스 파싱 및 URL `https://` 승격 로직 적용 완료

### Task 3: 회원가입 본계정 기본값 보존 및 SNS 본계정 전환 백엔드 아키텍처
- [x] Prisma `User` 스키마 확장:
  - `primaryAccountProvider` (`String? @default("local")`)
  - `localNickname` (`String?`), `localEmail` (`String?`) 보존 필드 추가 (기본 가입 시점의 원본 정보)
- [x] `prisma db push` 및 `prisma generate` 스키마 동기화 완료
- [x] `AuthService.register`: 신규 가입 시 `primaryAccountProvider: 'local'`, `localEmail: email`, `localNickname: name`을 기본값으로 영구 보존
- [x] `SocialAuthService.setPrimaryAccount(userId, provider)`:
  - `local` 선택 시: `name = user.localNickname`, `profileImage = null`
  - `kakao` 선택 시: `name = user.kakaoNickname`, `profileImage = user.kakaoProfileImage`
  - `naver` 선택 시: `name = user.naverNickname`, `profileImage = user.naverProfileImage`
  - `primaryAccountProvider` 갱신 및 업데이트된 유저 정보 반환
- [x] `AuthController`에 `PATCH /api/auth/social/primary-account` 엔드포인트 추가
- [x] `GET /api/auth/social/status` 응답에 `primaryAccountProvider`, `localAccount` 정보 포함
- [x] 백엔드 단위 테스트 작성 및 통과 확인 (73/73 tests PASS)

### Task 4: 프론트엔드 [본계정(대표 계정) 설정 및 SNS 전환] UI 구현
- [x] `SocialAccountsSettings.tsx`:
  - 최상단에 **[대표 본계정(Primary Identity)] 설정 카드** 신설
  - [기본 가입 계정 (local)] 뱃지 및 연동된 SNS(카카오/네이버) 카드 목록 렌더링
  - "현재 본계정" 상태 뱃지 표시 및 "본계정으로 지정" 원클릭 버튼 인터랙션 제공
  - 본계정 변경 시 `PATCH /api/auth/social/primary-account` 호출 및 `authStore` 상태 즉시 동기화
  - 상단 헤더 아바타/이름/이메일 실시간 변경 확인
- [x] 프론트엔드 단위 테스트 최신화 및 통과 확인 (209/209 tests PASS)

### Task 5: 전체 통합 검증 및 도커 배포
- [x] `pnpm --filter @boim/api test` (194/194 pass) 및 `pnpm --filter @boim/web test run` (209/209 pass) 전사 테스트 100% 통과 확인
- [x] `boim-api` 및 `boim-web` 도커 컨테이너 빌드 및 재기동 완료 (Health OK, HTTP 200/302 정상 응답)
- [x] master harness 최신화
