> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 21: 프론트엔드 전수 Mock/더미 데이터 정리 및 실데이터 연동 무결성 검증 (통합 하네스)

## 📌 목표 및 개요
프로젝트 프론트엔드(`apps/web/src`) 전역에 남아있던 레거시 Mock, 임시 더미(Dummy) 폴백, 테스트용 하드코딩 데이터를 전수 점검 및 정리하여, 모든 사용자 플로우가 실제 백엔드 API 및 실제 사용자 데이터와 안정적으로 연동되도록 무결성을 확립하였습니다.

---

## 📋 서브 하네스 통합 이력

### [x] Phase 21-01: Auth & 소셜 콜백 잔여 임시/더미 코드 정리 및 에러 핸들링 고도화
- `OAuthCallbackPage.tsx`: 토큰 임시 잔류 키(`temp_token`) 및 미사용 더미 값(`mock_state`) 완전 제거
- 프로필 조회(`/users/me`) 실패 시 더미 계정(`social_user`, `social@boim.internal`) 자동 로그인 폴백 전면 제거 및 명확한 실패 안내 UI 렌더링
- `Login.tsx`: 구버전 소셜 토큰 파싱 중복 로직 정리 및 일반 로그인 시 임의의 `'user_id'` 하드코딩 폴백 제거
- `OAuthCallbackPage.spec.tsx`: 프로필 조회 실패 에러 화면 검증 등 단위 테스트 최신화 및 통과

### [x] Phase 21-02: 문서/증권 분석 API 및 업로더 잔여 Mock 용어 정제
- `PolicyDocumentUploader.tsx`: 버튼 문구 "📄 온보딩 샘플 증권으로 원클릭 분석해보기" 및 안내 메시지 정제
- `apps/api/src/document/document.service.ts`: `getSamplePreset()` 응답에 `presetData` 정식 반영 및 `mockData` 하위 호환성 유지
- `apps/web/src/api/useDocumentQueries.ts`: `useGetSamplePreset` 반환 타입 정식 반영
- `PolicyDocumentUploader.test.tsx` 및 `useDocumentQueries.spec.ts` 100% 통과

### [x] Phase 21-03: 프론트엔드 전역 하드코딩/더미 데이터 전수 감사 및 실데이터 바인딩 검증
- 4대 핵심 영역 실데이터 바인딩 전수 감사:
  - `HomePage.tsx`: 4대 요약 카드(가입 보험 건수, 이번 달 총 납입액, 갱신/만기 건수, 미납 알림 건수) 실데이터 동적 집계 무결성 확인
  - `MyInsuranceList.tsx`: 카테고리 필터링 및 '등록된 보험이 없습니다' 빈 상태(Empty State) 무결성 확인
  - `PremiumAnalysis.tsx`: 카테고리별 납입액 파이 차트 및 빈 상태 대응 무결성 확인
  - `NotificationList.tsx`: 인앱 알림 실시간 동기화, 읽음/삭제 및 배치 스캔 피드백 무결성 확인
  - `AiDiagnosisReport.tsx`: 로딩, 에러, 등록 보험 없을 때 안내 UI 및 Excel 다운로드/인쇄 무결성 확인
- `HeroSection.tsx` 및 `StepGuideSection.tsx`: 비로그인 방문자 대상 정적 온보딩 쇼케이스 목업임을 명시하는 안내 주석 보강

### [x] Phase 21-04: 전사 테스트, 빌드 무결성 검증 및 하네스 단일화(2-File Rule)
- 프론트엔드 Vitest 48개 스위트, 211개 테스트 100% 통과
- 백엔드 Jest 27개 스위트, 205개 테스트 100% 통과 (총 416개 테스트 전수 Pass)
- 프론트엔드/백엔드 전사 빌드(`turbo run build`) 100% 통과 (번들 청크 500kB 이하 유지)
- `oxlint` 린트 0 에러 유지
- Phase 21 하위 하네스 단일화(2-File Rule 준수: `Phase21_harness.md`, `Phase21_sub_harness.md`)
