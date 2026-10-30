> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것

# Phase 10: 보험 증권 파일 업로드 & AI(OCR + Gemini) 자동 분석 및 입력

본 문서는 사용자가 보유한 보험 증권(PDF/이미지) 파일을 안전하게 업로드하고, OCR(Tesseract.js) 및 Gemini AI 엔진을 통해 보험 계약 정보를 자동 추출하여 간편하게 등록할 수 있도록 하는 Phase 10의 마스터 하네스입니다.

---

## 🎯 핵심 목표 및 개요
1. **증권 문서 모델 및 안전 업로드 파이프라인 구축 (`Multer`, `Document` 모델)**
   - 증권 파일(PDF, PNG, JPG/JPEG) 안전 업로드 및 용량/MIME 검증
   - 개인정보 보호를 위한 비식별화 가상 모의 증권 샘플 프리셋 지원
2. **AI 파싱 엔진 구축 (OCR + Gemini / Mock 파서 스위칭)**
   - `Tesseract.js` OCR을 통한 문서 텍스트 추출
   - `Gemini API`를 활용한 비정형 텍스트 구조화 (보험사, 상품명, 카테고리, 월납입액, 만기일 등 JSON 파싱)
   - 개발/테스트 환경 및 API Key 부재 시 즉시 동작하는 모의 파서(Mock Parser) 스위칭 지원
3. **사용자 경험(UX) 최적화 및 폼 자동 입력(Prefill)**
   - 증권 업로드 Drag & Drop UI 및 진행 상태(OCR 추출 -> AI 구조화) 시각화
   - 원클릭 `[샘플 증권으로 분석해보기]` 프리셋 테스트 기능 제공
   - 파싱 결과를 우측 패널의 `InsuranceForm`에 자동 채우기(Prefill)하여 원클릭 등록 연동

---

## 🗺️ 세부 단계별 로드맵

- [x] **Phase 10-01: 백엔드 증권 파일 업로드 & Document 모델 확장 및 API 구현**
- [ ] **Phase 10-02: 백엔드 OCR(Tesseract.js) & Gemini AI 파싱 서비스 구현**
- [ ] **Phase 10-03: 프론트엔드 증권 업로드 UI & 모의 샘플 프리셋 컴포넌트 구현**
- [ ] **Phase 10-04: AI 파싱 결과 폼 자동 채우기(Prefill) 및 엔드투엔드 통합 검증**
