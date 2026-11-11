> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 14-04: `RightPanel.tsx` 서브 컴포넌트 분리 (`DailyEventsView.tsx`)

## 📌 목표 및 개요
비대해진 `RightPanel.tsx`에서 일별 일정 렌더링(날짜 헤더, 납입/만기 일정 카드, 삭제, 수정 모드 진입 및 Empty State) 책임을 독립 컴포넌트인 `DailyEventsView.tsx`로 분리하여 `RightPanel`의 역할을 '패널 라우터/컨테이너'로 경량화하고 가독성과 유지보수성을 극대화합니다.

---

## 📋 세부 체크리스트

- [x] **1. `DailyEventsView.tsx` 컴포넌트 분리 (`src/components/layout/DailyEventsView.tsx`):**
  - 선택된 날짜(`selectedDate`)에 해당하는 보험 일정 필터링 및 포맷팅
  - 일정 카드 클릭 시 보험 수정 모드(`setEditingProductId`, `panelMode: 'form'`) 전이
  - 일정 삭제(`useDeleteInsurance`) 액션 및 확인 다이얼로그
  - 해당 날짜에 일정이 없을 때의 Empty State UI 및 새 보험 등록 연동
- [x] **2. `RightPanel.tsx` 경량화 리팩토링:**
  - `'view'` 모드 렌더링 부분을 `<DailyEventsView />`로 교체 (252줄 -> 150줄로 40% 이상 경량화)
  - 불필요해진 상태 및 인라인 로직 정리
- [x] **3. `DailyEventsView.spec.tsx` 단위 테스트 작성:**
  - 납입/만기 일정 목록 렌더링 검증
  - 일정 카드 클릭 시 수정 모드 전환 검증
  - 삭제 버튼 클릭 시 `deleteInsurance` 호출 및 알림 검증
  - 빈 일정 시 '등록된 일정이 없습니다' Empty State 검증 (커버리지 93.75%)
- [x] **4. 기존 `RightPanel.test.tsx` 회귀 검증 및 전사 무결성 확인:**
  - `RightPanel.test.tsx` 및 `DailyEventsView.spec.tsx` 100% Pass
  - `pnpm test`, `pnpm --filter @boim/web lint`, `pnpm build` 무결성 검증 (전사 324개 테스트 100% Pass)
- [x] **5. 작업 완료 후 커밋:**
  - `refactor: Phase 14-04 RightPanel 일별 일정 뷰(DailyEventsView) 분리 및 패널 경량화`
