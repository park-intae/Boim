> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 12 Sub-Harness: 내 보험 가입 현황 AI 종합 진단 & 데이터 내보내기 (PDF / Excel 리포트)

## 📌 개요
본 서브 하네스는 **Phase 12 전체 마일스톤(12-01 ~ 12-04)**의 상세 구현 명세, 엔지니어링 표준 및 검증 결과를 단일 파일로 통합 관리하는 하네스 문서입니다. (2-File Rule 준수)

---

## 📋 세부 단계별 체크리스트 및 구현 현황

### 1. Phase 12-01: 백엔드 Gemini AI 보험 종합 진단 엔진 및 API
- [x] `@google/genai` SDK 연동 및 프롬프트 엔지니어링 (`AiDiagnosisService`)
  - 사용자 가입 보험 목록, 월간 총 납입액, 카테고리별 보장액 집계 및 `gemini-2.5-flash` 연동
  - 대한민국 3040 권장 기준(실손 5천만원, 암/뇌/심장 3대 질병 5천만원, 사망 1억원) 대비 보장 과다/부족 진단
  - 종합 점수(0~100점), 등급(`EXCELLENT` ~ `WARNING`), 카테고리별 상태 평가, 강점/보완점/월 납입료 절감 팁 구조화 JSON 출력
- [x] 무결점 규칙 기반(Rule-based) 폴백 진단 엔진 탑재
  - `GEMINI_API_KEY` 부재 또는 장애 시 100% 동작 보장 (`isFallback: true` 플래그 반환)
- [x] DTO 및 공유 타입 정의 (`packages/shared-types` 내 `InsuranceDiagnosisDto`, `CategoryEvaluation`, `DiagnosisGrade`, `CoverageStatus`)
- [x] 엔드포인트 구현: `POST /analysis/ai-diagnosis`, `GET /analysis/ai-diagnosis` (소유권 통제 및 Swagger 문서화)
- [x] 백엔드 단위 테스트 작성 및 100% Pass (`ai-diagnosis.service.spec.ts`, `analysis.controller.spec.ts`)

### 2. Phase 12-02: 백엔드 데이터 내보내기 (Excel XLSX 리포트) 서비스 및 API
- [x] `exceljs` 기반 다중 시트 엑셀 보고서 자동 생성 엔진 구축 (`ExportService`)
  - **시트 1 (가입 보험 상세):** 번호, 보험사, 상품명, 카테고리, 월 납입액, 보장금액, 가입일, 만기일 및 하단 합계 통계 (통화 서식 및 브랜드 스타일링 적용)
  - **시트 2 (카테고리별 통계):** 카테고리별 건수, 총 월 납입액, 총 보장금액, 납입 비중(%) 요약 테이블
  - **시트 3 (AI 종합 진단):** 종합 진단 점수 및 등급, 한줄평, 카테고리별 보장 적정도(ADEQUATE, UNDER_COVERED 등), 강점/보완점/절감팁 구조화 요약
- [x] 다운로드 스트림 엔드포인트 구현: `GET /analysis/export/excel` (MIME 타입, RFC 5987 한글 파일명 인코딩 헤더 적용)
- [x] 백엔드 단위 테스트 작성 및 100% Pass (`export.service.spec.ts`, 총 145건 통과)

### 3. Phase 12-03: 프론트엔드 AI 종합 진단 리포트 UI 및 시각화
- [x] 전역 상태 및 쿼리 훅 연동 (`useAppStore.ts`, `useDiagnosisQueries.ts`)
  - `panelMode === 'ai-diagnosis'` 전역 패널 모드 지원
  - TanStack Query 기반 `useGetDiagnosis`, `useGenerateDiagnosis`, `useExportExcel` 훅 구현
- [x] 네비게이션 진입점 연동:
  - `Sidebar.tsx`: 'AI 종합 진단' 메뉴 항목 추가 (`Sparkles` 아이콘)
  - `PremiumAnalysis.tsx`: 'AI 맞춤 종합 진단' 배너 바로가기 연동
- [x] AI 종합 진단 리포트 UI 컴포넌트 (`AiDiagnosisReport.tsx`) 구현:
  - 종합 보장 건강 점수 카드 (0~100점 대형 점수, 등급 배지, AI 총평, 월 납입액 및 총 보장금액 칩)
  - 카테고리별 보장 적정도 프로그레스 바 및 뱃지 (`적정`, `부족`, `과다`, `미가입`)
  - AI 1:1 맞춤형 리모델링 조언 카드 (든든한 보장 포인트, 보완 필요 항목, 월 보험료 절감 팁)
  - 규칙 기반 폴백 엔진 감지 시 배지 안내
  - 빈 상태(Empty State) 안내 및 새 보험 등록 폼 전환 지원

### 4. Phase 12-04: 리포트 내보내기/인쇄 연동 및 전체 품질 무결성 검증
- [x] 프론트엔드 원클릭 Excel(.xlsx) 파일 다운로드 연동 (`ExportService` 스트림 응답 Blob 처리)
- [x] 브라우저 인쇄 친화적(Print-friendly) PDF 리포트 뷰 및 출력 기능 (`window.print()`, `print:hidden` 스타일링)
- [x] 프론트엔드 단위/컴포넌트 테스트 작성 (`AiDiagnosisReport.test.tsx`, `Sidebar.test.tsx`, `RightPanel.test.tsx` 최신화, 총 65건 100% Pass)
- [x] 모노레포 전체 빌드(`pnpm build`), 린트(`pnpm lint`), 테스트(`pnpm test`) 무결성 검증 완료
- [x] 하네스 2-File Rule 단일화 및 `CHANGELOG.md`, `README.md` 최종 동기화
