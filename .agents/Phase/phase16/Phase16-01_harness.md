> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 16-01: Vite 번들 다이어트 및 라우트/컴포넌트 코드 스플리팅 (Bundle Optimization)

## 📌 목표 및 개요
현재 Vite 프로덕션 빌드 시 발생하는 단일 번들 비대화 경고(`index.js 947.85 kB > 500 kB`)를 해소합니다.
`React.lazy` 및 `Suspense`를 활용하여 주요 라우트와 대형 컴포넌트(설정 패널, AI 리포트 팝업, 증권 업로더, 온보딩, PASS 인증)를 동적 임포트(Dynamic Import)하고, `vite.config.ts`의 `manualChunks` 설정을 정교화하여 벤더 라이브러리(React, Recharts, ExcelJS, 유틸 등)를 기능별로 분할합니다.
이를 통해 초기 로딩 시 다운로드되는 번들 크기를 획기적으로 줄이고, 모든 청크를 500kB 이하로 경량화하여 프로덕션 빌드 경고 0건을 달성합니다.

---

## 📋 세부 단계별 체크리스트

### 1. `vite.config.ts` 벤더 청크 분할 (Manual Chunks Splitting)
- [x] `vite.config.ts`에 `build.rollupOptions.output.manualChunks` 전략 구성:
  - `vendor-react`: `react`, `react-dom`, `react-router-dom`
  - `vendor-query`: `@tanstack/react-query`, `zustand`
  - `vendor-charts`: `recharts`
  - `vendor-excel`: `exceljs`
  - `vendor-icons`: `lucide-react`
  - `vendor-utils`: `date-fns`, `zod`
- [x] 각 벤더 번들 분할 후 모듈 간 순환 참조 및 종속성 정합성 확인

### 2. 라우트 및 대형 패널 컴포넌트 지연 로딩 (React.lazy & Suspense)
- [x] 라우터(`apps/web/src/router/index.tsx`) 페이지 컴포넌트 동적 임포트:
  - `Login`, `SignUp`, `Onboarding`, `PassVerification`, `OAuthCallbackPage`를 `React.lazy`로 전환
  - 로딩 시 깜빡임을 방지하는 감각적인 컴포넌트 스켈레톤/스피너 `Suspense fallback` 적용
- [x] 우측 패널(`RightPanel.tsx`) 대형 서브 컴포넌트 지연 로딩:
  - `AiDiagnosisReport`, `PremiumAnalysis`, `SettingsPanel` 등을 지연 로딩하여 초기 첫 페인트(FCP) 최적화

### 3. 번들 사이즈 측정 및 빌드 경고 0건 달성 검증
- [x] `pnpm --filter web build` 실행하여 청크 사이즈 검증:
  - 메인 엔트리 청크(`index.js`): 947.85 kB ➔ **105.88 kB** (-89% 절감)
  - 최대 청크(`vendor-charts`): **326.95 kB** (500kB 임계치 하회)
  - `(!) Some chunks are larger than 500 kB` 경고 **0건 달성**

### 4. 프론트엔드 전사 테스트 회귀 무결성 검증 및 보고
- [x] 프론트엔드 Vitest 전사 43개 테스트 파일 / 184개 테스트 100% Pass 확인
- [x] 사용자에게 세부 변경 내역 및 번들 경량화 수치 보고 후 커밋 승인 완료
