> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 25: 랜딩 페이지 웹 접근성(a11y) 및 Lighthouse 품질 100점 고도화 (Landing Page Accessibility & WCAG AA Compliance)

## 📌 목표 및 개요
`lighthouse.json`(`http://localhost/` 랜딩 페이지 측정 리포트) 분석 결과, 성능(Performance 100점) 및 권장사항(Best Practices 100점)은 만점을 달성했으나 **접근성(Accessibility)**에서 검출된 WCAG 2.1 AA 위반 항목들을 전수 해결하여 웹 접근성 100점 무결성을 달성합니다.

1. **시맨틱 헤딩 계층 구조 바로잡기 (`heading-order`)**:
   - `HeroSection.tsx`: 메인 `<h1>` 헤드라인 직후 우측 쇼케이스 카드 타이틀(`보험 일정`)이 `<h2>`를 건너뛰고 `<h3>`로 선언되어 발생한 헤딩 순서 위반을 `<h2>`로 교정합니다.
2. **표시 텍스트와 접근 가능한 이름 일치 (`label-content-name-mismatch`, WCAG 2.5.3)**:
   - `LandingNavbar.tsx`: 내부에 시각적 텍스트(`Boim`)를 포함한 로고 버튼(`role="button"`)의 `aria-label="최상단으로 이동"`을 `aria-label="Boim 최상단으로 이동"`으로 수정하여 표시 텍스트가 접근 가능한 이름에 포함되도록 개선합니다.
3. **배경 및 전경 텍스트 색상 대비율 강화 (`color-contrast`, WCAG 2.1 AA 4.5:1 이상)**:
   - `HeroSection.tsx`, `FeatureCardsSection.tsx`, `StepGuideSection.tsx`(1~3단계 전체 탭), `LandingFooter.tsx` 전반에서 밝은 배경(`#ffffff`, `bg-slate-50`, `bg-indigo-50/30`) 위에 사용된 저대비 텍스트 클래스를 WCAG AA 기준(4.5:1 이상)을 충족하는 고대비 토큰으로 전면 상향합니다.
     - `text-gray-400`(대비율 2.5~2.6:1) ➔ `text-gray-600`(대비율 7.0:1 이상)
     - `text-gray-300`(미니 캘린더 이전 달 날짜) ➔ `text-gray-500`(대비율 4.7:1)
     - `text-red-500`(미니 캘린더 일요일 날짜, 대비율 3.7:1) ➔ `text-red-700`(대비율 6.7:1)
     - `text-blue-500`(미니 캘린더 토요일 헤더, 대비율 3.6:1) ➔ `text-blue-700`(대비율 6.8:1)
     - `text-emerald-600`(`납입 완료`, `안심 등급`, `완료`, 대비율 3.65:1) ➔ `text-emerald-700`(대비율 5.0~5.45:1)
     - `text-amber-600`(`갱신 예정 2건`, `보강 추천`, 대비율 3.15:1) ➔ `text-amber-700`(대비율 4.6~4.85:1)
4. **접근성 회귀 방지 단위 테스트 및 빌드 무결성 검증**:
   - `LandingPage.spec.tsx`에 랜딩 페이지 헤딩 계층 순서, 로고 `aria-label` 일치성, 고대비 클래스 적용 여부를 검증하는 테스트를 추가하고 전사 테스트/린트/빌드를 검증합니다.

---

## 📋 세부 Phase 마일스톤 체크리스트
- [x] **Phase 25-01: 랜딩 페이지 시맨틱 헤딩 계층, 로고 접근성 라벨 및 WCAG AA 색상 대비 전면 개선**
- [x] **Phase 25-02: 랜딩 페이지 접근성 단위 테스트 보강, 전사 무결성 검증, 컨테이너 반영 및 하네스 단일화(2-File Rule)**
