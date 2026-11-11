> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 16: Docker 컨테이너화 및 CI/CD 자동화 배포 파이프라인 (DevOps & Infrastructure)

## 📌 목표 및 개요
Boim 풀스택 서비스를 실제 상용 클라우드나 사설 서버에 즉시 무중단 배포할 수 있도록 Multi-stage Docker 컨테이너 환경을 구축하고, Docker Compose를 통한 원클릭 풀스택 로컬/운영 오케스트레이션을 완성합니다. 또한 GitHub Actions CI를 연동하여 코드 푸시 및 PR 시 린트, 전사 349개 테스트, 빌드가 자동으로 검증되는 안전한 배포 파이프라인을 구축합니다.

---

## 📋 세부 체크리스트

### 1. Phase 16-01: Multi-stage Dockerfile 구축
- [ ] `apps/api/Dockerfile`: Alpine 기반 경량 Node.js 환경, pnpm 모노레포 캐시 활용, Prisma 클라이언트 빌드 및 프로덕션 번들링
- [ ] `apps/web/Dockerfile`: Vite 프로덕션 빌드 후 Nginx 경량 컨테이너를 통한 고성능 SPA 서빙 및 캐시 헤더 최적화
- [ ] 이미지 사이즈 최소화 및 보안 비루트(non-root) 유저 실행 설정

### 2. Phase 16-02: Docker Compose 풀스택 오케스트레이션
- [ ] `docker-compose.yml`: PostgreSQL 16 + NestJS API + Web/Nginx + 네트워크/볼륨 마운트 구성
- [ ] 컨테이너 시작 시 Prisma 자동 마이그레이션(`prisma migrate deploy`) 실행 파이프라인 연동
- [ ] Nginx 리버스 프록시(`/api` ➔ NestJS API 포워딩, 정적 자산 Gzip 압축) 설정

### 3. Phase 16-03: GitHub Actions CI 파이프라인 구축
- [ ] `.github/workflows/ci.yml`: Push 및 Pull Request 자동 트리거 워크플로우
- [ ] pnpm 의존성 캐싱 및 워크스페이스 린트(`oxlint`, `eslint`) 검증
- [ ] 전사 테스트 스위트 자동 실행 (Vitest 179개 + Jest 170개) 및 실패 시 머지 차단 게이트웨이
- [ ] Turbo 모노레포 프로덕션 빌드 무결성 자동 검증

### 4. Phase 16-04: 배포 환경 가이드 및 마일스톤 마무리
- [ ] 상용 환경 배포용 보안 환경 변수 템플릿(`.env.production.example`) 정립
- [ ] 배포 가이드 문서(`DEPLOYMENT.md`) 작성 (Docker 실행법, DB 백업, SSL 인증서 연동 안내)
- [ ] `CHANGELOG.md` 및 `README.md` 동기화 및 커밋
