> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 및 백엔드(@[.agents/BACKEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 20-01: Google Gemini AI 실시간 종합 보장 진단 API 연동 & 장애 폴백 검증

## 📌 목표 및 개요
현재 백엔드 `AiDiagnosisService`는 `GEMINI_API_KEY`가 주입되지 않아 100% 로컬 룰 기반 가짜 엔진으로만 동작하고 있습니다.  
이 단계에서는 실제 Google Gemini API 키 환경변수를 수립하고, 최신 `@google/genai` SDK를 통해 실제 Gemini 모델(`gemini-2.5-flash` 등)을 호출하여 실제 AI 기반의 진단 점수, 보장 과다/공백 분석, 맞춤형 리모델링 조언을 실시간 추출하도록 연동합니다.  
동시에 외부 AI API의 일시적 장애나 쿼터 소진 시 `RuleBasedDiagnosisEngine`으로 0.1초 만에 안전 전환되는 무중단 폴백을 철저히 검증합니다.

---

## 📋 세부 단계별 체크리스트

### 1단계: Gemini API 설정 및 환경 변수 수립
- [x] `apps/api/.env` 및 `docker-compose.yml`에 `GEMINI_API_KEY` 주입 구조 확립
- [x] Google AI Studio에서 발급받은 실제 API 키 연동
- [x] NestJS `AiDiagnosisService` 생성자에서 `GoogleGenAI` 클라이언트 초기화 및 상태 로깅 검증

### 2단계: 최신 모델 연동 및 프롬프트 엔지니어링 고도화
- [x] `apps/api/src/analysis/ai-diagnosis.service.ts`의 `executeGeminiDiagnosis` 모델 최신화 (`gemini-3.5-flash-lite` ➔ `gemini-3.5-flash` 순차 탐색)
- [x] 10대 카테고리(건강/종합, 암, 종신, 운전자, 치아, 어린이, 화재, 펫, 연금, 기타) 보장 데이터가 반영된 정밀 프롬프트 튜닝
- [x] AI 응답 JSON 스키마 유효성 검증 (`InsuranceDiagnosisDto` 규격 매핑) 및 마크다운 백틱(```json) 자동 정제

### 3단계: 고가용성 장애 폴백(Fallback) 방어 체계 검증
- [x] 유효하지 않은 API 키 또는 네트워크 타임아웃 발생 시 `RuleBasedDiagnosisEngine`으로 무중단 자동 전환 단위 테스트 검증
- [x] 실제 Google Gemini API 실시간 호출 테스트 및 전문가급 진단 리포트(`isFallback: false`) 생성 검증

### 4단계: 테스트 및 빌드 무결성 검증
- [x] `pnpm --filter @boim/api test src/analysis/ai-diagnosis.service.spec.ts` 단위 테스트 100% 통과 (6 Tests PASS)
- [x] 백엔드 Docker 이미지 재빌드 및 컨테이너 실기동 초기화 완료
- [ ] 작업 완료 후 사용자 승인 하 커밋 진행
