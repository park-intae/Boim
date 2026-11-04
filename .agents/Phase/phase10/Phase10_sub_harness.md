> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것

# Phase 10 하위 작업 통합 하네스 (Phase 10 Sub-Harness)

본 문서는 Phase 10(보험 증권 파일 업로드 & 패턴 매칭 데이터 자동 추출 및 폼 자동 입력) 과정에서 진행된 세부 하위 작업(Phase 10-01 ~ 10-02)의 실행 내역과 체크리스트를 하나로 통합 정리한 문서입니다.

---

## 📋 Phase 10-01: 백엔드 증권 파일 업로드 & Document 모델 및 API 구현

> **목표:** 사용자가 보험 증권 파일(PDF, PNG, JPG)을 안전하게 업로드할 수 있는 백엔드 인프라를 구축하고, 사용자 소유권(Row-level 권한 통제)을 보장하는 `Document` 데이터 모델 및 업로드 API를 구현합니다.

### 1. 데이터 모델 및 타입 정의
- [x] `packages/shared-types`: `DocumentDto`, `ParsedInsuranceData`, `DocumentUploadResponse`, `DocumentParseResponse` 인터페이스 정의 보강
- [x] `apps/api/prisma/schema.prisma`:
  - `Document` 모델에 `userId BigInt` 필드 추가 (소유권 통제용)
  - `productId BigInt?`로 nullable 수정 (상품 등록 전 사전 업로드 지원)
  - `User` 모델과의 `@relation` 연결 및 `prisma generate` 실행

### 2. 백엔드 증권 업로드 모듈 (`DocumentModule`) 구현
- [x] 파일 업로드 관련 의존성 점검 (`multer`, `@types/multer` 설치)
- [x] `DocumentModule`, `DocumentController`, `DocumentService` 생성 및 `AppModule` 등록
- [x] `POST /documents/upload` 엔드포인트 구현:
  - `JwtAuthGuard` 적용 (인증된 사용자만 접근 가능)
  - `FileInterceptor` 및 `Multer` 파일 필터 적용 (허용 확장자: `.pdf`, `.png`, `.jpg`, `.jpeg`, 최대 10MB)
  - 고유한 파일명 생성(UUID) 및 안전한 디렉토리(`uploads/documents/`) 저장
  - DB `Document` 레코드 생성 (업로드한 사용자 `userId` 연결)
- [x] 가상 모의 증권 샘플(Mock Insurance Policy) 에셋 생성 (개인정보 비식별화 테스트용)
  - `apps/web/public/samples/sample_policy_preset.txt` 및 `getSamplePreset` 구현

### 3. 보안 & 권한 및 에러 핸들링
- [x] 타인 문서 접근 차단 (Row-level 권한 통제 검증)
- [x] 유효하지 않은 파일 포맷/초과 용량에 대한 표준 예외(`BadRequestException`) 처리

### 4. 품질 검증 (테스트 & 린트)
- [x] `DocumentService` 및 `DocumentController` 단위 테스트 작성 및 100% Pass
- [x] 린트 및 빌드 검증 완료

---

## 📋 Phase 10-02: 패턴 매칭 기반 증권 데이터 추출 및 파싱 서비스 구현

> **목표:** 외부 AI 토큰 낭비를 없애고 속도와 정확도를 극대화하기 위해, OCR(Tesseract.js)로 추출한 텍스트에서 정규식 및 휴리스틱 패턴 매칭 엔진을 통해 보험 계약 정보(`ParsedInsuranceData`)를 즉시 JSON 구조로 추출하는 백엔드 파싱 서비스를 구현합니다.

### 1. 패턴 매칭 파서 서비스 (`DocumentParserService`) 구현
- [x] 정규식 및 키워드 기반 패턴 매칭 엔진 구현:
  - 주요 보험사명 감지 패턴 (삼성화재, 현대해상, 한화손보, DB손보, KB손보, 메리츠화재, 교보생명, 삼성생명, 신한라이프 등)
  - 상품명 추출 (`상품명:`, `보험명:` 등 라인 기반)
  - 보험 카테고리 자동 판별 (`HEALTH`, `LIFE`, `AUTO`, `SAVING`, `CANCER`)
  - 월 납입 보험료 추출 (쉼표 제거 및 숫자 변환)
  - 납입일 추출 (`매월 N일`, `이체일` 등)
  - 계약 시작일 및 만기일 추출 (`YYYY-MM-DD`, `YYYY년 MM월 DD일` 날짜 파싱)
  - 보장금액 추출
- [x] 텍스트 및 이미지 OCR 파일 판독 연동:
  - 텍스트 파일: 직접 비동기 읽기
  - 이미지 파일: `tesseract.js` 한글/영어 OCR 판독

### 2. 증권 파싱 API 구현 (`DocumentController`)
- [x] `POST /documents/:id/parse` 엔드포인트:
  - Row-level 본인 소유권 검증 및 패턴 매칭 엔진 실행
  - DB `Document` 레코드의 `ocrText` 및 `parsedData` 갱신
  - 공통 응답 포맷(`ApiResponse<DocumentParseResponse>`) 반환
- [x] `POST /documents/sample/parse` 엔드포인트:
  - 가상 모의 증권 샘플 프리셋을 즉시 파싱하여 결과 반환 (원클릭 테스트용)

### 3. 품질 검증 및 단위 테스트
- [x] `DocumentParserService` 단위 테스트(`document-parser.service.spec.ts`) 작성 및 정확도 검증
- [x] `DocumentController` 및 `DocumentService` 파싱 단위 테스트 통과 (Jest 19개 스위트, 99개 테스트 100% Pass)
