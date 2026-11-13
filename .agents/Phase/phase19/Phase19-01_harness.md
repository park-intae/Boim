> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 19-01: `apps/mobile` 프로젝트 세팅 및 모노레포 연동

## 📌 목표 및 개요
Boim 모노레포 구조(`apps/api`, `apps/web`)에 세 번째 패키지인 `apps/mobile`을 신규 생성하고, Expo(React Native) 및 TypeScript 개발 환경을 세팅합니다.
- pnpm 모노레포 환경에서 Expo 번들러(Metro)가 호스트의 심볼릭 링크와 루트 `node_modules`를 올바르게 인식하도록 `metro.config.js` 구성
- `@boim/shared-types` 모노레포 워크스페이스 의존성을 연결하여 백엔드 DTO 및 데이터 규격을 모바일에서도 100% 동일하게 공유
- 기본 진입점(`App.tsx`)에 Boim 모바일 앱 시작 화면을 구현하고, 모바일 빌드 및 타입 검증 무결성 확보

---

## 📋 세부 체크리스트

- [x] **1. 모노레포 워크스페이스 및 디렉토리 구조 설정**
  - [x] `pnpm-workspace.yaml`에 `apps/mobile` 포함 여부 확인 (`apps/*` 매칭)
  - [x] `apps/mobile` 패키지 디렉토리 생성
  - [x] `apps/mobile/package.json` 작성 (Expo SDK 52, React Native 0.76.6, TypeScript, `@boim/shared-types`)

- [x] **2. Metro 번들러 및 TypeScript 설정**
  - [x] `apps/mobile/tsconfig.json` 작성 (React Native / Expo 프리셋)
  - [x] `apps/mobile/metro.config.js` 작성 (pnpm 모노레포 심볼릭 링크 및 워크스페이스 패키지 해석 지원)
  - [x] `apps/mobile/app.json` 작성 (앱 이름 "Boim", 번들 식별자 `com.boim.app`, 아이콘/스플래시 메타)

- [x] **3. 기본 네이티브 진입점 화면 구현 (`App.tsx`, `index.js`)**
  - [x] React Native 코어 컴포넌트(`<SafeAreaView>`, `<View>`, `<Text>`, `<StatusBar>`, `<StyleSheet>`) 활용
  - [x] Boim 시그니처 'B' 브랜드 로고 및 모바일 시작 환영 뷰 렌더링
  - [x] `@boim/shared-types` DTO 타입(`InsuranceProductDto`) 정상 import 및 바인딩 확인

- [x] **4. 의존성 무결성 설치 및 모바일 타입 검증**
  - [x] `pnpm install`을 통한 모바일 워크스페이스 의존성 해결 (512개 패키지 추가)
  - [x] `pnpm --filter @boim/mobile typecheck`를 통한 TypeScript 컴파일 무결성 검증 (0 에러)
  - [x] 모노레포 `pnpm build` 연계 검증 통과 (0 에러)
  - [x] 하네스 완료 체크 및 사용자 브리핑 후 커밋 진행
