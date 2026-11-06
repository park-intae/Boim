> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 12-03: 프론트엔드 AI 종합 진단 리포트 UI 및 시각화

## 📌 목표
백엔드에서 제공하는 Gemini AI 종합 진단 API(`POST/GET /analysis/ai-diagnosis`) 및 엑셀 다운로드 API(`GET /analysis/export/excel`)를 프론트엔드와 완벽히 연동하여,
사용자가 자신의 보험 포트폴리오 적정성을 직관적으로 확인하고 리모델링 조언을 열람할 수 있는 **AI 종합 진단 리포트 대시보드 UI**를 구현합니다.

---

## 📋 세부 체크리스트

### 1. 전역 상태 및 쿼리 훅 연동 (`apps/web`)
- [x] `useAppStore.ts`: `panelMode` 타입에 `'ai-diagnosis'` 추가 및 `setPanelMode` 동기화
- [x] `useDiagnosisQueries.ts` 훅 구현:
  - `useGetDiagnosis`: TanStack Query 기반 `GET /analysis/ai-diagnosis` (캐싱 및 로딩/에러 처리)
  - `useGenerateDiagnosis`: `POST /analysis/ai-diagnosis` (재분석 트리거)
  - `useExportExcel`: `GET /analysis/export/excel` 호출 및 브라우저 파일 다운로드 Blob 처리
- [x] `Sidebar.tsx`: 'AI 종합 진단' 메뉴 항목 추가 (`Sparkles` 아이콘, `setPanelMode('ai-diagnosis')`)
- [x] `PremiumAnalysis.tsx`: 'AI 종합 진단 바로가기' 유도 배너 추가

### 2. AI 종합 진단 컴포넌트 (`AiDiagnosisReport.tsx`) 구현
- [x] **헤더 섹션**:
  - 패널 타이틀 ("AI 종합 진단")
  - `[🔄 재분석]` 버튼 및 `[📊 엑셀 다운로드]` 액션 버튼
- [x] **종합 건강 점수 & 등급 카드**:
  - 원형 점수 게이지 (0 ~ 100점)
  - 등급 뱃지 (`EXCELLENT` ~ `WARNING` 색상별 뱃지)
  - AI 종합 총평 안내 박스
  - 총 월 납입액 및 총 보장금액 요약 칩
- [x] **카테고리별 보장 적정도 섹션**:
  - 실손의료비, 3대 질병(암/뇌/심장), 사망/종신, 운전자 등 카테고리별 카드
  - 적정도 상태 뱃지 (`적정`, `부족`, `과다`, `미가입`)
  - 현재 보장금액 vs 권장 기준 비교 프로그레스 바
  - 전문 평가 의견(코멘트) 표시
- [x] **AI 1:1 맞춤형 리모델링 조언 섹션**:
  - 든든한 강점 (`strengths`) - 초록 체크 리스트
  - 보완 필요 항목 (`improvements`) - 주황 주의 리스트
  - 월 보험료 절감 팁 (`costSavingTips`) - 파랑 전구 팁 리스트
- [x] **Empty State (가입 보험이 없을 때)**:
  - 안내 문구 및 `[새 보험 등록]` 폼 전환 액션 지원

### 3. 컴포넌트 단위 테스트 및 품질 검증
- [x] `AiDiagnosisReport.test.tsx` Vitest 테스트 작성:
  - 정상 진단 데이터 렌더링 검증 (점수, 등급, 카테고리, 조언)
  - 재분석 및 엑셀 다운로드 버튼 인터랙션 검증
  - Empty State 렌더링 검증
- [x] `Sidebar.test.tsx` 및 `RightPanel.test.tsx` 테스트 최신화
- [x] 전사 빌드, 린트 및 테스트 무결성 검증 (100% Pass)
- [x] git commit (`feat(web): Phase 12-03 AI 종합 진단 리포트 UI 및 시각화 구현`)
