> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 21-02: 문서/증권 분석 API 및 업로더 잔여 Mock 용어 정제

## 📌 작업 개요
문서/증권 분석 파이프라인의 임시/모의(Mock) 명칭을 서비스 온보딩 및 실사용자 경험에 걸맞은 '온보딩 샘플(Sample/Preset)' 표준 명칭으로 정제하고, 프론트/백엔드 인터페이스 간 하위 호환성을 보장합니다.

---

## 📋 세부 체크리스트

### 1. `PolicyDocumentUploader.tsx` 온보딩 UX 문구 정제
- [x] 버튼 문구 정제: "🧪 가상 모의 증권 샘플로 원클릭 분석해보기" -> "📄 온보딩 샘플 증권으로 원클릭 분석해보기"
- [x] 상태 안내 메시지 정제: "모의 증권 샘플 계약 정보를 분석 중입니다..." -> "샘플 증권 계약 정보를 분석 중입니다..."

### 2. 백엔드 및 쿼리 훅 인터페이스 용어 정제
- [x] `apps/api/src/document/document.service.ts`: `getSamplePreset()` 응답에 `presetData` 필드 추가 및 `mockData` 하위 호환 보장
- [x] `apps/web/src/api/useDocumentQueries.ts`: `useGetSamplePreset`의 반환 타입에 `presetData?: ParsedInsuranceData; mockData?: ParsedInsuranceData;` 정식 반영

### 3. 테스트 코드 검증 및 빌드 확인
- [x] `PolicyDocumentUploader.test.tsx` 내 버튼 텍스트 매처 최신화
- [x] `useDocumentQueries.spec.ts` 검증 (통과)
- [x] 전사 테스트 스위트 통과 확인 (FE 211개 + BE 205개 = 총 416개 100% Pass)
