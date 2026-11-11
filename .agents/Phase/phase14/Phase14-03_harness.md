> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 14-03: `src/api` React Query 훅 및 비동기 파이프라인 단위 테스트

## 📌 목표 및 개요
현재 13.15%로 유일하게 커버리지가 낮았던 `apps/web/src/api` 폴더의 모든 React Query 훅들과 API 클라이언트에 대한 `renderHook` 기반 단위 테스트를 작성합니다.
공통 Test Fixtures와 `apiClient` 모킹을 연계하여 쿼리 조회, 캐싱, 뮤테이션 성공/실패 및 캐시 무효화 흐름을 검증하고, **프론트엔드 전사 라인 커버리지 80% 이상**을 달성합니다.

---

## 📋 세부 체크리스트

- [x] **1. `client.spec.ts` 작성:**
  - `apiClient`의 요청 인터셉터(토큰 주입) 및 응답 인터셉터(성공/실패 분기, 글로벌 에러 핸들링) 검증 (100% 커버)
- [x] **2. `useInsuranceQueries.spec.ts` 작성:**
  - `useGetInsurances` (목록 조회)
  - `useGetInsurance` (단건 조회)
  - `useCreateInsurance` (생성 뮤테이션 및 `insuranceKeys.all` 무효화)
  - `useUpdateInsurance` (수정 뮤테이션 및 캐시 갱신)
  - `useDeleteInsurance` (삭제 뮤테이션 및 캐시 갱신) (92.3% 커버)
- [x] **3. `useNotificationQueries.spec.ts` 작성:**
  - `useGetNotifications` (알림 목록 조회)
  - `useMarkNotificationRead` / `useMarkAllNotificationsRead` (읽음 처리)
  - `useDeleteNotification` (삭제 처리)
  - `useTriggerBatch` (스케줄러 수동 동기화) (100% 커버)
- [x] **4. `useUserQueries.spec.ts` 작성:**
  - `useGetProfile`, `useUpdateProfile`, `useUpdatePassword`
  - `useGetNotificationSettings`, `useUpdateNotificationSettings` (onMutate 낙관적 업데이트)
  - `useGetLoginHistory`, `useExportData`, `useImportData`, `useDeleteAccount` (87.3% 커버)
- [x] **5. `useDiagnosisQueries.spec.ts` & `useDocumentQueries.spec.ts` 작성:**
  - `useGetDiagnosis`, `useGenerateDiagnosis`, `useExportExcel` (97.05% 커버)
  - `useUploadDocument`, `useParseDocument`, `useParseSampleDocument`, `useGetSamplePreset` (100% 커버)
- [x] **6. 전사 테스트 및 커버리지 재측정 (80%+ 달성 검증):**
  - `pnpm --filter @boim/web test:cov` 실행: **프론트엔드 라인 커버리지 82.56% 달성!**
  - `src/api` 폴더 라인 커버리지: **13.15% -> 93.68%로 대폭 상승**
  - 전사 테스트 통과: **총 318개 테스트 100% Pass** (Web 163개, API 155개)
  - 린트(`oxlint`) 0 warnings/0 errors 및 빌드(`pnpm build`) 100% 무결성 확인
- [x] **7. 작업 완료 후 커밋:**
  - `feat: Phase 14-03 src/api React Query 훅 단위 테스트 작성 및 프론트 커버리지 80%+ 달성`
