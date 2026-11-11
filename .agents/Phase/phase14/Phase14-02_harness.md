> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 14-02: 설정(Settings) 패널 및 부가 컴포넌트 테스트 스위트 작성

## 📌 목표 및 개요
현재 커버리지가 1~25% 수준으로 매우 낮았던 `SettingsPanel` 하위 뷰들과 온보딩(`Onboarding`), 레이아웃(`AppLayout`), 알림 목록(`NotificationList`)의 테스트 스위트를 꼼꼼하게 작성하여 UI 렌더링 및 사용자 인터랙션의 커버리지를 대폭 끌어올립니다.

---

## 📋 세부 체크리스트

- [x] **1. `PasswordSettings.spec.tsx` 작성:**
  - 현재 비밀번호 / 새 비밀번호 / 비밀번호 확인 필드 렌더링 검증
  - 비밀번호 불일치 및 길이 미달 유효성 검사 에러 노출 검증
  - 정상 입력 시 `useUpdatePassword` 뮤테이션 호출 및 성공 메시지 토스트 확인
- [x] **2. `ProfileSettings.spec.tsx` 작성:**
  - 사용자 이름 및 이메일 prefill 렌더링 검증
  - 이름 변경 후 저장 시 `useUpdateProfile` 호출 검증
- [x] **3. `LoginHistorySettings.spec.tsx` / `NotificationTimeSettings.spec.tsx` / `PolicyViewer.spec.tsx` 작성:**
  - 로그인 기기 목록(기기/위치/IP/날짜) 렌더링 및 빈 상태 검증
  - 방해 금지 모드 켜기/끄기 토글 및 시간 변경 뮤테이션 검증
  - 이용약관 및 개인정보처리방침 뷰어 정상 렌더링 검증
- [x] **4. `PushNotificationItem.spec.tsx` 보강:**
  - 미지원 브라우저, 권한 차단, 권한 취소 및 성공 데스크톱 알림 발송 엣지 케이스 검증 (100% 커버)
- [x] **5. `SettingsPanel.spec.tsx` 작성:**
  - 설정 사이드 탭 목록(프로필, 비밀번호, 소셜, 로그인 기기, 이용약관, 개인정보처리방침 등) 렌더링
  - 각 메뉴 클릭 시 서브 컴포넌트로 정상 전환 및 뒤로가기 렌더링 검증
  - 데이터 내보내기, 계정 탈퇴, 로그아웃 액션 검증 (1.38% -> 72.2% 급상승)
- [x] **6. `Onboarding.spec.tsx` 작성:**
  - 3단계 스텝별(환영/프로필 -> 보험 등록 안내 -> 완료) 렌더링
  - 건너뛰기 클릭 및 다음 버튼 클릭 전이, 최종 시작하기 완료 검증 (100% 커버)
- [x] **7. `AppLayout.test.tsx` & `NotificationList.test.tsx` 보강:**
  - `AppLayout`: 기본 레이아웃 구성요소(Header, Sidebar, Main, RightPanel, Outlet) 렌더링 검증 (100% 커버)
  - `NotificationList`: 알림 제거(X) 버튼, 시간 포맷팅 엣지 케이스 추가 검증 (59% -> 75% 상승)
- [x] **8. 단위 테스트 및 커버리지 측정 확인:**
  - 프론트엔드 라인 커버리지: **56.8% -> 68.95% 로 대폭 상승 (+12.1%p 증가)**
  - 전사 테스트: 284개 테스트 100% Pass (Web 129개, API 155개)
  - 린트 및 빌드 무결성 100% 검증
- [x] **9. 작업 완료 후 커밋:**
  - `feat: Phase 14-02 설정 패널 및 주요 UI 컴포넌트 테스트 스위트 작성`
