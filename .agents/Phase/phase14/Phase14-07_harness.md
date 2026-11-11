> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 14-07: `InsuranceForm.tsx` 비즈니스 로직 커스텀 훅 분리

## 📌 목표 및 개요
현재 `InsuranceForm.tsx`는 폼 상태 관리, 입력 필드 제어, 날짜/금액 변환 및 유효성 검사, API 뮤테이션(생성/수정) 처리, 에러/토스트 표시 등 약 300라인 이상의 비즈니스 로직과 복잡한 JSX 렌더링이 단일 파일에 밀집되어 있습니다.
이를 해결하기 위해 모든 폼 상태, 변환 로직, 핸들러를 순수 커스텀 훅(`useInsuranceForm.ts`)으로 추출하여 관심사를 분리하고(Separation of Concerns), 뷰 컴포넌트는 오직 UI 표현과 레이아웃에만 집중하도록 만듭니다.

---

## 📋 세부 체크리스트

- [x] **1. `useInsuranceForm` 커스텀 훅 분리 (`apps/web/src/hooks/useInsuranceForm.ts`):**
  - 초기 폼 상태 세팅 (신규 등록 vs 기존 수정 모드 분기)
  - 폼 필드 변경 핸들러(handleChange, handleSelect 등)
  - 입력값 검증(Validation) 및 에러 메시지 상태 관리
  - 제출(Submit) 핸들러: API Payload 변환, `useCreateInsurance` / `useUpdateInsurance` 뮤테이션 호출, 완료 후 패널 닫기 및 피드백 처리
- [x] **2. `InsuranceForm.tsx` 리팩토링:**
  - `useInsuranceForm` 훅을 바인딩하여 뷰 렌더링에만 집중
  - 코드 라인수 대폭 경량화 및 가독성 개선
- [x] **3. `useInsuranceForm` 단위 테스트 및 기존 폼 테스트 회귀 검증:**
  - `useInsuranceForm.spec.ts` 단위 테스트 작성
  - 기존 `InsuranceForm.spec.tsx` (또는 관련 테스트) 100% Pass 검증
  - 프론트엔드 전체 테스트, 린트, 빌드 검증
- [x] **4. 작업 완료 후 커밋:**
  - `refactor: Phase 14-07 InsuranceForm 비즈니스 로직 및 뮤테이션 커스텀 훅(useInsuranceForm) 분리`
