> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 18-01: Multi-stage Dockerfile 구축 (Backend & Frontend)

## 📌 목표 및 개요
Boim 모노레포의 NestJS 11 백엔드(`apps/api`)와 React 19 Vite 프론트엔드(`apps/web`)를 최소 크기와 최고 보안 수준으로 컨테이너화하기 위해 Multi-stage Dockerfile 및 Nginx 배포 설정을 구축합니다.
- pnpm 모노레포 워크스페이스 구조(`packages/shared-types` 포함)를 완벽히 지원하는 계층화된 캐싱 빌드
- 경량화 베이스 이미지(`node:22-alpine`, `nginx:alpine`) 및 non-root 보안 유저 적용
- 프론트엔드 Nginx의 SPA 라우팅 Fallback(`try_files`) 및 API 리버스 프록시 설정
- `.dockerignore`를 통한 빌드 컨텍스트 최소화 및 초고속 빌드 성능 확보

---

## 📋 세부 체크리스트

- [x] **1. 모노레포 루트 `.dockerignore` 작성**
  - [x] `.git`, `node_modules`, `dist`, `.agents`, `docs`, `coverage`, `.env*` 등 불필요한 빌드 파일 필터링

- [x] **2. NestJS 11 백엔드 멀티스테이지 Dockerfile (`apps/api/Dockerfile`) 작성**
  - [x] `base`: Node 22 Alpine + Corepack pnpm 활성화
  - [x] `dependencies`: `pnpm-lock.yaml`, `pnpm-workspace.yaml`, 각 패키지 `package.json` 복사 후 의존성 설치
  - [x] `builder`: `packages/shared-types` 및 `apps/api` 빌드 실행 (`pnpm run build`, `prisma generate`)
  - [x] `runner`: 경량 프로덕션 런타임 구성 (non-root `node` 유저, 포트 4000 노출, `CMD ["node", "dist/main.js"]`)

- [x] **3. React 19 프론트엔드 Nginx 설정 (`apps/web/nginx.conf`) 작성**
  - [x] SPA History API 지원: `try_files $uri $uri/ /index.html;`
  - [x] API 리버스 프록시: `/api/` ➔ `http://api:4000/api/` 프록시 패스 및 프록시 헤더 설정
  - [x] 성능 최적화: Gzip 압축(HTML, CSS, JS, SVG, JSON) 및 정적 자산 캐싱 헤더
  - [x] 보안 헤더: `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`

- [x] **4. React 19 프론트엔드 멀티스테이지 Dockerfile (`apps/web/Dockerfile`) 작성**
  - [x] `builder`: pnpm 기반 모노레포 의존성 설치 및 Vite 정적 번들 빌드 (`pnpm run build`)
  - [x] `runner`: `nginx:alpine` 베이스 이미지에 컴파일된 `dist/` 정적 파일 및 `nginx.conf` 복사
  - [x] 포트 80 노출 및 Nginx 포그라운드 실행 (`CMD ["nginx", "-g", "daemon off;"]`)

- [x] **5. 도커 빌드 검증 및 무결성 확인**
  - [x] `apps/web/Dockerfile` 빌드 성공 (최종 이미지 크기: 26.7MB)
  - [x] `apps/api/Dockerfile` 빌드 성공 (최종 이미지 크기: 293MB, Prisma 엔진 내장)
  - [x] 도커 빌드 검증 완료 후 테스트 이미지 태그 정리 완료
