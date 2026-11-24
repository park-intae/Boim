> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 시작 전 백엔드 작업은 @[.agents/BACKEND_HARNESS.md]를 반드시 숙독하고 지침을 준수할 것

# Phase 24-02: 백엔드 InsuranceProduct · Document · Parser 실패·경계값 테스트 보강

## 🎯 세부 목표
- 보험 상품 CRUD의 날짜·금액 경계값과 문서 업로드·OCR 파싱 실패 및 정규식 엣지케이스를 테스트로 완전히 커버합니다.

## 📋 작업 체크리스트
- [ ] **InsuranceProduct 도메인 (`insurance-product.service.spec.ts`, `insurance-product.controller.spec.ts`)**
  - [ ] `create`/`update`: 필수 문자열 공백 입력(`BadRequestException`), `maturityDate < startDate` 역전 및 단일 필드 수정 시 역전, `startDate === maturityDate` 경계, `0`원/`NaN`/`Infinity` 금액 경계, `update`/`remove` 미존재 ID `NotFoundException`, `dto.userId` 스푸핑 무시 검증
  - [ ] `InsuranceProductController`: `create`/`findOne`/`update`/`remove` `req.user` 누락 시 `UnauthorizedException` 검증
- [ ] **Document & Parser 도메인 (`document.service.spec.ts`, `document.controller.spec.ts`, `document-parser.service.spec.ts`)**
  - [ ] `DocumentService`: `uploadDocument` 파일 크기 초과·`productId` 미존재(`NotFoundException`), `getDocument`/`deleteDocument`/`parseDocument` 미존재(`NotFoundException`) 및 타인 접근(`ForbiddenException`), `getUserDocuments` 빈 목록, `parseSampleDocument` 샘플 파일 미존재 폴백 검증
  - [ ] `DocumentController`: `getDocument` 테스트 및 인증 엔드포인트 `req.user` 누락 시 `UnauthorizedException` 검증
  - [ ] `DocumentParserService`: `extractTextFromFile` 파일 미존재·`.txt` 읽기·OCR 호출·`ocrImage` 실패 시 `BadRequestException` 및 `worker.terminate()` 보장, `parseInsuranceText` 빈 텍스트/미분류 카테고리/단일 날짜(+10년)/범위 밖 `paymentDay`(0, 32일)/금액 경계(`5,000~3,000,000`, 억·천만 단위) 검증
- [ ] **검증 및 커밋:** `@boim/api` ESLint + Jest 전체 Pass 확인 후 `(Phase 24-02)` 커밋
