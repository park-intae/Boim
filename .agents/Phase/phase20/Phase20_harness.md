> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 및 백엔드(@[.agents/BACKEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 20: 상용 외부 API 실연동 (Real-world External API Integration)

## 📌 목표 및 개요
기존에 목업(Mock) 및 로컬 규칙 엔진으로 대체 동작하던 핵심 외부 서비스들을 **실제 상용 외부 API**와 연동합니다.
1. **Google Gemini AI API 실연동**: 무료 발급 가능한 최신 Gemini 모델을 통해 실제 사용자의 10대 카테고리 가입 데이터를 종합 분석하여 실시간 건강 점수 및 맞춤형 리모델링 조언을 도출합니다.
2. **카카오 & 네이버 상용 OAuth2 실연동**: 실제 카카오 및 네이버 Developers 인가 코드를 교환하여 실제 사용자의 소셜 계정으로 회원가입, 로그인 및 연동/해제가 동작하도록 구현합니다.
3. **무중단 내결함성(Fault Tolerance)**: 외부 API의 일시적 장애나 할당량 소진 시에도 기존 로컬 룰 엔진(`RuleBasedDiagnosisEngine`) 및 내부 세션으로 안전하게 자동 전환되는 고가용성을 검증합니다.

---

## 📋 세부 Phase 마일스톤 로드맵

- [x] **Phase 20-01: Google Gemini AI 실시간 종합 보장 진단 API 연동 & 장애 폴백 검증 (완료)**
  - 최신 `@google/genai` SDK 기반 `gemini-3.5-flash-lite` 모델 실시간 프롬프트 호출 파이프라인 가동
  - 10대 카테고리 보장 데이터 기반 구조화된 JSON 파싱 및 점수/등급/리모델링 결과 반환 검증
  - API 키 부재, 네트워크 타임아웃, 토큰 할당량 초과 시 `RuleBasedDiagnosisEngine` 무중단 자동 전환 테스트
- [x] **Phase 20-02: 카카오 Developers 상용 OAuth2 실연동 & 계정 연동/해제 파이프라인 (완료)**
  - 카카오 REST API 토큰 교환(`POST https://kauth.kakao.com/oauth/token`) 및 사용자 정보(`GET https://kapi.kakao.com/v2/user/me`) 실연동
  - 브라우저 인가창 ➔ 콜백 페이지 ➔ JWT 발급 및 로그인/회원가입 플로우 검증
  - 카카오 프로필 사진(profileImage) 및 닉네임 실시간 추출 & 헤더 UI 반영 완료
- [x] **Phase 20-03: 네이버 Developers 상용 OAuth2 실연동 & 멀티 소셜 프로필 우선순위 파이프라인 (완료)**
  - 네이버 접근 토큰 발급/갱신(`GET https://nid.naver.com/oauth2.0/token`) 및 프로필 실연동
  - `passport-naver-v2` 프로필 이미지 카멜케이스 파싱 및 `https://` 승격 로직 적용
  - HMAC-SHA256 10분 만료 State 토큰 서명 일치 검증 (`crypto.timingSafeEqual`)을 통한 CSRF 차단
  - 단일 계정에 카카오 + 네이버 동시 연동 시 대표 프로필 사진/표시 이름 사용자 선택 우선순위 관리 기능 구축 완료
- [x] **Phase 20-04: 실제 소셜 계정(카카오/네이버) 실시간 OAuth 연동 및 해제(Link/Unlink) 실 파이프라인 구축 (완료)**
  - `SocialAccountsSettings.tsx` 목업(`mock-link`, `mock-unlink`) 제거 및 실시간 OAuth 인가/해제 연동
  - 백엔드 `state` 기반 유저 세션 바인딩(HMAC 서명 state)을 통한 안전한 소셜 계정 연동 콜백 구현
  - 소셜 계정 연동 해제 시 원본 데이터 정리 및 대표 본계정(`local`) 자동 복구
  - 전사 단위/통합 테스트 통과 및 도커 무중단 배포 검증 완료
- [ ] **Phase 20-05: 전사 단위/통합 테스트, Docker 컨테이너 배포 및 최종 무결성 검증**
  - 백엔드(Jest) 및 프론트엔드(Vitest) 전사 400개 이상 테스트 100% Pass 무결성 유지
  - Docker Compose 환경 변수 템플릿(`.env.production.example`) 및 컨테이너 반영 검증
  - `CHANGELOG.md` 및 포트폴리오 문서 최신화 완료
