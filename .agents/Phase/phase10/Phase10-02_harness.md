> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것

# Phase 10-02: 패턴 매칭 기반 증권 데이터 추출 및 파싱 서비스 구현

## 🎯 목표
외부 AI 토큰 낭비를 없애고 처리 속도와 정확도를 극대화하기 위해, OCR(Tesseract.js)로 추출한 텍스트에서 **정규식 및 휴리스틱 패턴 매칭 엔진**을 통해 보험 계약 정보(`ParsedInsuranceData`)를 즉시 JSON 구조로 추출하는 백엔드 파싱 서비스를 구현합니다. (AI는 향후 '내 보험 종합 진단/분석 리포트' 전담으로 역할을 명확히 분리합니다.)

---

## ✅ 체크리스트

### 1. 패턴 매칭 파서 서비스 (`DocumentParserService`) 구현
- [x] 정규식 및 키워드 기반 패턴 매칭 엔진 구현:
  - 보험사명 감지 (삼성화재, 현대해상, 한화손보, DB손보, KB손보, 메리츠화재, 교보생명, 삼성생명, 신한라이프 등 시중 주요 보험사 패턴)
  - 상품명 추출 (`상품명:`, `보험명:` 등 라인 기반 추출)
  - 보험 카테고리 자동 판별 (`HEALTH`, `LIFE`, `AUTO`, `SAVING`, `CANCER`)
  - 월 납입 보험료 추출 (쉼표 제거 및 숫자 변환)
  - 납입일 추출 (`매월 N일`, `이체일` 등)
  - 계약 시작일 및 만기일 추출 (`YYYY-MM-DD`, `YYYY년 MM월 DD일` 날짜 파싱)
  - 보장금액 추출
- [x] 텍스트 및 이미지 OCR 파일 판독 연동:
  - 텍스트 파일(`sample_policy_preset.txt` 등): 직접 비동기 읽기
  - 이미지 파일: `tesseract.js` 한글/영어 OCR 판독

### 2. 증권 파싱 API 구현 (`DocumentController`)
- [x] `POST /documents/:id/parse` 엔드포인트:
  - Row-level 본인 소유권 검증
  - 파일 로드 및 패턴 매칭 엔진 실행
  - DB `Document` 레코드의 `ocrText` 및 `parsedData` 컬럼 갱신
  - 공통 응답 포맷(`ApiResponse<DocumentParseResponse>`) 반환
- [x] `POST /documents/sample/parse` 엔드포인트:
  - 가상 모의 증권 샘플 프리셋을 즉시 파싱하여 결과 반환 (원클릭 테스트용)

### 3. 품질 검증 및 단위 테스트
- [x] `DocumentParserService` 단위 테스트(`document-parser.service.spec.ts`) 작성
  - 다양한 포맷의 증권 텍스트에 대한 패턴 매칭 정확도 검증
- [x] `DocumentController` 및 `DocumentService` 파싱 엔드포인트 단위 테스트 보강
- [x] 단위 테스트 전체 통과 (Jest 19개 스위트, 99개 테스트 100% Pass)
- [x] 린트 및 빌드 검증 후 커밋
