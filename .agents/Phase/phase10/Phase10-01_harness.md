> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것

# Phase 10-01: 백엔드 증권 파일 업로드 & Document 모델 및 API 구현

## 🎯 목표
사용자가 보험 증권 파일(PDF, PNG, JPG)을 안전하게 업로드할 수 있는 백엔드 인프라를 구축하고, 사용자 소유권(Row-level 권한 통제)을 보장하는 `Document` 데이터 모델 및 업로드 API를 구현합니다.

---

## ✅ 체크리스트

### 1. 데이터 모델 및 타입 정의
- [x] `packages/shared-types`: `DocumentDto`, `ParsedInsuranceData`, `DocumentUploadResponse`, `DocumentParseResponse` 인터페이스 정의 보강
- [x] `apps/api/prisma/schema.prisma`:
  - `Document` 모델에 `userId BigInt` 필드 추가 (소유권 통제용)
  - `productId BigInt?`로 nullable 수정 (상품 등록 전 사전 업로드 지원)
  - `User` 모델과의 `@relation` 연결
  - `prisma generate` 실행

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
- [x] 유효하지 않은 파일 포맷/초과 용량에 대한 표준 예외(`BadRequestException`, 공통 에러 포맷) 처리

### 4. 품질 검증 (테스트 & 린트)
- [x] `DocumentService` 및 `DocumentController` 단위 테스트(`document.service.spec.ts`, `document.controller.spec.ts`) 작성
- [x] 단위 테스트 통과 (Jest 18개 스위트, 98개 테스트 100% Pass)
- [x] 린트 및 빌드 검증 후 커밋
