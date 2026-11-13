> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 19-03: 모바일 인증 플로우 & 세션 유지 (Auth Navigation & Remember Me)

## 📌 목표 및 개요
앱 실행 시 스마트폰 영구 저장소를 조회하여, 비로그인 상태일 경우 '로그인 화면(LoginScreen)'을 첫 화면(랜딩)으로 렌더링하고, 로그인 상태 유지(Remember Me) 및 자동 로그인 네비게이션 플로우를 구축합니다.
- 모바일 표준 `RootNavigator`: `isAuthenticated` 상태에 따른 `Login` vs `MainTabs` 조건부 스위칭
- `LoginScreen`: Boim 브랜드 로고, 이메일/비밀번호 폼(키보드 회피), '로그인 상태 유지' 토글, 간편 로그인 UI
- 실제 백엔드 API (`POST /api/auth/login`) 연동 및 DB 공식 시드 계정(`test@boim.com` / `password123`) bcrypt 검증
- 모바일 전용 안전 저장소(`safeStorage`) 기반 세션 및 Remember Me 설정 보관
- 마이페이지 로그아웃 터치 시 세션 삭제 및 로그인 첫 화면 복귀, 테스트 계정 인식표 뱃지 부착
- 엄격한 TypeScript 타입 무결성 및 군더더기 없는 순수 코드 작성

---

## 📋 세부 체크리스트

- [x] **1. 모바일 저장소 라이브러리 설치 및 인증 스토어 구축**
  - [x] `@react-native-async-storage/async-storage` 설치 완료
  - [x] 모바일 인증 스토어(`apps/mobile/src/store/authStore.ts`) 구현 (Remember Me 플래그 및 세션 영구 저장/불러오기)

- [x] **2. 모바일 전용 `LoginScreen` 네이티브 화면 구현 (`apps/mobile/src/screens/LoginScreen.tsx`)**
  - [x] Boim 심볼 로고 ('B') 및 슬로건 헤더
  - [x] 이메일/비밀번호 입력 폼 (키보드 대응 `KeyboardAvoidingView`, 비밀번호 표시 토글)
  - [x] 실제 백엔드 HTTP 통신 (`apps/mobile/src/api/authApi.ts`) 연동
  - [x] '로그인 상태 유지 (기기 기억)' 스위치 토글
  - [x] 로그인 버튼 및 카카오/네이버 간편 로그인 네이티브 버튼
  - [x] 정갈한 플레이스홀더 및 회원가입 안내 링크

- [x] **3. RootNavigator 조건부 라우팅 연동 (`apps/mobile/src/navigation/RootNavigator.tsx`)**
  - [x] `RootNavigator`에서 `useMobileAuth`의 `isAuthenticated` 및 `isLoading` 상태 구독
  - [x] `isAuthenticated === false` ➔ `LoginScreen` (첫 진입 랜딩)
  - [x] `isAuthenticated === true` ➔ `TabNavigator` (메인 4대 탭)
  - [x] `App.tsx` 진입점에 `RootNavigator` 탑재

- [x] **4. 마이페이지 로그아웃 연동 및 자동 로그인 검증**
  - [x] `MyPageScreen` 로그아웃 시 세션 삭제 및 로그인 화면으로 즉시 안전 복귀
  - [x] `test@boim.com` 등 테스트 계정 로그인 시 `[테스트 계정]` 인식표 뱃지 노출
  - [x] `Remember Me` 활성화 시 앱 재시작 후 자동 로그인 세션 복원 지원

- [x] **5. 모바일 컴파일 및 실기기(Expo Go) 검증**
  - [x] `pnpm --filter @boim/mobile typecheck` 0 에러 확인
  - [x] 백엔드 192개 테스트 및 웹 207개 테스트 100% Pass 확인
  - [x] 실기기 스마트폰(Expo Go)에서 실제 로그인 ➔ 메인 탭 ➔ 마이페이지 ➔ 로그아웃 플로우 최종 검증 완료
