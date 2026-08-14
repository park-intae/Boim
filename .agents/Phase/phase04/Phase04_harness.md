# Phase 04: MVP CRUD 및 API 연동 (Right Panel 기반)

> **목표:** 프론트엔드와 백엔드 간의 통신(Axios, TanStack Query)을 연동하고, 별도의 모달이나 페이지 이동 없이 **우측 상세 패널(Right Panel)**을 메인 인터랙션(입력/수정/삭제) 영역으로 활용하여 보험 상품 데이터의 MVP CRUD 기능을 완성합니다. 중앙 캘린더는 읽기 전용(Read-Only) 뷰어 역할을 담당합니다.

## ✅ 체크리스트

### 1. API 클라이언트 및 전역 상태 관리 세팅
- [x] 프론트엔드 API 폴더(`src/api`) 내 Axios 인스턴스 구성 및 공통 에러 핸들러 작성
- [x] 서버 상태 관리를 위한 `TanStack Query (React Query)` Provider 전역 설정
- [x] 보험 API 호출을 위한 Query & Mutation Custom Hook 구현 (`useInsuranceQueries`)

### 2. 중앙 캘린더 데이터 연동 (Read-Only)
- [ ] 백엔드 `insurance-product` GET API와 캘린더 컴포넌트 연결
- [ ] 더미 데이터(`mockEvents`)를 실제 API 응답 데이터 기반으로 교체
- [ ] 특정 날짜 클릭 시 해당 날짜의 일정을 필터링하여 우측 패널(Right Panel)의 전역 상태(Context/Zustand)로 전달

### 3. 우측 상세 패널 (Right Panel) 상태/뷰 설계
- [ ] 우측 패널의 화면 상태를 `View Mode`(일정 목록 확인)와 `Form Mode`(새 보험 등록 및 수정)로 전환하는 로직 구현
- [ ] 선택된 날짜에 이벤트가 없을 경우 나타나는 Empty State에서 '등록' 버튼 클릭 시 Form Mode로 진입하도록 연결
- [ ] 캘린더 우측 상단에 보험 추가 버튼 제작, 클릭시 우측 상세 패널 Form Mode로 전환
- [ ] 패널 하단 '새로운 보험 등록' 둥근 플로팅 버튼 클릭 시 Form Mode로 전환

### 4. 우측 상세 패널 (Right Panel) Form UI 및 Mutation (Create / Update)
- [ ] 보험 등록/수정을 위한 입력 폼(Form) UI 구현
  - [ ] `docs/Boim_Schema.webp` 기반 데이터 필드 매핑:
    - 카테고리 (`category` - Select/Dropdown)
    - 보험 상품명 (`name` - Text Input)
    - 보험사명 (`institution` - Text Input)
    - 가입일 (`startDate` - Date Picker)
    - 만기일 (`maturityDate` - Date Picker)
    - 월 납입액 (`monthlyPayment` - Number Input)
    - 보장 금액 (`coverageAmount` - Number Input)
- [ ] `react-hook-form` 및 `zod`를 활용한 폼 데이터 검증(Validation) 로직 추가
- [ ] 폼 제출 시 백엔드 POST/PATCH API 연동 및 성공 시 캘린더 데이터 무효화(Invalidate Queries) 처리
- [ ] 작성 취소 및 저장 성공 시 Form Mode에서 View Mode로 자연스러운 트랜지션 복귀

### 5. 데이터 삭제 (Delete) 및 마무리
- [ ] View Mode의 개별 보험 상세 카드 내부에 삭제(Delete) 액션 아이콘 추가
- [ ] 삭제 요청 시 재확인 알림 후 백엔드 DELETE API 호출

## 💡 개발 가이드라인
- **모달 금지**: 라우팅(페이지 이동)을 제외한 모든 인터랙티브 폼 입력 및 상세 확인은 철저히 **우측 사이드바(Right Panel)** 내부에서 이루어지도록 UI/UX를 설계합니다.
- 백엔드 응답 스키마와 프론트엔드의 타입 인터페이스가 완벽히 일치하도록 공유 타입(`shared-types` 혹은 명확한 DTO 타입 선언)을 엄격하게 관리합니다.
- 작성/수정/삭제 등 상태 변경이 발생하면, 페이지 새로고침 없이 React Query의 `invalidateQueries`를 통해 중앙 캘린더 뱃지가 즉각적으로 실시간 리렌더링되게 구현합니다.
