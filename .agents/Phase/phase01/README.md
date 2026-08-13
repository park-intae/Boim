# Phase 01: 프로젝트 베이스 설계 및 뼈대 구축

이 단계에서는 앱의 근간이 되는 데이터베이스 모델을 확립하고, 프론트-백엔드 간의 데이터 규격(API/타입)을 정의하며, 기본 통신 및 레이아웃 뼈대를 완성합니다.

## 📝 작업 체크리스트

### 1. 데이터베이스 스키마 모델링
- [x] `apps/api`(NestJS) 환경에 Prisma 설치 및 초기화
- [x] 제공된 다이어그램을 바탕으로 `schema.prisma` 모델 작성 (User, InsuranceProduct, Notification, Document)
- [x] 로컬 데이터베이스 연동 및 마이그레이션(`prisma migrate dev`)을 통한 테이블 생성

### 2. 공통 타입(DTO) 및 API 명세 구축
- [x] Prisma 모델을 기준으로 `packages/shared-types`에 프론트-백 간 공유할 핵심 타입/인터페이스 정의
- [x] 백엔드(`apps/api`)에 Swagger 세팅 및 도메인별 Controller 껍데기(엔드포인트 명세) 작성
- [x] API 공통 응답 포맷 규격화 및 전역 예외 처리(Exception Filter) 로직 적용

### 3. 프론트엔드 기반 셋업
- [x] `docs/design` 디자인 리소스를 참고하여 `tailwind.config.js`에 Color Palette(색상 토큰) 연동
- [x] React Router 세팅 및 기본 페이지 구조 구축 (Private/Public 라우팅 뼈대 포함)
- [x] 백엔드 통신을 위한 API 클라이언트(Axios/Fetch) 전역 인스턴스 생성 및 에러 인터셉터 설정

### 4. Phase 01 테스트 및 검증
- [ ] 프론트엔드 라우팅 및 공통 레이아웃 기본 단위 테스트(Vitest + RTL) 작성
- [ ] 백엔드 Prisma 모델 및 기본 API E2E 테스트(Jest + Supertest) 뼈대 작성
- [ ] 백엔드 Swagger 접속 및 더미 응답 확인
- [ ] 작업 내용 일괄 커밋 및 푸시
