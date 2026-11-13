> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 18: 통합 세부 하네스 (Phase 18-01 ~ Phase 18-04)

본 문서는 Phase 18의 4개 세부 단위 작업(Phase 18-01 ~ Phase 18-04)의 수행 내역 및 검증 결과를 하네스 작성 규정에 따라 사후 통합하여 영구 보존하는 문서입니다.

---

## 📋 1. Phase 18-01: Multi-stage Dockerfile 구축 (Backend & Frontend)

### 📌 목표 및 개요
- NestJS 11 백엔드 API와 React 19 SPA 프론트엔드를 최소 용량의 프로덕션 컨테이너 이미지로 빌드하는 Multi-stage Dockerfile 및 Nginx 웹서버 구성.

### ✅ 세부 체크리스트 및 완료 결과
- [x] **모노레포 루트 `.dockerignore` 작성**
  - [x] `node_modules`, `dist`, `.turbo`, `.git`, `.env*` 등 불필요 파일 제외
- [x] **`apps/api/Dockerfile` 작성 (NestJS 11 멀티스테이지)**
  - [x] `base` ➔ `dependencies` (pnpm frozen-lockfile) ➔ `builder` (prisma generate, nest build) ➔ `runner` (Node 22 Alpine, non-root `node` 유저)
  - [x] 빌드 이미지 용량: **293MB 경량화 달성**
- [x] **`apps/web/Dockerfile` 및 `nginx.conf` 작성**
  - [x] `dependencies` ➔ `builder` (React 19 Vite production build) ➔ `runner` (Nginx 1.27 Alpine)
  - [x] `apps/web/nginx.conf`: SPA 라우팅 fallback(`try_files`), Gzip 압축, 보안 헤더, 정적 에셋 장기 캐시, `/api/` 리버스 프록시
  - [x] 빌드 이미지 용량: **26.7MB 초경량화 달성**
- [x] **로컬 빌드 무결성 검증**
  - [x] `docker build -t boim-api:test -f apps/api/Dockerfile .` 정상 성공
  - [x] `docker build -t boim-web:test -f apps/web/Dockerfile .` 정상 성공

---

## 📋 2. Phase 18-02: 풀스택 Docker Compose 오케스트레이션 (PostgreSQL + API + Web/Nginx)

### 📌 목표 및 개요
- 개발 및 상용 배포 환경에서 단 한 번의 명령어(`docker compose up -d`)로 데이터베이스(PostgreSQL 16), 백엔드 API(NestJS 11), 프론트엔드 SPA 웹(Nginx)을 일괄 실행하고 상호 연동.

### ✅ 세부 체크리스트 및 완료 결과
- [x] **`docker-compose.yml` 3대 서비스 오케스트레이션 정의**
  - [x] `postgres`: PostgreSQL 16 Alpine, 헬스체크(`pg_isready -U postgres -d boim`), 포트 5432 매핑, `boim_pgdata` 볼륨 마운트
  - [x] `api`: `apps/api/Dockerfile` 빌드, 포트 4000 매핑, DB 헬스체크 의존성(`condition: service_healthy`), 환경변수 바인딩
  - [x] `web`: `apps/web/Dockerfile` 빌드, 포트 80 매핑, 백엔드 의존성(`depends_on: api`)
- [x] **pnpm 모노레포 런타임 모듈 격리 보강**
  - [x] runner 스테이지에 `apps/api/node_modules` 복사 및 `NODE_PATH` 환경변수 보강으로 `@nestjs/core` 누락 방지
  - [x] Prisma Client 런타임 엔진 아티팩트 보존
- [x] **통합 구동 및 HTTP 연동 검증**
  - [x] API 직접 호출: `GET http://localhost:4001/api/health` ➔ `Boim API Server is running!` (200 OK)
  - [x] 웹 Nginx 서빙: `GET http://localhost:80/` ➔ HTTP 200 OK
  - [x] Nginx 리버스 프록시 연동: `GET http://localhost:80/api/health` ➔ `Boim API Server is running!` (200 OK)
  - [x] 컨테이너 종료 및 클린업: `docker compose down`

---

## 📋 3. Phase 18-03: GitHub Actions CI 파이프라인 구축 (Lint, Test, Build 자동화)

### 📌 목표 및 개요
- 코드 변경 사항 Push / PR 시 클라우드 가상 환경에서 코드 품질, 전사 394개 테스트, 모노레포 프로덕션 빌드, Docker 패키징 무결성을 자동으로 검증.

### ✅ 세부 체크리스트 및 완료 결과
- [x] **GitHub Actions CI 워크플로우 정의 (`.github/workflows/ci.yml`)**
  - [x] 트리거: `push`, `pull_request` on `master`, `main`, `develop`
  - [x] 환경: `ubuntu-latest`, Node.js 22, `pnpm/action-setup@v4` (pnpm 9), pnpm store 캐시 적용
- [x] **검증 파이프라인 단계별 선언**
  - [x] 의존성 설치 (`pnpm install --frozen-lockfile`)
  - [x] Prisma Client 자동 생성 (`pnpm --filter @boim/api exec prisma generate`)
  - [x] 린트 검사 (`pnpm lint` ➔ oxlint & eslint 0 errors)
  - [x] 백엔드 단위 테스트 (`pnpm --filter @boim/api test` ➔ Jest 192개 테스트 100% Pass)
  - [x] 프론트엔드 단위 테스트 (`pnpm --filter @boim/web exec vitest run` ➔ Vitest 202개 테스트 100% Pass)
  - [x] 모노레포 프로덕션 빌드 (`pnpm build` ➔ Turbo shared-types, api, web 100% Build)
  - [x] Docker Buildx 이미지 빌드 검증 (`docker/build-push-action@v6`)

---

## 📋 4. Phase 18-04: 상용 배포 보안 환경 변수 템플릿 및 배포 운영 가이드 문서화

### 📌 목표 및 개요
- 상용 클라우드 및 온프레미스 서버 배포를 위한 보안 환경 변수 템플릿(`.env.production.example`) 및 원클릭 배포 운영 가이드(`docs/DEPLOYMENT.md`) 완성.

### ✅ 세부 체크리스트 및 완료 결과
- [x] **`.env.production.example` 템플릿 작성**
  - [x] DB 접속 정보, JWT 보안 키(64바이트 난수 가이드), 카카오/네이버 OAuth2, Google Gemini AI 키, SMTP 이메일 설정
  - [x] 보안 무결성 전수 검사 (실제 상용 시크릿 유출 제로)
- [x] **`docs/DEPLOYMENT.md` 운영 가이드 작성**
  - [x] 시스템 아키텍처 다이어그램 (Mermaid)
  - [x] 사전 요구사항 및 방화벽 인바운드 규칙 표
  - [x] 4단계 원클릭 배포 가이드 (Git clone ➔ env 세팅 ➔ docker compose ➔ prisma migrate deploy)
  - [x] 헬스체크 및 실시간 로그 모니터링 가이드
  - [x] 무중단 롤링 업데이트 및 장애 시 롤백(Rollback) 절차
  - [x] Host Nginx + Let's Encrypt Certbot SSL/TLS 인증서 연동 안내
- [x] **`.gitignore` 갱신 (`!.env*.example`)**
