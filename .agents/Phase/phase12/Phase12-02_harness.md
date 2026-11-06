> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 12-02: 백엔드 데이터 내보내기 (Excel XLSX) API 구현

## 📌 목표
`exceljs` 라이브러리를 활용하여 사용자의 가입 보험 포트폴리오(가입 목록, 카테고리별 납입/보장 통계, AI 종합 진단 리포트 요약)를 정갈한 스타일 서식이 적용된 다중 시트의 엑셀(`.xlsx`) 파일로 생성하고,
클라이언트가 원클릭으로 다운로드할 수 있는 안전한 바이너리 스트림 엔드포인트(`GET /analysis/export/excel`)를 구현합니다.

---

## 📋 세부 체크리스트

### 1. `ExportService` (엑셀 생성 서비스) 구현 (`apps/api`)
- [x] `exceljs` 의존성 설치 및 `AnalysisModule` 연동
- [x] 다중 워크시트(Multi-sheet) 구성:
  - **시트 1: 내 보험 가입 목록 (`가입 보험 상세`)**
    - 헤더: 번호, 보험사, 상품명, 카테고리, 월 납입액, 보장금액, 가입일, 만기일
    - 스타일링: 브랜드 인디고 헤더 배경색(`#4F46E5`), 흰색 볼드 폰트, 통화 서식(`#,##0"원"`), 날짜 서식(`YYYY-MM-DD`), 테두리 선
  - **시트 2: 카테고리별 보장 분석 (`카테고리별 통계`)**
    - 카테고리별 건수, 총 월 납입액, 총 보장금액, 납입 비중(%) 요약 테이블
  - **시트 3: AI 종합 진단 리포트 (`AI 종합 진단`)**
    - 종합 점수 및 진단 등급, 종합 한줄평
    - 보장 과다/부족 카테고리별 판정 (ADEQUATE, OVER_COVERED, UNDER_COVERED, NOT_COVERED)
    - 강점(Strengths), 보완점(Improvements), 절감 팁(Cost Saving Tips) 목록 정리
- [x] 버퍼(`Buffer`) 변환 메서드: `generateExcelReport(userId: bigint): Promise<Buffer>`

### 2. 컨트롤러 엔드포인트 구현 (`AnalysisController`)
- [x] `GET /analysis/export/excel`
  - `OptionalJwtAuthGuard` 및 본인 소유권 통제 적용
  - 응답 헤더 설정:
    - `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
    - `Content-Disposition: attachment; filename="boim_insurance_report_YYYYMMDD.xlsx"` (KST 일자 포맷)
    - Express `Response` 기반 버퍼 전송

### 3. 단위 테스트 작성 및 품질 검증
- [x] `export.service.spec.ts` 단위 테스트 작성
  - 보험 데이터가 있을 때 3개 시트를 포함한 유효한 엑셀 버퍼가 생성되는지 검증
  - 보험 데이터가 없을 때도 빈 서식과 함께 정상 버퍼가 반환되는지 검증
- [x] `analysis.controller.spec.ts` 엔드포인트 응답 검증 (다운로드 헤더 및 스트림 전송 확인)
- [x] 전사 테스트, 린트 및 빌드 무결성 검증 (100% Pass)
- [x] git commit (`feat(api): Phase 12-02 엑셀(XLSX) 리포트 내보내기 서비스 및 다운로드 API 구현`)
