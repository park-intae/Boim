> 본 하네스 작업 시 @[.agents/GEMINI.md] 및 최상위 규칙을 반드시 최우선으로 참고할 것
> 작업 영역에 따라 백엔드(@[.agents/BACKEND_HARNESS.md]) 및 프론트엔드(@[.agents/FRONTEND_HARNESS.md]) 지침을 반드시 숙독하고 엄격히 준수할 것

# Phase 13-03: PASS 본인인증 실감형 인터랙션 고도화 (3분 타이머 & 세션 랜덤 코드)

## 📌 목표
1. **백엔드 PASS 인증 서비스 실감형 세션 파이프라인 구축 (`apps/api`):**
   - 기존의 단순 하드코딩 우회 코드(`123456`, `000000`) 의존에서 탈피
   - 트랜잭션 ID별 암호화 랜덤 6자리 코드 발급 및 3분(180초) TTL 만료 메모리 캐시 관리
   - 3분 만료 검증(`400 Bad Request: 인증 시간이 만료되었습니다`) 및 성공 시 일회용 즉시 세션 파기
   - 동일 번호 30초 내 연속 요청 방지(Rate-limiting / Cooldown)
   - 테스트 자동화를 위한 개발/테스트 슈퍼코드(옵션) 및 콘솔 안내 로그 제공
2. **프론트엔드 PASS 인증 3분 타이머 & 재전송 인터랙션 구축 (`apps/web`):**
   - 인증번호 입력 단계 진입 시 3분(180초) 실시간 카운트다운 타이머 구동 (`03:00` ➔ `00:00`)
   - 1분 미만 시 시각적 경고 스타일 적용
   - 3분 경과 시 입력 및 확인 버튼 비활성화, 만료 안내 표시
   - '인증번호 재전송' 버튼 활성화 및 재전송 시 타이머 리셋 및 쿨다운 적용
3. **품질 검증 및 무결성 확보:**
   - 백엔드 `pass.service.spec.ts` 단위 테스트 작성 (난수 발급 검증, 3분 만료 테스트, 일회용 파기 검증)
   - 프론트엔드 `PassVerification.spec.tsx` 단위 테스트 갱신 (타이머 카운트다운, 만료 비활성화, 재전송 이벤트)
   - 모노레포 전체 테스트(`pnpm test`), 린트(`pnpm lint`), 빌드(`pnpm build`) 100% 통과 후 단위 커밋

---

## 📋 세부 체크리스트

### 1. 백엔드 PASS 인증 세션 & TTL 파이프라인 (`apps/api`)
- [x] `PassService`(`apps/api/src/auth/pass.service.ts`):
  - 세션 인터페이스 정의: `{ code: string; phoneNumber: string; createdAt: number; expiresAt: number }`
  - 세션 스토리지 Map 구현 및 만료된 세션 자동 정리
  - `requestMockVerification`: 동일 번호 30초 재요청 쿨다운 검사, 랜덤 6자리 난수 생성 및 3분 TTL(180,000ms) 등록
  - `verifyMockCode`: 트랜잭션 ID 존재 여부 검사, 3분 만료 검증, 일치 여부 확인, 검증 성공 시 세션 즉시 파기(1회용 보장)
- [x] `pass.service.spec.ts` 단위 테스트 작성 및 100% Pass (9건 통과)

### 2. 프론트엔드 3분 타이머 & 재전송 인터랙션 (`apps/web`)
- [x] `PassVerification.tsx`(`apps/web/src/features/auth/components/PassVerification.tsx`):
  - 3분(180초) 카운트다운 타이머 훅/상태 구현 (`formatTime: mm:ss`)
  - 타이머 만료(`timeLeft === 0`) 시 입력 필드 비활성화 및 "인증 시간이 만료되었습니다" 경고 노출
  - 인증번호 재전송 버튼 클릭 시 기존 세션 리셋, 재요청 및 타이머 초기화
- [x] `PassVerification.spec.tsx` 단위 테스트 작성 및 100% Pass (3건 통과)

### 3. 전체 품질 검증 및 단위 커밋
- [x] README.md 유료 PASS 미연동 및 실감형 시뮬레이션 환경 구축 안내 반영 완료
- [x] 모노레포 전체 테스트 통과 (`pnpm test` - API 150개, Web 86개 100% Pass)
- [x] 전사 린트(`pnpm lint`) 및 빌드(`pnpm build`) 무결성 검증
- [x] CHANGELOG.md 최신화
- [x] git commit (`feat: Phase 13-03 PASS 본인인증 실감형 3분 타이머 및 세션 랜덤 코드 파이프라인 구축`)
