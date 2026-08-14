# Phase 05-04: 알림 기능 백엔드 API 연동

> **목표:** 프론트엔드의 로컬 상태로 구현되었던 알림 데이터를 백엔드 API와 연동하여, 새로고침 후에도 상태(삭제, 읽음)가 유지되도록 인메모리 더미 백엔드를 구현하고 연결합니다.

## ✅ 체크리스트

### 1. 백엔드 알림 모듈 구현
- [x] NestJS `notification` 모듈, 컨트롤러, 서비스 생성
- [x] `NotificationService`에 더미 데이터를 담은 인메모리 배열 구성
- [x] 조회(GET), 읽음 처리(PATCH), 삭제(DELETE) API 엔드포인트 구현

### 2. 프론트엔드 API 연동
- [x] TanStack Query를 활용한 `useNotificationQueries` 생성 (`useGetNotifications`, `useMarkNotificationRead`, `useDeleteNotification`)
- [x] `<NotificationList />` 컴포넌트를 로컬 상태(`useState`)에서 API 기반(`useQuery`, `useMutation`)으로 전환
- [x] 삭제(X 버튼) 및 읽음 처리 시 백엔드 호출 후 리스트 상태가 즉시 무효화(`invalidateQueries`)되어 동기화되도록 연동

### 3. 테스트 및 마무리
- [x] 단위 테스트 환경에서 API 호출 Hook이 모킹(Mocking) 되도록 `NotificationList.test.tsx` 수정 및 검증
- [x] 백엔드 빌드 및 프론트엔드 테스트 전체 패스 확인
- [x] 작업 완료 후 한국어 커밋
