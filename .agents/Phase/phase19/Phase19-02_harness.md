> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 19-02: 4대 핵심 탭 네이티브 UI 포팅 (Navigation & Screens)

## 📌 목표 및 개요
Boim 모바일 앱의 뼈대가 되는 하단 탭 네비게이션(Bottom Tab Navigator)을 구축하고, 웹 프론트엔드의 4대 핵심 도메인(보험 캘린더, 내 보험 목록, AI 진단 리포트, 마이페이지)을 모바일 스마트폰 화면에 최적화된 네이티브 스크린으로 포팅합니다.
- 사용자 지정 4단계 파이프라인 준수: **표준 스키마 확인 ➔ 하드코딩 레이아웃 설정 ➔ UI 고도화 ➔ Empty State 구현**
- `@react-navigation/bottom-tabs` 기반 하단 탭 바 인터랙션 및 화면 전환 애니메이션 구성
- 모바일 화면 비율(세로 모드)에 특화된 스크롤 뷰, 카드 레이아웃, 터치 피드백 구현
- 엄격한 TypeScript 타입 안정성 및 군더더기 없는 순수 코드 작성 원칙 준수

---

## 📋 세부 체크리스트

- [x] **1. React Navigation 네비게이션 라이브러리 및 아이콘 의존성 설치**
  - [x] `@react-navigation/native`, `@react-navigation/bottom-tabs` 설치
  - [x] `react-native-screens`, `react-native-safe-area-context` 네이티브 뷰 의존성 설치
  - [x] 모바일 벡터 아이콘 라이브러리 (`@expo/vector-icons`) 연동

- [x] **2. 4대 핵심 탭 스크린 컴포넌트 구현 (`apps/mobile/src/screens/`)**
  - [x] **`CalendarScreen`:** 표준 스키마(`InsuranceProductDto`) 기반 납입일/만기일 계산, 캘린더 그리드, 날짜별 납입 일정 뱃지, Empty State("예정된 보험 일정이 없습니다") 구현
  - [x] **`InsuranceListScreen`:** 상단 총 월납입액 배너, 카테고리 필터 칩, 보험 계약 카드 리스트, Empty State("해당 카테고리의 보험이 없습니다 + 보험 증권 등록하기 버튼") 구현
  - [x] **`DiagnosisScreen`:** 종합 진단 점수(85점 안심 등급) 게이지 카드, 카테고리별 보장 바(적정/부족), 리모델링 조언 카드, Empty State("AI 보장 분석 결과가 없습니다 + AI 종합 진단 시작하기 버튼") 구현
  - [x] **`MyPageScreen`:** 사용자 프로필(`UserDto`), PASS 본인인증 상태 뱃지, 알림 설정 스위치(`NotificationSettingsDto`), Empty State(비로그인 시 "로그인이 필요합니다 + 로그인/회원가입 버튼") 구현

- [x] **3. 하단 탭 네비게이션 오케스트레이션 (`apps/mobile/src/navigation/`)**
  - [x] 탭 라우트 타입 선언 (`RootTabParamList`)
  - [x] 탭 바 활성/비활성 테마 색상(Active: `#4f46e5`, Inactive: `#94a3b8`) 및 탭 아이콘 매핑
  - [x] `App.tsx` 진입점에 `<SafeAreaProvider>`, `<NavigationContainer>` 및 탭 네비게이터 통합

- [x] **4. 모바일 컴파일 및 타입 무결성 검증**
  - [x] `pnpm --filter @boim/mobile typecheck` TypeScript 0 에러 확인
  - [x] Jest 호이스팅 이슈 해결(jest 29.7.0 고정) 및 전사 399개 단위/통합 테스트 100% Pass (FE: 207개, BE: 192개)
  - [x] 하네스 완료 체크 및 사용자 브리핑 후 커밋 승인 대기
