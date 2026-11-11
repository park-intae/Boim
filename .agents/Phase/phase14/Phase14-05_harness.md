> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 14-05: `AiDiagnosisReport.tsx` 리포트 서브 컴포넌트 분리

## 📌 목표 및 개요
단일 컴포넌트에 점수 계산, 영역별 보장 바, 조언/절감 팁 카드 등이 모두 집중되어 비대해진 `AiDiagnosisReport.tsx`를 세 개의 독립된 프레젠테이션 서브 컴포넌트(`DiagnosisScoreCard`, `CoverageProgressList`, `DiagnosisAdviceCards`)로 분리하고, 메인 리포트 화면을 명확한 조합(Composition) 컨테이너로 리팩토링합니다.

---

## 📋 세부 체크리스트

- [x] **1. `DiagnosisScoreCard.tsx` 분리 (`src/components/layout/diagnosis/DiagnosisScoreCard.tsx`):**
  - 종합 점수(0~100점), 진단 등급 뱃지(EXCELLENT, GOOD, NORMAL, WARNING 등), AI 한줄 총평 표시
- [x] **2. `CoverageProgressList.tsx` 분리 (`src/components/layout/diagnosis/CoverageProgressList.tsx`):**
  - 3대 질병/실손 등 카테고리별 보장 현황(현재 vs 권장 금액, 적정/부족 뱃지, 프로그레스 바) 표시
- [x] **3. `DiagnosisAdviceCards.tsx` 분리 (`src/components/layout/diagnosis/DiagnosisAdviceCards.tsx`):**
  - 강점(Strengths), 개선점(Improvements), 보험료 절감 팁(CostSavingTips) 카드 표시
- [x] **4. `AiDiagnosisReport.tsx` 리팩토링:**
  - 서브 컴포넌트 조합 구조로 변경하여 뷰 레이어 대폭 경량화
  - 재분석, 인쇄, 엑셀 다운로드 등 헤더 액션과의 연동 무결성 유지
- [x] **5. 서브 컴포넌트 단위 테스트 및 회귀 테스트 검증:**
  - 서브 컴포넌트 테스트 스위트 작성
  - 기존 `AiDiagnosisReport.test.tsx` 100% 회귀 검증 Pass
  - `pnpm test`, `pnpm --filter @boim/web lint`, `pnpm build` 무결성 검증
- [x] **6. 작업 완료 후 커밋:**
  - `refactor: Phase 14-05 AI 진단 리포트 서브 컴포넌트(ScoreCard/ProgressList/AdviceCards) 분리`
