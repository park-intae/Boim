> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 25: 랜딩 페이지 웹 접근성(a11y) 및 Lighthouse 품질 100점 고도화 (통합 하네스)

## 📌 목표 및 개요
`lighthouse.json`(`http://localhost/` 랜딩 페이지 측정 리포트)의 접근성(Accessibility) 감사에서 검출된 WCAG 2.1 AA 위반 항목(`color-contrast`, `heading-order`, `label-content-name-mismatch`)을 전수 해결하고, 접근성 회귀 방지 단위 테스트를 구축하여 웹 품질 무결성을 달성하였습니다.

---

## 📋 서브 하네스 통합 이력

### [x] Phase 25-01: 랜딩 페이지 시맨틱 헤딩 계층, 로고 접근성 라벨 및 WCAG AA 색상 대비 전면 개선
- [x] `LandingNavbar.tsx`: 상단 로고 버튼(`role="button"`)의 `aria-label`을 `"Boim 최상단으로 이동"`으로 수정하여 내부 시각적 텍스트(`Boim`)가 접근 가능한 이름에 포함되도록 개선 (`label-content-name-mismatch` 해결)
- [x] `HeroSection.tsx`: 메인 `<h1>` 직후 우측 쇼케이스 카드 타이틀을 `<h3>보험 일정</h3>`에서 `<h2>보험 일정</h2>`로 교정하여 `h1` ➔ `h2` 내림차순 헤딩 계층 확립 (`heading-order` 해결)
- [x] `HeroSection.tsx`: 서브 설명, 보조 문구, 요약 지표 단위(`건`), 요일 표기(`월~금`)의 `text-gray-400`을 `text-gray-600`(대비율 7.0:1+)으로, 이전 달 날짜(`1`)의 `text-gray-300`을 `text-gray-500`(대비율 4.7:1)으로, 일/토요일 날짜 및 갱신 건수의 `text-red-500` / `text-blue-500` / `text-amber-600`을 `text-red-700` / `text-blue-700` / `text-amber-700`으로 전면 상향 (`color-contrast` 해결)
- [x] `FeatureCardsSection.tsx`: 프리뷰 라벨(`나의 보험 현황`, `/ 100점`)의 `text-gray-400`을 `text-gray-600`으로, 상태 텍스트(`납입 완료`, `안심 등급 🟢`)의 `text-emerald-600`을 `text-emerald-700`(대비율 5.45:1)으로 상향 (`color-contrast` 해결)
- [x] `StepGuideSection.tsx` & `LandingFooter.tsx`: 1~3단계 탭 설명, 파일 지원 안내, 입력 필드 라벨(`보험사`, `월 납입액`, `상품명`), 납입 보조 텍스트, 하단 목업 안내 및 푸터 저작권 문구의 `text-gray-400`을 `text-gray-600`으로, `완료` 및 `보강 추천` 배지의 `text-emerald-600` / `text-amber-600`을 `text-emerald-700` / `text-amber-700`으로 상향 (`color-contrast` 해결) 및 1단계 보험 등록 예시 카드 내 불필요한 `'가상 모의 증권 샘플로 원클릭 분석'` 배지 제거

### [x] Phase 25-02: 랜딩 페이지 접근성 단위 테스트 보강, 전사 무결성 검증 및 하네스 단일화(2-File Rule)
- [x] `LandingPage.spec.tsx`: 제목 요소(`h1~h6`) 내림차순 계층 검증, GNB 로고 버튼 `aria-label` 내 `Boim` 텍스트 포함 검증, 1~3단계 전 탭 저대비 클래스(`text-gray-400`, `text-gray-300`) 부재 검증 단위 테스트 2건 추가
- [x] 프론트엔드 Vitest 50개 스위트(271개 테스트) 및 백엔드 Jest 29개 스위트(256개 테스트) 총 527개 테스트 100% 통과
- [x] 린트(`oxlint`) 및 프로덕션 빌드 0 에러 검증
- [x] `boim-web` Docker 컨테이너 재빌드 및 재기동(`docker compose up -d --build web`)을 통한 `http://localhost/` 최신 번들 반영 완료
- [x] Phase 25 하위 하네스 단일화(2-File Rule 준수: `Phase25_harness.md`, `Phase25_sub_harness.md`)
- [x] `.agents/errorlog.md`, `CHANGELOG.md` 및 `README.md` 최신화
