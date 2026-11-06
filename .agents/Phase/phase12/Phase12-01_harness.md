> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 12-01: 백엔드 Gemini AI 보험 종합 진단 엔진 및 API 구현

## 📌 목표
사용자의 가입 보험 데이터를 취합하여 Google Gemini AI SDK(`@google/genai`)를 활용해 보장의 적정성(과다/부족)을 분석하고,
종합 점수와 1:1 맞춤형 리모델링 조언을 구조화된 JSON 형태로 생성하는 백엔드 AI 진단 엔진 및 API를 구현합니다.
또한 Gemini API 키가 없거나 외부 통신 장애 발생 시에도 서비스가 중단되지 않도록 규칙 기반 폴백(Fallback) 엔진을 함께 구축합니다.

---

## 📋 세부 체크리스트

### 1. 공유 타입 및 DTO 정의 (`packages/shared-types`)
- [x] `InsuranceDiagnosisDto` 인터페이스 정의
  - `score`: 종합 점수 (0 ~ 100)
  - `grade`: 등급 ('EXCELLENT' | 'GOOD' | 'NORMAL' | 'NEEDS_ATTENTION' | 'WARNING')
  - `summary`: 종합 한줄 평
  - `totalMonthlyPayment`: 총 납입액
  - `categoryEvaluations`: 카테고리별 평가 배열 (`category`, `status`, `currentAmount`, `recommendedAmount`, `comment`)
  - `strengths`: 잘 설계된 보장 포인트 목록 (`string[]`)
  - `improvements`: 보완이 필요한 포인트 목록 (`string[]`)
  - `costSavingTips`: 월 보험료 절감 팁 목록 (`string[]`)
  - `generatedAt`: 진단 생성 시각
  - `isFallback`: AI 생성 여부 또는 규칙 기반 모의 여부 (`boolean`)

### 2. 백엔드 AI 진단 서비스 구현 (`apps/api`)
- [x] `apps/api/src/analysis` 모듈 생성 및 `AppModule` 등록
- [x] `AiDiagnosisService` 구현:
  - 사용자 ID 기반 가입 보험 목록 조회 (`prisma.insuranceProduct.findMany`)
  - 프롬프트 구성: 대한민국 3040 표준 권장 보장 기준(실손 5천만원, 암진단 3천~5천만원, 뇌/심장 2천~3천만원, 사망 1억원 등)과 사용자 가입 현황 비교
  - `@google/genai` 연동 (`GoogleGenAI` SDK 사용, `GEMINI_API_KEY` 환경변수 연동)
  - 안전한 JSON 파싱 및 응답 규격 보장
  - **무결점 폴백 엔진**: `GEMINI_API_KEY` 미설정 또는 호출 실패 시 정교한 규칙 기반(Rule-based) 알고리즘으로 `InsuranceDiagnosisDto` 정상 생성
- [x] `AnalysisController` 엔드포인트 구현:
  - `POST /analysis/ai-diagnosis` & `GET /analysis/ai-diagnosis`: 본인 인증 가드(`OptionalJwtAuthGuard`) 및 진단 실행
  - Swagger 문서화 (`@ApiOperation`, `@ApiResponse`)

### 3. 단위 테스트 작성 및 품질 검증
- [x] `ai-diagnosis.service.spec.ts` 단위 테스트 작성
  - 보험 데이터가 있을 때 정상 진단 결과 생성 검증
  - Gemini AI 호출 성공 시 AI 결과 반환 검증
  - API 키 누락 또는 외부 에러 시 규칙 기반 폴백 정상 동작 검증
  - 가입 보험이 없을 때의 Empty 상태 예외/안내 검증
- [x] `analysis.controller.spec.ts` 단위 테스트 작성
- [x] 전사 테스트 및 린트 검증 (100% Pass)
- [x] git commit (`feat(api): Phase 12-01 Gemini AI 보험 종합 진단 엔진 및 API 구현`)
