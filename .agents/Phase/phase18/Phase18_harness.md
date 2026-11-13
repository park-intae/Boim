> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 18: Docker 컨테이너화 및 CI/CD 자동화 배포 파이프라인 구축 (DevOps & Infrastructure)

## 📌 목표 및 개요
Boim 모노레포 시스템(React 19 Frontend + NestJS 11 Backend + PostgreSQL Database)을 어떤 클라우드나 로컬 환경에서도 단 한 번의 명령어로 즉시 프로덕션 수준으로 구동할 수 있도록 **Multi-stage Docker 컨테이너화**를 완료하고, 코드 변경 시마다 자동으로 린트, 테스트(394개), 빌드 무결성을 검증하는 **GitHub Actions CI/CD 자동화 파이프라인**을 구축합니다.

---

## 📋 Phase 18 종합 체크리스트

- [x] **Phase 18-01: Multi-stage Dockerfile 구축 (Backend & Frontend)**
  - [x] `apps/api/Dockerfile`: NestJS 11 프로덕션 멀티스테이지 Dockerfile 작성 (Alpine Node, pnpm 모노레포 캐싱, non-root 보안 유저, 293MB)
  - [x] `apps/web/Dockerfile`: React 19 Vite 번들 빌드 & Nginx Alpine 서빙 Dockerfile 작성 (26.7MB)
  - [x] `apps/web/nginx.conf`: Nginx SPA 라우팅 fallback(`try_files`), Gzip 압축, 보안 헤더, 정적 캐시, `/api/` 리버스 프록시 설정
  - [x] `.dockerignore` 최적화: 불필요한 node_modules, dist, 로그 배제로 이미지 빌드 초경량화

- [x] **Phase 18-02: 풀스택 Docker Compose 오케스트레이션 (`docker-compose.yml`)**
  - [x] PostgreSQL 16 DB + NestJS API + Web Nginx 3개 서비스 원클릭 오케스트레이션 구성
  - [x] DB 헬스체크(`pg_isready`) 및 의존성 순서(`depends_on: condition: service_healthy`) 보장
  - [x] 프론트엔드 Nginx 리버스 프록시(`/api` ➔ `api:4000`, `/` ➔ SPA) 연동으로 CORS 이슈 제로화
  - [x] 로컬/프로덕션 겸용 환경 변수 주입 체계 완성 및 구동 검증 (200 OK)

- [x] **Phase 18-03: GitHub Actions CI 자동화 파이프라인 구축 (`.github/workflows/ci.yml`)**
  - [x] `main` / `master` / `develop` 브랜치 Push 및 Pull Request 시 자동 트리거 파이프라인 작성
  - [x] Node.js 22 & pnpm v9 환경 세팅 및 의존성 캐싱 최적화
  - [x] 전사 Turbo 모노레포 `pnpm lint` 자동 검증 (0 errors)
  - [x] 백엔드 192개 Jest 테스트 + 프론트엔드 202개 Vitest 테스트 (총 394개) 100% 자동 통과 검증
  - [x] Web Vite 빌드 + API NestJS 컴파일 무결성 자동 확인
  - [x] Docker Buildx 컨테이너 이미지 패키징 빌드 자동 검증

- [x] **Phase 18-04: 보안 환경 변수 템플릿 및 배포 문서화**
  - [x] `.env.production.example`: 프로덕션 배포 시 필수 보안 환경 변수 가이드 템플릿 완비
  - [x] `docs/DEPLOYMENT.md`: 단 한 줄 명령어 원클릭 배포 가이드 문서화
  - [x] 품질 검증 및 사용자 승인 하 커밋 진행
