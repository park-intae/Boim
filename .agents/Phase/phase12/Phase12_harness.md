> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 12: 내 보험 가입 현황 AI 종합 진단 & 데이터 내보내기 (PDF / Excel 리포트)

## 📌 목표 및 개요
사용자가 가입한 보험 데이터(월 납입액, 보장 내역, 카테고리별 통계)를 바탕으로, **Google Gemini AI**를 활용해 보장의 적정성(과다/부족)을 분석하고 맞춤형 리모델링 조언을 도출하는 **AI 종합 진단 리포트 시스템**을 구축합니다. 또한 대시보드 통계와 진단 결과를 담은 **Excel(XLSX) 및 PDF 리포트 내보내기(Export)** 기능을 제공합니다.

---

## 📋 세부 단계별 체크리스트

### 1. Phase 12-01: 백엔드 Gemini AI 보험 종합 진단 엔진 및 API 구현
- [x] `@google/genai` SDK 연동 및 프롬프트 엔지니어링
  - 사용자 가입 보험 목록, 월간 총 납입액, 카테고리별 보장액 집계 로직
  - JSON 스키마 기반 출력 강제: 종합 진단 점수(0~100점), 과다/부족 분석, 리모델링 조언, 예상 절감액 등
  - API 키 미설정 또는 오류 발생 시 안정적인 규칙 기반 모의 분석(Fallback) 엔진 구현
- [x] DTO 및 공유 타입 정의 (`packages/shared-types` 내 `InsuranceDiagnosisDto` 등)
- [x] 엔드포인트 구현: `POST /analysis/ai-diagnosis` (소유권 통제 및 캐싱 고려)
- [x] 단위 테스트 작성 및 100% Pass (`ai-diagnosis.service.spec.ts`, `analysis.controller.spec.ts`)

### 2. Phase 12-02: 백엔드 데이터 내보내기 (Excel XLSX & PDF 데이터) API 구현
- [x] `exceljs` 기반 엑셀 파일 생성 서비스 구현
  - 시트 1: 내 보험 가입 목록 (보험사, 상품명, 카테고리, 월납입액, 보장금액, 만기일 등)
  - 시트 2: 카테고리별 통계 및 납입 요약
  - 시트 3: AI 종합 진단 결과 요약
- [x] 엔드포인트 구현: `GET /analysis/export/excel` (스트림 또는 버퍼 다운로드 헤더 설정)
- [x] 단위 테스트 작성 및 100% Pass

### 3. Phase 12-03: 프론트엔드 AI 종합 진단 리포트 UI 및 시각화
- [ ] TanStack Query 훅 구현 (`useDiagnosisQueries.ts`)
- [ ] 'AI 종합 진단' 패널/탭 UI 구현
  - 종합 건강 점수 원형 게이지 차트
  - 카테고리별 보장 적정도 바(Bar) 차트
  - AI 1:1 맞춤형 리모델링 조언 카드 (강점, 보완 필요, 절감 팁)
- [ ] Vitest 컴포넌트 단위 테스트 작성

### 4. Phase 12-04: 프론트엔드 리포트 다운로드(Excel / PDF) 연동 및 전체 품질 무결성 검증
- [ ] 원클릭 Excel(.xlsx) 파일 다운로드 버튼 연동
- [ ] 브라우저 인쇄 친화적(Print-friendly) PDF 리포트 뷰 및 출력 기능 구현
- [ ] 모노레포 전체 빌드(`pnpm build`), 린트(`pnpm lint`), 테스트(`pnpm test`) 무결성 검증
- [ ] 하네스 단일화 (`Phase12_sub_harness.md`) 및 `CHANGELOG.md`, `README.md` 최종 동기화
