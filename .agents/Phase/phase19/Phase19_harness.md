> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 19: Expo(React Native) 기반 모바일 앱 구축 및 패키징 (Mobile Application)

## 📌 목표 및 개요
Boim 모노레포 아키텍처에 `apps/mobile` 패키지를 신설하고, Expo(React Native)와 TypeScript를 기반으로 스마트폰 환경에 최적화된 크로스 플랫폼(iOS / Android) 네이티브 모바일 애플리케이션을 구축합니다.
- 모노레포 공통 패키지(`@boim/shared-types`) 100% 재사용으로 백엔드 API와의 타입 동기화 유지
- Expo Go 환경을 통한 실시간 모바일 핫 리로딩(HMR) 및 스마트폰 즉시 시연 체계 구축
- 4대 핵심 탭(보험 캘린더, 내 보험 목록, AI 진단 리포트, 마이페이지) 네이티브 UI 구현
- 상단 노치(`SafeAreaView`), 제스처, Pull-to-refresh 등 모바일 네이티브 UX 완성
- 스마트폰에 직접 설치 가능한 독립 실행형 안드로이드 패키지(`.apk`) 빌드 체계 확립

---

## 📋 Phase 19 종합 체크리스트

- [x] **Phase 19-01: `apps/mobile` 프로젝트 세팅 및 모노레포 연동** (완료)
  - [x] 모노레포 루트 `pnpm-workspace.yaml`에 `apps/mobile` 등록 확인
  - [x] Expo SDK 58 / React Native 환경 템플릿 세팅
  - [x] `@boim/shared-types` 의존성 연결 및 타입 참조 검증
  - [x] Metro 번들러 모노레포 심볼릭 링크 호환 설정 (`metro.config.js`)

- [x] **Phase 19-02: 4대 핵심 탭 네이티브 UI 포팅 (Navigation & Screens)** (완료)
  - [x] React Navigation 기반 플로팅 캡슐 하단 탭 바 (`TabNavigator`) 구축
  - [x] 탭 1 (`CalendarScreen`): 월간 보험료 납입일/만기일 캘린더 네이티브 뷰
  - [x] 탭 2 (`InsuranceListScreen`): 내 가입 보험 카드 리스트 및 카테고리 필터
  - [x] 탭 3 (`DiagnosisScreen`): Gemini AI 85점 보장 적정도 게이지 및 리모델링 조언 카드
  - [x] 탭 4 (`MyPageScreen`): 사용자 프로필, 간이 인증 상태, 설정 메뉴

- [x] **Phase 19-03: 모바일 인증 플로우 & 세션 유지 (Auth Navigation & Remember Me)** (완료)
  - [x] `safeStorage` 기반 세션 및 Remember Me 영구 보관
  - [x] `LoginScreen` 네이티브 화면 및 실제 백엔드 API 연동
  - [x] `RootNavigator` 조건부 라우팅 (비로그인 ➔ 로그인 화면, 로그인 ➔ 메인 탭)
  - [x] 실기기(Expo Go) QA 및 테스트 계정 인식표 부착

- [x] **Phase 19-04: 모바일 네이티브 UX 고도화 (SafeArea, Gestures, Feedback)** (완료)
  - [x] 스마트폰 상단 노치 / 카메라 홀 / 하단 바 대응 (`SafeAreaView`, Insets)
  - [x] 당겨서 새로고침 (Pull-to-Refresh: `RefreshControl`) 4대 탭 적용
  - [x] 카드 및 버튼 터치 인터랙션 피드백 (`Pressable` Active 효과)
  - [x] 긴 보험 상품명 말줄임(`numberOfLines={1}`) 및 레이아웃 밀림 방지

- [x] **Phase 19-05: 모바일 카메라 증권 촬영 OCR 스캔 & 폼 자동완성 연동 (Camera & OCR Prefill)** (완료)
  - [x] `expo-image-picker` 라이브러리 설치 및 카메라/갤러리 권한 명세
  - [x] 모바일 `FormData` 기반 백엔드 문서 업로드 & 파싱 API (`documentApi.ts`)
  - [x] 바텀 시트 증권 스캐너 모달 (`PolicyScannerModal.tsx`)
  - [x] 신규 보험 등록 폼 자동완성(Prefill) 모달 (`InsuranceAddModal.tsx`)

- [ ] **Phase 19-06: 모바일 테스트 및 독립 실행형 APK 빌드 가이드**
  - [ ] React Native Testing Library 기반 모바일 컴포넌트 단위 테스트
  - [ ] EAS Build 또는 로컬 Expo 빌드를 통한 스마트폰 설치용 `.apk` 패키징 가이드 문서화
  - [ ] 품질 검증, 패치노트 동기화 및 사용자 승인 하 최종 커밋 진행
