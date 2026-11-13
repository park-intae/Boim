> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 18-03: GitHub Actions CI 파이프라인 구축 (Lint, Test, Build 자동화)

## 📌 목표 및 개요
코드 변경 사항이 원격 저장소에 Push되거나 Pull Request가 생성될 때, 클라우드 가상 환경에서 프로젝트의 코드 품질(Lint), 무결성(Test - 전사 394개 테스트), 프로덕션 빌드(Build)를 자동으로 검증하여 버그 및 빌드 파손이 배포 브랜치에 유입되는 것을 방지하는 GitHub Actions CI 워크플로우(`.github/workflows/ci.yml`)를 구축합니다.
- 모노레포(pnpm workspace) 의존성 캐싱 최적화 (`actions/cache` 또는 `pnpm/action-setup`)
- Node.js 22 일관된 런타임 환경 보장
- Prisma Client 자동 생성 및 데이터베이스 의존성 없는 CI 테스트 분리 검증
- 전사 394개 테스트(Web 202개 + API 192개) 100% 무결성 Pass 보장

---

## 📋 세부 체크리스트

- [x] **1. GitHub Actions CI 워크플로우 정의 (`.github/workflows/ci.yml`)**
  - [x] 트리거 이벤트 정의 (`push`, `pull_request` on `master`, `main`, `develop`)
  - [x] GitHub 호스팅 러너 환경 (`ubuntu-latest`) 및 Node.js 22 환경 설정
  - [x] `pnpm/action-setup` 및 pnpm store 캐시 적용으로 빌드 시간 단축
  - [x] `pnpm install --frozen-lockfile` 무결성 의존성 설치

- [x] **2. 파이프라인 단계별 작업 선언**
  - [x] 1단계: Prisma Client 생성 (`pnpm --filter @boim/api exec prisma generate`)
  - [x] 2단계: 코드 린트 검사 (`pnpm lint`)
  - [x] 3단계: 전사 단위 테스트 실행 (`pnpm --filter @boim/web exec vitest run`, `pnpm --filter @boim/api test`)
  - [x] 4단계: 모노레포 전체 프로덕션 빌드 (`pnpm build`)
  - [x] 5단계: Docker 멀티스테이지 이미지 빌드 무결성 검증 (`docker/build-push-action@v6`)

- [x] **3. 로컬 환경에서 CI 파이프라인 정합성 사전 검증**
  - [x] 로컬에서 `pnpm lint` 통과 확인 (0 errors)
  - [x] 로컬에서 백엔드 테스트(192개) 및 프론트엔드 테스트(202개) 일괄 실행 및 100% Pass 확인 (총 394개 테스트)
  - [x] 로컬에서 `pnpm build` (shared-types -> api -> web) 정상 완료 확인 (0 errors)
  - [x] `.github/workflows/ci.yml` YAML 문법 및 GitHub Actions 스키마 무결성 검증

- [x] **4. 하네스 완료 체크 및 사용자 승인 하 커밋 진행**
