> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 16-02: PWA(Progressive Web App) 오프라인 캐싱 & Manifest 구축

## 📌 목표 및 개요
Boim 보험 캘린더/대시보드를 모바일 및 데스크톱 환경에서 네이티브 앱처럼 설치 및 구동할 수 있도록 PWA(Progressive Web App) 환경을 완비합니다.
- Web App Manifest(`manifest.webmanifest`) 표준 메타데이터(아이콘, 테마색, 디스플레이 모드, 바로가기 등) 작성
- Service Worker(`sw.js`)를 통한 오프라인 정적 자산 캐싱(Cache-First / Stale-While-Revalidate) 및 백엔드 API 네트워크 폴백 처리
- 네트워크 단절(`offline`) 및 복구(`online`)를 실시간 감지하는 `useOnlineStatus` 훅 및 오프라인 알림 배너(`OfflineBanner`) 구현
- 단위 테스트 작성 및 전사 테스트 100% 통과 검증

---

## 📋 세부 단계별 체크리스트

### 1. Web App Manifest 및 앱 메타데이터 구성
- [x] `apps/web/public/manifest.webmanifest` 생성:
  - `name`: "Boim - 똑똑한 개인 보험 캘린더"
  - `short_name`: "Boim"
  - `start_url`: "/"
  - `display`: "standalone"
  - `background_color`: "#f8fafc"
  - `theme_color`: "#4f46e5"
  - `icons`: 192x192, 512x512 크기 SVG 및 마스크블 아이콘 정의
- [x] `apps/web/public/icons/` 경로에 192, 512 크기 벡터/SVG 아이콘 배치
- [x] `apps/web/index.html`에 PWA 메타 태그(`apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `theme-color`, `manifest link`) 연동

### 2. Service Worker (`sw.js`) 캐싱 전략 구축
- [x] `apps/web/public/sw.js` 구현:
  - Cache Storage 기반 정적 자산(`index.html`, 번들 css/js, 아이콘) 사전 캐싱(`install` 이벤트)
  - 구버전 캐시 자동 정리(`activate` 이벤트)
  - `fetch` 이벤트 인터셉트:
    - 정적 자산: Stale-While-Revalidate 전략
    - API 요청(`/api/*`): Network-First (네트워크 실패 시 503 OFFLINE_MODE 응답 처리)
- [x] Service Worker 등록 스크립트(`apps/web/src/serviceWorkerRegistration.ts`) 구현:
  - 프로덕션 환경 및 `navigator.serviceWorker` 지원 시 등록
  - 새 버전 발견 시 업데이트 리스너 연결

### 3. 실시간 오프라인 상태 감지 훅 & 오프라인 배너 UI
- [x] `apps/web/src/hooks/useOnlineStatus.ts` 구현:
  - `window.addEventListener('online')` / `'offline'` 감지
  - 초기값 `navigator.onLine` 반영 및 상태 반환
- [x] `apps/web/src/components/common/OfflineBanner.tsx` 구현:
  - 오프라인 감지 시 상단 고정 안내 배너 노출 (경고 아이콘 + "오프라인 모드입니다. 캐시된 데이터를 표시합니다.")
  - 다시 온라인으로 복구될 때 3.5초간 성공 토스트 노출 후 자동 페이드아웃
- [x] `apps/web/src/components/layout/AppLayout.tsx`에 `OfflineBanner` 배치

### 4. 단위 테스트 및 회귀 검증
- [x] `useOnlineStatus.spec.ts` 단위 테스트 작성 (online/offline 이벤트 디스패치 및 상태 전이 검증)
- [x] `OfflineBanner.spec.tsx` 컴포넌트 렌더링 및 인터랙션 테스트 작성
- [x] 프론트엔드/백엔드 전사 테스트 100% 통과 확인 (Web 191개, API 192개 통과)
- [x] 사용자에게 세부 변경 내역 보고 및 커밋 승인 완료
