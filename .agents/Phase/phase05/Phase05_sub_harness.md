> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것

# Phase 05 하위 작업 통합 하네스 (Phase 05 Sub-Harness)

본 문서는 Phase 05(내 보험, 분석, 알림, 설정 패널) 과정에서 진행된 세부 하위 작업(Phase 05-01 ~ 05-05)의 실행 내역과 체크리스트를 하나로 통합 정리한 문서입니다.

---

## 📋 Phase 05-01: 보험료 분석 (Insurance Premium Analysis) 기능

> **목표:** 좌측 사이드바의 '보험료 분석' 메뉴 클릭 시, 사용자가 가입한 보험 데이터를 바탕으로 카테고리별 월 납입액 통계를 시각적으로 보여주는 분석 기능을 구현합니다.

### 1. 상태 관리 및 사이드바 연동
- [x] `useAppStore`의 `panelMode` 타입에 `'analysis'` 모드 추가
- [x] 좌측 `Sidebar` 컴포넌트의 '보험료 분석' 메뉴 클릭 시 `setPanelMode('analysis')` 호출 로직 연결
- [x] 🧪 **[Test]** `useAppStore.test.ts`에 `'analysis'` 모드 전환 관련 단위 테스트 작성
- [x] 🧪 **[Test]** `Sidebar.test.tsx`에서 '보험료 분석' 클릭 시 상태 변경 검증

### 2. 보험료 분석 컴포넌트(`PremiumAnalysis`) 구현
- [x] 우측 패널에 `panelMode === 'analysis'`일 때 나타날 `<PremiumAnalysis />` 컴포넌트 뼈대 생성
- [x] `useGetInsurances`를 호출하여 받아온 데이터를 카테고리별 합계 금액 및 퍼센티지로 가공하는 유틸리티/로직 작성
- [x] Recharts 및 Tailwind 기반 카테고리별 시각화 UI 구현
- [x] 🧪 **[Test]** `<PremiumAnalysis />` 컴포넌트가 Mock 데이터를 기반으로 차트 및 요약 정보를 정상 렌더링하는지 테스트

### 3. 세부 통계 리스트 및 상태 분기
- [x] 시각화 자료 하단에 카테고리별 정확한 금액과 비율을 보여주는 리스트 UI 구현
- [x] 가입한 보험이 없는 경우(Empty State) 차트 대신 등록 유도 안내 화면 노출
- [x] 🧪 **[Test]** Empty State 컴포넌트 단위 테스트 작성

### 4. 레이아웃 및 엣지 케이스 검증
- [x] 패널 내부 스크롤 바운더리 체크 및 반응형 레이아웃 시 차트 영역 깨짐 방지
- [x] 다른 탭으로 전환 후 복귀 시 화면 깜빡임 현상 등 UI/UX 점검

---

## 📋 Phase 05-03: 알림 (Notifications) 기능 구현

> **목표:** 좌측 사이드바의 '알림' 메뉴 클릭 시, 사용자에게 도달한 이벤트(보험료 납입일 도래, 갱신 알림 등) 목록을 확인할 수 있는 알림 패널 뷰를 구현합니다.

### 1. 알림 모드 상태 관리 및 사이드바 연동
- [x] `useAppStore`의 `panelMode` 타입에 `'notifications'` 모드 추가
- [x] 좌측 `Sidebar` 컴포넌트의 '알림' 메뉴 클릭 시 `setPanelMode('notifications')` 호출 및 활성화 스타일 적용
- [x] 🧪 **[Test]** `useAppStore.test.ts`에 `'notifications'` 모드 전환 검증 테스트 추가
- [x] 🧪 **[Test]** `Sidebar.test.tsx`에서 '알림' 클릭 동작 검증 테스트 추가

### 2. 알림 리스트 컴포넌트(`NotificationList`) 뼈대 및 UI 구현
- [x] `panelMode === 'notifications'`일 때 렌더링될 `<NotificationList />` 컴포넌트 생성
- [x] 알림 아이템(타입, 제목, 시간, 읽음 여부) 렌더링용 임시 상태 및 아이템 UI(강조 뱃지, 아이콘) 스타일링
- [x] 🧪 **[Test]** `<NotificationList />`가 알림 목록을 올바르게 렌더링하는지 단위 테스트 작성

