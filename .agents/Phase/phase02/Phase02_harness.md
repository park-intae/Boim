# Phase 02: 비즈니스 로직(CRUD) 및 프론트엔드 레이아웃 연동

본 단계에서는 보험 가입 현황(`InsuranceProduct`) 도메인에 대한 핵심 CRUD 백엔드 API를 구현하고, 프론트엔드 레이아웃(사이드바/대시보드 형태)을 만들어 연동합니다.

> ⚠️ **주의사항 (GEMINI.md 규칙에 따름)**
> - 각 작업(Task)이 끝날 때마다 즉각적으로 Git 커밋을 수행해야 합니다.
> - 새로운 기능(API 및 UI 컴포넌트) 작성 시 단위/통합 테스트 코드를 의무적으로 작성합니다.

## ✅ 체크리스트

### 1. 백엔드(API) InsuranceProduct CRUD 구현
- [x] `packages/shared-types`: InsuranceProduct 생성, 조회, 수정 응답 DTO 추가
- [x] `apps/api`: `insurance-product` 모듈, 컨트롤러, 서비스 생성 및 Prisma CRUD 구현
- [x] `apps/api`: 기능 구현에 대한 단위 테스트 및 E2E 테스트 코드 작성 (규칙 준수)
- [x] 🌿 커밋 완료

### 2. 프론트엔드(Web) 공통 레이아웃 구성
- [x] 대시보드 공통 레이아웃 컴포넌트(Sidebar, Topbar, Main) 제작 (Tailwind CSS 활용)
- [x] 캘린더 & 대시보드 레이아웃 단위 테스트(RTL) 작성
- [x] 🌿 커밋 완료

### 3. 프론트엔드-백엔드 데이터 연동
- [ ] TanStack Query(`useQuery`, `useMutation`)를 활용해 InsuranceProduct API 연동 훅 작성
- [ ] 보험 목록 조회 및 등록 화면(모달/페이지) 컴포넌트 개발
- [ ] 기능(Hook 및 렌더링)에 대한 단위 테스트 작성
- [ ] 🌿 커밋 완료
