> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 시작 전 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 숙독하고 준수할 것

# Phase 24-06: 프론트엔드 Utils · ErrorBoundary · 전사 검증 및 문서 동기화

## 🎯 세부 목표
- 프론트엔드 공통 에러 바운더리 및 유틸/스토어의 예외 케이스를 보강하고, 전사 테스트·린트·타입체크 검증 및 Phase 24 하네스/문서를 최종 마무리합니다.

## 📋 작업 체크리스트
- [ ] `apps/web/src/components/common/RouteErrorBoundary.spec.tsx` 신설: 일반 에러 폴백 UI 및 `ChunkLoadError`/동적 모듈 로드 실패 시 10초 무한 리로드 방지 로직 검증
- [ ] `apps/web/src/test/webNotification.test.ts`: Notification API 미지원 환경, 권한 요청 reject, 생성자 예외, `onclick` 핸들러 검증
- [ ] `apps/web/src/features/auth/utils/demoFallback.spec.ts` / `authStore.spec.ts`: 미존재 ID 예외, `accessToken === DEMO_ACCESS_TOKEN` 단독 조건, `hybridStorage` `sessionStorage`/`JSON.parse` 실패 폴백, `setPassVerified` `user === null` 경계 검증
- [ ] **전사 최종 검증 및 문서 동기화:**
  - [ ] `@boim/api` ESLint + `tsc` + Jest 전체 100% Pass
  - [ ] `@boim/web` oxlint + `tsc` + Vitest 전체 100% Pass
  - [ ] `Phase24-01 ~ 24-06` 서브 하네스를 `Phase24_sub_harness.md`로 통합 정리 (2-File Rule)
  - [ ] `.agents/Phase/Phase_harness.md`, `CHANGELOG.md`, `README.md` 최신화 후 완료 커밋