### 3. 알림 상호작용 및 상태 처리
- [x] 알림 항목 클릭 시 해당 알림을 '읽음' 상태로 변경하는 로직 구현
- [x] 수신된 알림이 없을 경우(Empty State)를 위한 안내 문구 및 UI 구현
- [x] 🧪 **[Test]** Empty State 렌더링 검증 및 알림 클릭 이벤트 동작 검증

### 4. 엣지 케이스 및 마무리
- [x] 알림 목록이 길어질 경우 스크롤 영역 레이아웃 체크 (`flex-1 overflow-hidden` 적용)
- [x] 개별 알림 항목 제거(X 버튼) UI 추가 및 이벤트 전파(`stopPropagation`) 방지 처리

---

## 📋 Phase 05-04: 알림 기능 백엔드 API 연동

> **목표:** 프론트엔드의 로컬 상태로 구현되었던 알림 데이터를 백엔드 API와 연동하여, 새로고침 후에도 상태(삭제, 읽음)가 유지되도록 인메모리 더미 백엔드를 구현하고 연결합니다.

### 1. 백엔드 알림 모듈 구현
- [x] NestJS `notification` 모듈, 컨트롤러, 서비스 생성
- [x] `NotificationService`에 더미 데이터를 담은 인메모리 배열 구성
- [x] 조회(GET), 읽음 처리(PATCH), 삭제(DELETE) API 엔드포인트 구현

### 2. 프론트엔드 API 연동
- [x] TanStack Query를 활용한 `useNotificationQueries` 생성 (`useGetNotifications`, `useMarkNotificationRead`, `useDeleteNotification`)
- [x] `<NotificationList />` 컴포넌트를 로컬 상태에서 API 기반으로 전환
- [x] 삭제(X 버튼) 및 읽음 처리 시 백엔드 호출 후 리스트 상태가 즉시 무효화(`invalidateQueries`)되어 동기화되도록 연동

### 3. 테스트 및 마무리
- [x] 단위 테스트 환경에서 API 호출 Hook 모킹 및 `NotificationList.test.tsx` 검증
- [x] 백엔드 빌드 및 프론트엔드 테스트 전체 패스 확인

---

## 📋 Phase 05-05: 설정(Settings) 기능 제작

> **목표:** 사용자의 계정 정보, 알림 설정 및 세션/데이터 관리를 위한 설정 페이지 UI와 백엔드 API를 구현합니다.

### 1. UI/UX 구조 잡기 (공통)
- [x] 설정 모달/패널 기본 레이아웃 구성 (Tailwind CSS 활용)
- [x] 4가지 주요 섹션(계정 설정, 알림 설정, 데이터 관리, 기타) 틀 잡기

### 2. 계정 설정
- [x] **내 정보 관리**: 사용자 프로필 및 기본 정보 조회/수정 UI 및 API 연동
- [x] **비밀번호 변경**: 비밀번호 변경 폼 및 검증 로직 구현
- [x] **로그인 기록**: 접속 기기/세션 목록 조회 및 관리

### 3. 알림 설정
- [x] **푸시 알림**: 웹 푸시 수신 동의 토글 UI 및 API
- [x] **이메일 알림**: 이메일 수신 동의 토글 UI 및 API
- [x] **카카오톡 알림**: 카카오톡 수신 동의 토글 UI 및 API
- [x] **알림 시간 설정**: 방해 금지 시간 등 알림 발송 시간대 설정 UI 및 API

### 4. 데이터 관리 및 보안
- [x] **데이터 내보내기 / 가져오기**: 보험/일정 데이터 Export & Import 기능
- [x] **계정 탈퇴 & 로그아웃**: 본인 확인 절차 및 소프트 딜리트 처리
- [x] **기타**: 이용약관 및 개인정보처리방침 모달 뷰어 제공
