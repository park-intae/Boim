> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 18-02: 풀스택 Docker Compose 오케스트레이션 (PostgreSQL + API + Web/Nginx)

## 📌 목표 및 개요
개발 및 상용 배포 환경에서 단 한 번의 명령어(`docker compose up -d`)로 데이터베이스(PostgreSQL 16), 백엔드 API(NestJS 11), 프론트엔드 SPA 웹(Nginx)을 일괄 실행하고 상호 연동할 수 있도록 루트 `docker-compose.yml` 오케스트레이션을 완성합니다.
- 서비스 의존성 및 헬스체크(`depends_on: condition: service_healthy`) 보장: DB 준비 후 백엔드 구동, 백엔드 준비 후 웹 구동
- 내부 네트워크 격리(`boim-network`) 및 데이터 영속화(`boim_pgdata` 볼륨)
- 환경 변수 주입 체계(로컬 개발용 및 상용 오버라이드 지원)

---

## 📋 세부 체크리스트

- [x] **1. 기존 `docker-compose.yml` 리팩토링 및 3대 서비스 정의**
  - [x] `postgres`: PostgreSQL 16 Alpine, 헬스체크(`pg_isready -U postgres -d boim`), 포트 5432 매핑, 볼륨 마운트
  - [x] `api`: `apps/api/Dockerfile` 빌드, 포트 4000 매핑, DB 헬스체크 의존성(`condition: service_healthy`), 환경변수 바인딩
  - [x] `web`: `apps/web/Dockerfile` 빌드, 포트 80 매핑, 백엔드 의존성(`depends_on: api`)

- [x] **2. 헬스체크 및 네트워크/볼륨 오케스트레이션**
  - [x] PostgreSQL `healthcheck` 인터벌/타임아웃/재시도 설정
  - [x] API 서비스 헬스체크 및 정상 구동 대기 설정
  - [x] 서비스 간 통신용 독립 브릿지 네트워크(`boim-network`) 선언

- [x] **3. Docker Compose 빌드 및 컨테이너 기동 검증**
  - [x] `docker compose config` 문법 및 서비스 구조 유효성 검증
  - [x] 로컬 환경 기준 컨테이너 빌드 및 기동 테스트 (`docker compose up --build -d`)
  - [x] 3대 컨테이너 헬스체크 상태 및 HTTP 응답 확인 (API 직접 호출 200 OK, Web Nginx 200 OK, 리버스 프록시 200 OK)
  - [x] 테스트 완료 후 컨테이너 정리 (`docker compose down`)

- [x] **4. 작업 완료 갱신 및 사용자 승인 하 커밋 진행**
