> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 14-01: 커버리지 측정 정밀화 및 테스트 데이터 Fixture 체계 구축

## 📌 목표 및 개요
- `apps/web/vite.config.ts`의 커버리지 수집 범위를 정밀화하여 정적 라우트/타입/엔트리 파일로 인한 커버리지 왜곡을 제거합니다.
- 프론트엔드 내부에 분산되어 있던 임시 모킹 데이터를 정리하고, 일관성 있는 공통 테스트 Fixture(`src/test/fixtures/`)를 구축합니다.

---

## 📋 세부 체크리스트

- [x] **1. `apps/web/vite.config.ts` 커버리지 설정 고도화:**
  - `coverage.provider = 'v8'`
  - `coverage.exclude`: `['node_modules/**', 'dist/**', 'src/main.tsx', 'src/router/**', 'src/types/**', '**/*.d.ts', 'src/test/**']` 추가
  - 린트 및 빌드 무결성 확인
- [x] **2. 공통 테스트 Fixtures 구축 (`apps/web/src/test/fixtures/`):**
  - `user.fixture.ts`: 기본 사용자, 본인인증 완료 사용자 mock data
  - `insurance.fixture.ts`: 단건/목록/카테고리별 보험 mock data
  - `notification.fixture.ts`: 미납, 만기, 시스템 알림 mock data
  - `calendar.fixture.ts`: 캘린더 이벤트 mock data
  - `diagnosis.fixture.ts`: AI 종합 진단 mock data
- [x] **3. 기존 컴포넌트 내 파편화된 임시 모킹 데이터 점검 및 정리:**
  - 하드코딩된 더미 배열을 표준 Fixture 임포트로 정돈
- [x] **4. 단위 테스트 실행 및 커버리지 베이스라인 점검:**
  - `pnpm --filter @boim/web test` 100% 통과 확인 (86 tests passed)
  - 커버리지 재측정 및 통계 확인
- [x] **5. 작업 완료 후 커밋:**
  - `feat: Phase 14-01 커버리지 설정 정밀화 및 테스트 데이터 Fixture 체계 구축`
