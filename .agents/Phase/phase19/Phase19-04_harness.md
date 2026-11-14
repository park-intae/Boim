> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 19-04: 모바일 네이티브 UX 고도화 (SafeArea, Gestures, Feedback)

## 📌 목표 및 개요
스마트폰 실기기 환경(iOS 노치/다이내믹 아일랜드, Android 펀치홀/시스템 내비게이션 바)에서 최상의 모바일 네이티브 사용자 경험(UX)을 제공하기 위해 세밀한 인터랙션과 기기 대응 처리를 적용합니다.
- 기기 영역 보호: `useSafeAreaInsets` 기반의 안전 여백(Safe Margin) 및 상/하단 클리핑 방지
- 제스처 인터랙션: 스크롤 화면 전체에 '당겨서 새로고침 (`RefreshControl`)' 도입
- 터치 시각 피드백: 모든 클릭 가능한 요소(보험 카드, 카테고리 칩, 진단 버튼 등)에 `Pressable` 기반의 즉각적 투명도/배경 피드백(`active: opacity 0.7`) 제공
- 비동기 로딩 스피너 및 알림 피드백: 데이터 요청 시 네이티브 `ActivityIndicator` 및 네트워크 연결 상태 안내

---

## 📋 세부 체크리스트

- [x] **1. 기기 상/하단 안전 여백(SafeArea) 일원화 및 규격화**
  - [x] `CalendarScreen`, `InsuranceListScreen`, `DiagnosisScreen`, `MyPageScreen`, `LoginScreen` 상단 패딩 점검
  - [x] 하단 플로팅 탭 바와 스크롤뷰 최하단 콘텐츠 간의 패딩(`paddingBottom: 110`) 확보로 겹침 현상 원천 차단

- [x] **2. 4대 핵심 탭 '당겨서 새로고침 (`RefreshControl`)' 제스처 구현**
  - [x] `CalendarScreen`: 당겨서 새로고침 시 월간 일정 및 납입 데이터 시뮬레이션 리로드
  - [x] `InsuranceListScreen`: 당겨서 새로고침 시 가입 보험 목록 데이터 리로드
  - [x] `DiagnosisScreen`: 당겨서 새로고침 시 AI 보장 분석 및 점수 재연산
  - [x] `MyPageScreen`: 당겨서 새로고침 시 프로필 정보 및 세션 상태 동기화

- [x] **3. 터치 인터랙션 및 시각 피드백(`Pressable`) 고도화**
  - [x] 기존 정적인 `<TouchableOpacity>`를 최신 `Pressable`의 `({ pressed })` 스타일로 전환
  - [x] 터치 시각 효과: 칩 버튼 및 액션 카드에 부드러운 스케일(`scale: 0.96~0.98`) 및 투명도 피드백 부여

- [x] **4. 비동기 로딩 상태 및 빈 상태 인터랙션 고도화**
  - [x] 새로고침/로딩 중일 때 네이티브 `ActivityIndicator` 색상 테마(#4f46e5) 적용
  - [x] 표준 스키마(`@boim/shared-types`)에 100% 부합하는 모바일 초기 시드 데이터(`mockData.ts`) 연결

- [x] **5. 타입 검증, 품질 테스트 및 브리핑 후 커밋 승인 요청**
  - [x] `pnpm --filter @boim/mobile typecheck` 무결성 검증 (0 에러)
  - [x] 전사 단위/통합 테스트 (FE/BE) 무결성 확인
  - [x] 상세 구현 설명 브리핑 및 사용자 승인 하 커밋 대기
