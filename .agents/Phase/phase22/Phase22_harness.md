> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것

# Phase 22: AI 진단 모델 동적 탐색 및 다단계 폴백 구조 개선

## 🎯 목표
- `gemini-3.5-flash-lite` 등 특정 버전 모델명 하드코딩 의존성을 제거합니다.
- **1단계(최신 Gemini 모델 시도) → 2단계(하위/대체 모델 순차 시도) → 3단계(RuleBasedDiagnosisEngine 폴백)** 구조로 안정성과 미래 호환성을 확보합니다.

---

## 📋 작업 체크리스트

- [x] **Phase 22-01:** `AiDiagnosisService` 다단계 모델 탐색 및 폴백 파이프라인 구현
  - [x] `@google/genai` `models.list()` 기반 사용 가능 모델 동적 조회 및 TTL 캐싱
  - [x] 버전·티어 기반 최신 → 하위 모델 우선순위 정렬 로직 구현
  - [x] `GEMINI_MODEL` / `GEMINI_FALLBACK_MODELS` 환경변수 오버라이드 및 정적 기본 체인(`gemini-flash-latest` 등) 지원
  - [x] 최신 모델 실패 시 하위 모델 순차 재시도, 전체 실패 시 `RuleBasedDiagnosisEngine` 폴백
- [x] **Phase 22-02:** 환경변수 템플릿 업데이트 및 단위 테스트 작성
  - [x] `apps/api/.env.example`에 선택적 모델 설정 안내 추가
  - [x] `ai-diagnosis.service.spec.ts`에 최신→하위 모델 폴백, 동적 모델 목록 정렬, 전체 실패 시 규칙 기반 폴백 테스트 추가
- [x] **Phase 22-03:** 검증 및 문서 동기화
  - [x] `@boim/api` 테스트(24/24 Pass), 타입체크(`tsc --noEmit`), 린트 통과 확인
  - [x] `.agents/Phase/Phase_harness.md` 및 `CHANGELOG.md` 최신화
