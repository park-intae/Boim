> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 시작 전 프론트엔드 작업은 @[.agents/FRONTEND_HARNESS.md]를 반드시 숙독하고 지침을 준수할 것

# Phase 24-04: 프론트엔드 API 훅 & `apiClient` 실패·롤백·데모 분기 테스트 보강

## 🎯 세부 목표
- 프론트엔드 API 통신 계층 전체에 대해 서버/네트워크 오류, 응답 누락, Optimistic Update 롤백, 데모 세션 격리 분기를 검증합니다.

## 📋 작업 체크리스트
- [x] `apps/web/src/api/client.spec.ts`: `isDemoSession() === true`일 때 401 응답 시 `logout()` 미호출, 500 에러 시 `logout()` 미호출 검증
- [x] `apps/web/src/api/useInsuranceQueries.spec.ts`: 생성/수정/삭제 `success: false`, `data` 누락, 네트워크/500 에러 reject, 데모 세션 분기 검증
- [x] `apps/web/src/api/useNotificationQueries.spec.ts`: 조회/읽음/삭제/배치 네트워크 에러 reject, `data` `undefined` 시 `[]` 폴백, 데모 세션 분기 검증
- [x] `apps/web/src/api/useDocumentQueries.spec.ts`: 업로드/파싱/샘플 파싱 API 실패 reject, `productId` 미전달 빈 params, `unwrapResponse` 중첩 경계값 검증
- [x] `apps/web/src/api/useUserQueries.spec.ts`: **`useUpdateNotificationSettings` 실패 시 `onError` Optimistic Update 캐시 롤백**, 전체 훅 `success: false`/reject/데모 분기 검증
- [x] `apps/web/src/api/useDiagnosisQueries.spec.ts`: 진단 조회/생성 API 실패 reject, `useExportExcel` `fetch` reject·`blob()` 실패·토큰 `null` 헤더 미전송 검증
- [x] **검증 및 커밋:** `@boim/web` Vitest + Typecheck + oxlint 통과 확인 후 `(Phase 24-04)` 커밋
