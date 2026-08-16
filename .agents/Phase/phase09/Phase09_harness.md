> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것

# Phase 09: 데이터베이스 연동 및 테스트 계정 셋업

## 1. 비밀번호 암호화 인프라 구성
- [x] 백엔드 `bcrypt` 패키지 설치
- [x] 테스트 계정 시드를 위한 `seed.ts` 스크립트 작성 및 실행

## 2. 로그인 및 재인증 DB 연동
- [x] `AuthService`의 `login` 메서드 Prisma 연동 (DB에서 유저 조회 및 bcrypt 검증)
- [x] `AuthService`의 `reauthenticate` 메서드 Prisma 연동 (DB 유저 비밀번호 검증)
