> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것

# Phase 폴더 안내

이 폴더는 각 작업에 대한 계획을 체크리스트 형식으로 관리하기 위한 곳입니다.

- **파일 위치 주의**: 작업하는 Phase 번호에 맞는 하위 폴더(예: `phase01`, `phase10`, `phase12`) 내부에 하네스 파일을 생성해야 합니다. (절대 루트 `Phase/` 폴더에 직접 생성하지 마세요)
- 새로운 작업을 시작할 때 해당 하위 폴더에 마크다운 파일(예: `Phase12-01_harness.md`)을 생성하세요.
- 할 일을 순서대로 `- [ ]` 형태로 작성하세요.
- 단위 작업이 완료될 때마다 반드시 `- [x]` 형태로 체크(완료 처리) 후, **즉각적으로 `git commit`** 하세요.
- 작업이 완료된 Phase는 분산된 하위 하네스 파일들을 `PhaseXX_sub_harness.md` 파일 하나로 통합하고 기존 하위 하네스들은 정리하여, 각 Phase 폴더에 메인 하네스와 하위 하네스 총 2개 파일이 유지되도록 관리하세요.

---

## 📌 전체 Phase 마일스톤 현황

- [x] **Phase 01~03:** 모노레포 구조화, 디자인 시스템, SPA 3열 레이아웃
- [x] **Phase 04~05:** 캘린더 연동 보험 CRUD, 내 보험 목록, 보험료 분석 차트, 알림 및 설정 패널
- [x] **Phase 06~08:** 반응형 고도화, 전사 단위/컴포넌트 테스트(100% Pass), 민감 작업 재인증(Re-Auth)
- [x] **Phase 09:** 회원가입, 간이 PASS 본인인증, 하이브리드 토큰 스토리지, 간이 소셜 계정 연동
- [x] **Phase 10:** 보험 증권 파일 업로드 & 패턴 매칭 데이터 자동 추출 및 폼 자동 입력(Prefill)
- [x] **Phase 11:** 보험 만기 & 보험료 납입일 스케줄러 배치 및 알림 시스템 구축
- [x] **Phase 12:** 내 보험 가입 현황 AI 종합 진단 & 데이터 내보내기 (PDF / Excel 리포트) (완료)
  - [x] **Phase 12-01:** 백엔드 Gemini AI 보험 종합 진단 엔진 및 API 구현
  - [x] **Phase 12-02:** 백엔드 데이터 내보내기 (Excel XLSX & PDF 데이터) API 구현
  - [x] **Phase 12-03:** 프론트엔드 AI 종합 진단 리포트 UI 및 시각화
  - [x] **Phase 12-04:** 프론트엔드 리포트 다운로드(Excel / PDF) 연동 및 전체 품질 무결성 검증
- [x] **Phase 13:** 더미(Mock) 제거 & 실제 서비스 실연동 고도화 (Real-world Integration) (완료)
  - [x] **Phase 13-01:** 대시보드 미납 알림 실시간 집계 & 캘린더 일정 클릭 시 보험 수정(Edit) 모드 실연동
  - [x] **Phase 13-02:** 알림 다중 채널 실제 발송 (브라우저 OS 푸시 & 이메일 실발송)
  - [x] **Phase 13-03:** PASS 본인인증 실감형 인터랙션 고도화 (타이머 & 세션 코드)
  - [x] **Phase 13-04:** 전체 품질 무결성 검증 및 Phase 13 마일스톤 마무리
- [x] **Phase 14:** 프론트엔드 테스트 커버리지 강화 및 컴포넌트/로직 책임 분리 (Architecture Refactoring) (완료)
  - [x] **Phase 14-01:** 커버리지 측정 정밀화 및 테스트 데이터 Fixture 체계 구축
  - [x] **Phase 14-02:** 설정(Settings) 패널 및 부가 컴포넌트 테스트 스위트 작성
  - [x] **Phase 14-03:** `src/api` React Query 훅 및 데이터 파이프라인 단위 테스트 (커버리지 80%+ 달성 완료: 82.56%)
  - [x] **Phase 14-04:** `RightPanel.tsx` 서브 컴포넌트 분리 (`DailyEventsView.tsx`)
  - [x] **Phase 14-05:** `AiDiagnosisReport.tsx` 리포트 서브 컴포넌트 분리 (`DiagnosisScoreCard`, `CoverageProgressList`, `DiagnosisAdviceCards`)
  - [x] **Phase 14-06:** 백엔드 도메인 비즈니스 규칙 엔진 분리 (`RuleBasedDiagnosisEngine`, `NotificationRuleEvaluator`)
  - [x] **Phase 14-07:** `InsuranceForm.tsx` 비즈니스 로직 훅 분리 (`useInsuranceForm.ts`)
  - [x] **Phase 14-08:** 전체 품질 무결성 검증 및 Phase 14 마일스톤 마무리 (전사 349개 테스트 100% Pass)

---

## 📌 향후 작업 예정 체크리스트

### 1. 프론트엔드 테스트 커버리지 강화 & 아키텍처 리팩토링 (Phase 14 진행 중)
- [ ] 프론트엔드 테스트 커버리지 80%+ 확보 (설정 패널, 온보딩, React-Query 훅)
- [ ] 프론트엔드 내 임시 모킹 데이터 정리 및 표준 테스트 Fixture 체계화
- [ ] 거대 컴포넌트(`RightPanel`, `AiDiagnosisReport`, `InsuranceForm`) 분리 및 비즈니스 로직 훅 추출
- [ ] 백엔드 도메인 비즈니스 규칙 엔진 분리 (`AiDiagnosis`, `NotificationScheduler`)

### 2. 실제 상용 소셜 OAuth2(카카오/네이버) 실연동
- [ ] 카카오 Developers / 네이버 Developers 실제 REST API Key 및 Redirect URI 연동
- [ ] 상용 환경 OAuth2 인가 코드 수신, 토큰 교환 및 계정 통합 처리
