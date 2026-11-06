> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 13-01: 대시보드 미납 알림 실시간 집계 & 캘린더 일정 클릭 시 보험 수정(Edit) 모드 실연동

## 📌 목표
1. 메인 홈 대시보드(`HomePage.tsx`)의 4번째 요약 카드인 **'미납 알림'의 하드코딩 `0건`을 제거**하고, 실제 알림 데이터 및 이번 달 납입일 경과 미납 현황을 실시간 집계하여 정확한 건수를 표시하고 클릭 시 알림 패널로 이동하도록 구현합니다.
2. 캘린더 우측 패널(`RightPanel.tsx`)의 일정 카드를 클릭했을 때 기존 빈 주석(`// 향후 편집 모드 진입용`)을 제거하고, **해당 보험의 정보가 prefill된 상태로 보험 수정 폼(`InsuranceForm.tsx`)이 열리고 실제 수정(`useUpdateInsurance`)이 가능하도록 완성**합니다.

---

## 📋 세부 체크리스트

### 1. 대시보드 미납/납입 알림 실시간 집계 (`apps/web/src/pages/HomePage.tsx`)
- [ ] `useGetNotifications` 훅을 활용하여 읽지 않은 납입 관련 알림(`type === 'payment' && !n.isRead`) 및 당월 납입일 경과 미납 건수 실시간 계산
- [ ] 4번째 요약 카드의 `value`에 실제 집계된 건수 바인딩
- [ ] 요약 카드 클릭 시 알림 패널(`panelMode = 'notifications'`)로 즉시 이동하는 인터랙션 연동

### 2. 캘린더 일정 클릭 시 보험 수정(Edit) 모드 연동 (`RightPanel.tsx` & `InsuranceForm.tsx`)
- [ ] 전역 스토어(`useAppStore.ts`)에 `editingInsuranceId: string | null` 및 `setEditingInsuranceId: (id: string | null) => void` 상태 추가
- [ ] `RightPanel.tsx`:
  - 일정 카드 클릭(`onClick`) 시 `setEditingInsuranceId(evt.id)` 호출 및 `setPanelMode('form')`으로 수정 폼 오픈
  - 수정 모드 시 패널 헤더 타이틀을 '보험 수정'으로 동적 변경
  - 취소 버튼 클릭 시 `setEditingInsuranceId(null)` 및 `setPanelMode('view')` 초기화
- [ ] `InsuranceForm.tsx`:
  - `editingInsuranceId`가 존재할 경우 기존 보험 데이터를 `useGetInsurances()`에서 찾아 폼 기본값(Default values)에 Prefill
  - 폼 제출 시 신규 등록(`useCreateInsurance`) 대신 수정(`useUpdateInsurance`) mutate 호출
  - 저장 완료 시 성공 알림 및 `setEditingInsuranceId(null)`, `setPanelMode('view')` 복귀
  - '새로운 보험 등록' 버튼 클릭 시에는 항상 등록 모드로 초기화 (`editingInsuranceId = null`)

### 3. 단위 테스트 및 품질 검증
- [ ] `HomePage.test.tsx` (또는 `MainCalendar.test.tsx` / `App.test.tsx`): 미납 알림 건수 바인딩 및 클릭 이벤트 검증
- [ ] `RightPanel.test.tsx` & `InsuranceForm.test.tsx`: 일정 카드 클릭 시 수정 모드 진입 및 Prefill/수정 제출 검증
- [ ] 전사 테스트(`pnpm test`), 빌드(`pnpm build`), 린트(`pnpm lint`) 100% 통과
- [ ] git commit (`feat: Phase 13-01 대시보드 미납 알림 실시간 집계 및 캘린더 일정 수정 모드 연동`)
