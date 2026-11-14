> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 19-05: 모바일 카메라 증권 촬영 OCR 스캔 & 폼 자동완성 연동 (Camera & OCR Prefill)

## 📌 목표 및 개요
스마트폰의 하드웨어 카메라를 활용하여 종이 보험 증권을 즉시 촬영하거나 앨범에서 사진을 선택하고, Boim 백엔드의 Tesseract OCR & 패턴 분석 API(`POST /api/documents/upload` & `POST /api/documents/parse`)와 실시간 통신하여 보험 상품명, 보험사, 월 보험료, 만기일자를 입력 폼에 100% 자동 완성(Prefill)하는 모바일 킬러 기능을 구축합니다.
- `expo-image-picker` 기반의 OS 네이티브 카메라 뷰파인더 촬영 및 앨범 사진 선택
- `app.json`에 안드로이드/iOS 카메라 및 사진 라이브러리 접근 권한 명세
- 백엔드 통신 `documentApi.ts`: 모바일 네이티브 URI 기반 `FormData` 파일 전송 및 JSON 응답 파싱
- `PolicyScannerModal.tsx`: 세련된 바텀 시트 액션(촬영 vs 앨범) 및 스캔 중 회전 스피너 피드백
- 추출된 데이터의 신규 등록 폼 자동 주입 및 캘린더/보험목록 동기화

---

## 📋 세부 체크리스트

- [x] **1. `expo-image-picker` 라이브러리 설치 및 권한 설정**
  - [x] `apps/mobile`에 `expo-image-picker` 설치 (`pnpm --filter @boim/mobile add expo-image-picker`)
  - [x] `apps/mobile/app.json`에 카메라(`NSCameraUsageDescription`, `CAMERA`) 및 사진 라이브러리 권한 설정 완료

- [x] **2. 모바일 백엔드 문서 업로드 & OCR 파싱 API 연동 (`apps/mobile/src/api/documentApi.ts`)**
  - [x] 모바일 로컬 파일 URI(`file://...`)를 `FormData`로 래핑하여 백엔드 `POST /api/documents/upload` 전송
  - [x] 업로드된 `documentId`로 `POST /api/documents/:id/parse` 호출하여 파싱된 `ParsedInsuranceData` 획득

- [x] **3. 증권 촬영/선택 모달 컴포넌트 구현 (`PolicyScannerModal.tsx`)**
  - [x] 카메라 촬영(`launchCameraAsync`) 및 앨범 선택(`launchImageLibraryAsync`) 인터랙션
  - [x] 사진 크롭(자르기) 및 가로세로 비율 최적화 (`aspect: [4, 3]`, `quality: 0.8`)
  - [x] OCR 분석 진행 중 네이티브 스피너 및 진행 상태 텍스트("AI OCR 엔진이 증권 내용을 분석 중입니다...") 노출

- [x] **4. 보험 등록 폼 모달 및 자동완성 연동 (`InsuranceAddModal.tsx`)**
  - [x] 추출된 데이터(보험사, 상품명, 카테고리, 월납입액, 만기일) 폼 필드 자동 완성(Prefill)
  - [x] 사용자의 직접 수정 및 `[내 보험으로 등록하기]` 시 캘린더 및 내 보험 목록에 실시간 추가

- [x] **5. 타입 검증, 품질 검사 및 브리핑 후 커밋 승인 요청**
  - [x] `pnpm --filter @boim/mobile typecheck` 0 에러 확인
  - [x] 전사 테스트 스위트 통과 검증
  - [x] 학습용 구현 설명 브리핑 및 사용자 승인 하 커밋 대기
