> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 18-04: 상용 배포 보안 환경 변수 템플릿 및 배포 운영 가이드 문서화

## 📌 목표 및 개요
개발 환경에서 완성된 Boim 풀스택 서비스를 실제 클라우드 서버(AWS EC2, GCP, On-premise 등)에 안전하고 신속하게 배포할 수 있도록, 철저한 보안 원칙을 준수하는 상용 환경 변수 템플릿(`.env.production.example`)과 원클릭 Docker 배포 운영 가이드(`docs/DEPLOYMENT.md`)를 완성합니다.
- 개인정보 보호 및 보안 최우선 원칙(규칙 1) 준수: 민감 키 하드코딩 금지, 운영 보안 체크리스트 명시
- 데이터베이스 마이그레이션(`prisma migrate deploy`) 및 시딩 절차 가이드
- Docker Compose 기반 무중단 배포 및 장애 시 롤백, 컨테이너 헬스체크 및 로그 모니터링 체계 가이드

---

## 📋 세부 체크리스트

- [x] **1. 상용 환경 변수 템플릿 작성 (`.env.production.example`)**
  - [x] 데이터베이스 접속 정보 (`DATABASE_URL`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`)
  - [x] JWT 인증 보안 키 (`JWT_SECRET`, `JWT_EXPIRES_IN`)
  - [x] 소셜 로그인 OAuth2 키 (카카오, 네이버 클라이언트 ID/Secret/Redirect URI)
  - [x] Google Gemini AI API 키 (`GEMINI_API_KEY`, `USE_MOCK_PARSER=false`)
  - [x] 이메일 SMTP 알림 발송 설정 (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`)
  - [x] 프론트엔드 및 백엔드 포트/URL 설정 (`API_PORT`, `WEB_PORT`, `FRONTEND_URL`)

- [x] **2. 상용 배포 운영 가이드 작성 (`docs/DEPLOYMENT.md`)**
  - [x] 시스템 아키텍처 다이어그램 (Mermaid) 및 배포 사전 요구사항 (Docker 24+, Compose v2+, Linux 사양)
  - [x] 초기 인프라 셋업 및 방화벽/보안 그룹 설정 가이드 (포트 80, 443, 4000 등)
  - [x] 원클릭 Docker Compose 프로덕션 빌드 & 실행 절차
  - [x] Prisma DB 스키마 마이그레이션 (`prisma migrate deploy`) 실행 가이드
  - [x] 서비스 상태 모니터링 (헬스체크 엔드포인트 `/api/health`, 실시간 컨테이너 로그 확인)
  - [x] 무중단 배포 전략 및 장애 발생 시 롤백(Rollback) 가이드
  - [x] SSL/TLS 인증서(Let's Encrypt / Certbot) 연동 권장 가이드

- [x] **3. 문서 및 템플릿 정합성 검증**
  - [x] `.env.production.example` 내 민감 정보 하드코딩 및 실운영 키 노출 여부 전수 검사 (완료: 플레이스홀더 사용)
  - [x] 문서 내 명령어(Docker Compose, Prisma 등)의 문법 및 경로 정합성 검증

- [x] **4. 하네스 완료 체크 및 사용자 승인 하 커밋 진행**
