# Frontend Harness (React 19 + Vite)

> 프론트엔드 코드 작성 및 수정 시 에이전트가 **반드시 준수해야 하는** 세부 지침입니다.

---

## 1. 아키텍처 및 컴포넌트 설계
- **도메인 분리 (`features/`):** 특정 비즈니스 로직(예: 캘린더, 보험 내역)에 종속된 컴포넌트, 훅, API 호출 로직은 모두 `features/{도메인}` 하위에 캡슐화합니다.
- **공통 컴포넌트 (`shared/`):** 도메인에 얽매이지 않는 순수 UI 컴포넌트(Button, Modal 등)와 범용 유틸리티는 `shared/`에 배치하여 재사용성을 극대화합니다.
- **단일 책임 원칙 (SRP):** 하나의 컴포넌트는 단 하나의 명확한 책임만 수행하도록 잘게 분리합니다.

## 2. 상태 관리 및 데이터 페칭
- **서버 상태 (`TanStack Query`):** API 호출 및 서버 데이터 캐싱은 전적으로 TanStack Query를 사용하며, Query Key는 **Factory 패턴**으로 상수화하여 관리합니다.
- **로딩 및 에러 처리 통일:** 개별 컴포넌트 내부에서 `isLoading`, `isError`를 조건부 렌더링하지 않습니다. 대신 `useSuspenseQuery`를 사용하여 **`ErrorBoundary` + `Suspense`** 조합으로 도메인/페이지 단위의 로딩·에러 UI를 일관성 있게 처리합니다.
- **클라이언트 전역 상태 분리:**
  - **`Context API`:** 정적이거나 거의 변경되지 않는 값 (예: 로그인 유저 세션, 테마 설정)
  - **`Zustand`:** 다수의 컴포넌트가 구독하며 자주 변경되는 UI 상태 (예: 전역 모달 상태, 필터)

## 3. React 19 핵심 기능 적극 활용
- **낙관적 업데이트 (Optimistic Update):** TanStack Query의 `onMutate` 대신, React 19 네이티브 훅인 **`useOptimistic`**을 적극 활용하여 즉각적인 피드백이 필요한 UX를 구현합니다.
- **Actions 및 훅 (`use()` 등):** 폼 제출 등 비동기 작업에 React 19의 Actions(`useActionState`, `useFormStatus`) 및 `use()` 훅을 적재적소에 활용합니다.

## 4. UI 및 스타일링
- **Tailwind CSS 퍼스트:** 모든 스타일링의 기본은 Tailwind CSS 유틸리티 클래스를 사용합니다.
- **접근성(a11y):** 키보드 네비게이션 및 스크린 리더 지원이 필요한 경우 `Shadcn/ui`나 `Radix UI` 기반의 Headless 컴포넌트를 사용합니다.
- **애니메이션 원칙 (경량화 우선):**
  - 단순 호버, 포커스, 모달 등장 등은 번들 사이즈 최적화를 위해 **Tailwind CSS 기본 트랜지션**만 사용합니다.
  - 리플로우(Reflow) 방지를 위해 `transform`과 `opacity` 위주로 애니메이션을 설계합니다.
  - `Framer Motion`은 "리스트 항목의 동적 재배치"처럼 고도화된 애니메이션이 **반드시 필요한 특정 지점**에만 제한적으로 도입합니다.

## 5. 폼(Form) 및 라우팅
- **폼 최적화:** 렌더링 최적화를 위해 `React Hook Form`을 사용하고, API 전송 전 `Zod`를 통해 런타임 값 유효성을 안전하게 검증합니다.
- **라우팅 (Auth Guard):** 인증 상태에 따라 Private/Public 라우트를 명확히 구성하며, 토큰 갱신 및 401(Unauthorized) 에러는 **전역 Axios/Fetch 인터셉터**에서 일괄 처리합니다.

## 6. 성능 및 렌더링 최적화
- **렌더링 최적화:** 불필요한 리렌더링을 막기 위해 `memo`, `useMemo`, `useCallback`을 적재적소에 사용합니다.
- **코드 스플리팅:** 차트나 대형 캘린더 라이브러리 등 무거운 컴포넌트는 `React.lazy`와 `Suspense`를 활용하여 동적으로 로딩합니다.
