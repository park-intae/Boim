> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 및 백엔드(@[.agents/BACKEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 19-07: 실시간 인앱 뷰파인더 & 무수동 오토 스캔 (Real-time Viewfinder & Auto-Capture OCR)

## 📌 목표 및 개요
기존의 수동 셔터 방식인 `expo-image-picker`를 제거하고, 최신 인앱 카메라 라이브러리인 `expo-camera`(`CameraView`)로 완전 교체합니다. 
스마트폰 화면에 증권 가이드 박스를 띄우고, 문서를 프레임 안에 맞추기만 하면 셔터를 누를 필요 없이 **자동 감지 ➔ 오토 캡처 ➔ 실시간 백엔드 OCR 파싱 ➔ 등록 폼 자동완성**이 이뤄지는 차세대 제로 클릭(Zero-click) 스캐너를 구현합니다.

---

## 📋 세부 단계별 체크리스트

### 1단계: 기존 `expo-image-picker` 제거 및 `expo-camera` 패키지 교체
- [x] `pnpm --filter @boim/mobile remove expo-image-picker` 실행
- [x] `pnpm --filter @boim/mobile add expo-camera` 설치 (Expo SDK 58 호환 버전)
- [x] `apps/mobile/app.json` 플러그인 설정 갱신 (`expo-camera` 권한 선언)

### 2단계: 실시간 뷰파인더 & 오토 스캐너 컴포넌트 (`AutoPolicyScannerModal.tsx`) 신규 구현
- [x] `CameraView` 기반 인앱 풀스크린 뷰파인더 렌더링 및 카메라 권한 획득 처리 (`useCameraPermissions`)
- [x] 증권 조준용 반투명 마스크 & 사각 가이드 테두리 렌더링
- [x] 상하로 왕복하는 네온 스캔 레이저 바 애니메이션 (`Animated.timing`)
- [x] **오토 캡처(Auto-shutter) 엔진 구현:**
  - 뷰파인더 안정화 감지 타이머 (조준 후 1.5초 안정 유지 시 자동 트리거)
  - 감지 시 가이드 박스 초록색 전환 + 사운드/시각적 피드백
  - `cameraRef.current.takePictureAsync()` 비동기 자동 호출
  - 웹/시뮬레이터 환경 및 샘플 체험을 위한 [샘플 증권 자동 감지 체험] 지원

### 3단계: 보험 등록 플로우 및 모달 전면 연동
- [x] `InsuranceAddModal.tsx`에서 구형 `PolicyScannerModal` 참조를 제거하고 `AutoPolicyScannerModal`로 연결
- [x] 자동 캡처된 이미지를 기존 백엔드 OCR 파이프라인(`documentApi.uploadPolicyImage` & `parsePolicyDocument`)으로 전송
- [x] 텍스트 파싱 결과로 보험 등록 폼 자동 채움(Prefill) 및 사용자 검토 후 즉시 저장
- [x] 기존 더 이상 쓰이지 않는 구형 `PolicyScannerModal.tsx` 정리

### 4단계: 무결성 검증, 학습 브리핑 및 커밋 승인
- [x] `pnpm --filter @boim/mobile typecheck` 0 에러 무결성 통과
- [x] 전사 단위/통합 테스트 (FE/BE) 무결성 통과 (BE 193개, FE 207개 100% Pass)
- [x] 대한민국 10대 표준 보험 카테고리 체계 확장 및 모바일/백엔드 전면 동기화
- [x] 고해상도 카메라 업로드 호환(`expo-file-system` File Blob, 30MB 확장)
- [x] OCR 파서 노이즈 방어 및 한국 표준 보험 상품명 추출 강화
- [x] 실제 증권 이미지(`한빛손해보험 보험증서 안내.png`) 실기기 테스트 및 검증 완료
- [ ] 학습용 메커니즘 브리핑 및 사용자 승인 하 커밋 진행
