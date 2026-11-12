> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 16: 프론트엔드 번들 최적화 및 웹 품질 고도화 (Performance & Web Quality)

## 📌 목표 및 개요
소셜 OAuth2 연동까지 완료되어 모든 기능이 완비된(Feature-Complete) 최종 웹 애플리케이션을 대상으로, Vite 프로덕션 번들 비대화 경고(944kB)를 해소하고 라우트/컴포넌트 단위 코드 스플리팅(Dynamic Import)을 적용합니다. 또한 PWA(Progressive Web App) 오프라인 캐싱과 Manifest를 구성하여 네이티브 앱 수준의 모바일 UX를 제공하고, Lighthouse 웹 품질(성능, 접근성, SEO)을 극대화합니다.

---

## 📋 세부 체크리스트

### 1. Phase 16-01: Vite 번들 다이어트 및 코드 스플리팅 (Dynamic Import)
- [x] `React.lazy` 및 `Suspense`를 활용하여 주요 화면(설정 패널, AI 진단 리포트, 차트 분석, OAuth 콜백) 지연 로딩 적용
- [x] `vite.config.ts`의 `manualChunks` 설정을 통해 Vendor 라이브러리(React/Query/Recharts/Lucide) 분할 번들링
- [x] 단일 번들 청크 사이즈를 500kB 이하로 경량화 및 빌드 경고 0건 달성 (엔트리 105kB, 최대 326kB)

### 2. Phase 16-02: PWA(Progressive Web App) 오프라인 캐싱 & Manifest 구축
- [x] Service Worker(`sw.js`) 구성을 통한 정적 자산 오프라인 캐싱 (Stale-While-Revalidate 및 API Network-First)
- [x] 모바일 브라우저 '홈 화면에 추가'를 위한 `manifest.webmanifest` 및 고해상도 앱 아이콘/테마 컬러 완비
- [x] 네트워크 단절 시 실시간 오프라인 알림 UI(`OfflineBanner`) 및 복구 토스트 제공

### 3. Phase 16-03: 웹 접근성(a11y), SEO 메타데이터 및 Lighthouse 최적화
- [x] WAI-ARIA 필수 속성(`aria-label`, `role`, 키보드 포커스 링) 보강 (접근성 100점 만점)
- [x] 모바일 뷰포트, Open Graph, Twitter Cards, 메타 디스크립션 SEO 메타데이터 완비 (SEO 100점 만점)
- [x] Non-blocking CSS 및 폰트 렌더링 최적화, 번들 다이어트 (모범 사례 100점, 성능 96점)

### 4. Phase 16-04: 전체 성능 측정 및 Phase 16 마일스톤 마무리
- [x] 모노레포 전체 테스트 회귀 무결성 100% Pass (Vitest 195개 통과)
- [x] 빌드(`pnpm build`) 및 린트(`pnpm lint`) 통과
- [x] `Phase16_sub_harness.md` 통합 및 2-File Rule 준수
- [x] `CHANGELOG.md`, `README.md` 동기화 및 커밋 준비
