> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 18: Expo(React Native) 기반 모바일 앱 구축 및 패키징 (Mobile Application)

## 📌 목표 및 개요
Docker 컨테이너화 및 배포 파이프라인(Phase 17) 완료 후, 모노레포(`apps/mobile`)에 Expo SDK 기반 React Native 앱을 구축합니다. 기존 백엔드 API와 `packages/shared-types`를 100% 재사용하며, 캘린더/보험 목록/AI 리포트/계정 관리 4대 핵심 화면을 네이티브 UI로 포팅하고 스마트폰 설치용 APK 및 Expo 빌드를 완성합니다.

---

## 📋 세부 체크리스트

### 1. Phase 18-01: 모노레포 Expo(React Native) 프로젝트 세팅 및 기반 구축
- [ ] `apps/mobile` 패키지 신설 (Expo SDK + Expo Router + NativeWind/StyleSheet)
- [ ] 모노레포 의존성 구성 및 `packages/shared-types` 연동
- [ ] 백엔드 API 클라이언트 설정 (개발 서버 IP 통신, JWT 인증 토큰 스토리지 `expo-secure-store`)

### 2. Phase 18-02: 4대 핵심 탭 네이티브 화면 포팅
- [ ] **캘린더 & 납입일 탭**: `react-native-calendars` 기반 월간 캘린더 및 일자별 보험료 납입 일정
- [ ] **내 보험 목록 탭**: 카드 리스트 뷰, 필터링, 보험 상세 조회 및 신규 등록/수정 모달
- [ ] **AI 종합 진단 탭**: AI 분석 점수 카드, 보장 항목별 프로그레스, 네이티브 맞춤 조언 카드
- [ ] **마이페이지 / 계정 설정 탭**: 사용자 프로필, 소셜 계정 연동 현황, 알림 토글 스위치

### 3. Phase 18-03: 모바일 네이티브 UX 및 기기 기능 고도화
- [ ] SafeArea(노치 및 홈 인디케이터) 최적화 및 안드로이드 하드웨어 뒤로가기 제스처
- [ ] 당겨서 새로고침(Pull-to-refresh) 및 오프라인/에러 상태 폴백 UI
- [ ] (선택) 생체인증(`expo-local-authentication`) 간편 잠금해제 연동

### 4. Phase 18-04: 모바일 테스트 및 독립 실행형 패키징 (Build & Packaging)
- [ ] 모바일 컴포넌트 렌더링 단위 테스트 작성
- [ ] 스마트폰 즉시 실행(Expo Go) QR 구동 검증
- [ ] 독립 설치용 Android 바이너리(`.apk`) 빌드 파이프라인 구성 및 최종 검증
- [ ] `CHANGELOG.md` 및 `README.md` 동기화 및 마일스톤 완료 커밋
