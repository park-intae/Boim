# Boim (보험 가입 현황 관리 프로젝트)

개인 보험 가입 현황 관리 캘린더 및 대시보드를 제공하는 올인원 웹 애플리케이션입니다.

---

## 🛠️ 기술 스택 (Tech Stack)

- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS, TanStack Query, Zustand, oxlint
- **Backend:** NestJS 11, Prisma ORM, PostgreSQL, Passport, JWT, bcrypt
- **Architecture:** pnpm 워크스페이스 모노레포 (`apps/web`, `apps/api`, `packages/shared-types`)

---

## 🧪 테스트 계정 정보

개발 및 테스트 환경에서 앱에 로그인하기 위해 사용할 수 있는 모의 계정입니다. 해당 계정은 백엔드의 데이터베이스 시딩(`apps/api/prisma/seed.ts`)을 통해 자동으로 생성됩니다.

- **이메일**: `test@boim.com`
- **비밀번호**: `password123`

---

## 🌟 주요 기능 요약

1. **캘린더 & 납입일 관리:** 월별 보험료 납입 일정 및 만기일 한눈에 확인
2. **내 보험 관리 (CRUD):** 우측 패널을 통한 손쉬운 보험 상세 등록, 수정, 삭제
3. **보험료 분석:** 보장 카테고리별 납입 비중 및 통계 차트 시각화
4. **인증 & 보안 인프라:**
   - bcrypt 기반 비밀번호 해시 암호화 및 DB 연동
   - 기기 기억하기(Remember Me) 설정에 따른 `sessionStorage` / `localStorage` 하이브리드 세션 관리
   - 회원가입 플로우 및 간이 PASS 본인인증
   - 민감 작업 보호를 위한 재인증(Re-Auth) 모달
   - 설정 패널 내 간이(Mock) 카카오/네이버 소셜 계정 연동

---

## 📋 개발 이력 및 패치노트

프로젝트의 상세한 개발 단계(Phase)별 변경 사항 및 기능 패치 내역은 **[`CHANGELOG.md`](./CHANGELOG.md)** 파일에서 확인하실 수 있습니다.
또한 전체 개발 계획 및 마스터 하네스는 [`.agents/Phase/Phase_harness.md`](./.agents/Phase/Phase_harness.md)에서 관리됩니다.
