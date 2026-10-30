# Boim (보험 가입 현황 관리 프로젝트)

개인 보험 가입 현황 관리 캘린더 및 대시보드를 제공하는 올인원 웹 애플리케이션입니다.

---

## 🛠️ 기술 스택 (Tech Stack)

- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS, TanStack Query, Zustand, React Hook Form, Zod, Lucide Icons, Recharts, oxlint
- **Backend:** NestJS 11, Prisma ORM, PostgreSQL, Passport, JWT, bcrypt, Multer, Tesseract.js
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
4. **증권 파일 자동 입력:**
   - 보험 증권(PDF, 이미지, TXT) 업로드 시 OCR 및 고성능 패턴 매칭 엔진을 통해 계약 정보 자동 추출
   - 가상 모의 증권 샘플(`[가상 모의 증권 샘플로 원클릭 분석해보기]`)을 통한 원클릭 테스트 지원
   - 추출된 데이터(보험사, 상품명, 카테고리, 월납입액, 만기일 등)가 입력 폼에 즉시 자동으로 채워짐(Prefill)
5. **인증 & 보안 인프라:**
   - bcrypt 기반 비밀번호 해시 암호화 및 DB 연동
   - 기기 기억하기(Remember Me) 설정에 따른 `sessionStorage` / `localStorage` 하이브리드 세션 관리
   - 회원가입 플로우 및 간이 PASS 본인인증
   - 민감 작업 보호를 위한 재인증(Re-Auth) 모달
   - 설정 패널 내 간이(Mock) 카카오/네이버 소셜 계정 연동
   - 업로드된 증권 문서에 대한 Row-level 소유권 통제

---

## 🚦 Phase 개발 현황

| Phase | 내용 | 상태 |
| :--- | :--- | :---: |
| **Phase 01~03** | 모노레포 구조화, 디자인 시스템 구축, SPA 3열 메인 레이아웃 | **완료** |
| **Phase 04~05** | 캘린더 연동 보험 CRUD, 내 보험 목록, 보험료 분석 차트, 알림/설정 패널 | **완료** |
| **Phase 06~08** | 반응형 모바일 전환, 전사 단위/통합 테스트 (100% Pass), 재인증 모달 | **완료** |
| **Phase 09** | 신규 회원가입, 간이 PASS 본인인증, 하이브리드 세션 관리, 소셜 연동 UI | **완료** |
| **Phase 10** | **보험 증권 파일 업로드 & 패턴 매칭 자동 분석 및 폼 자동 입력(Prefill)** | **완료** |
| **Phase 11 (예정)** | 보험 만기 & 보험료 납입일 스케줄러 배치 및 알림 발송 / AI 종합 진단 리포트 | 예정 |

---

## 📋 개발 이력 및 패치노트

프로젝트의 상세한 개발 단계(Phase)별 변경 사항 및 기능 패치 내역은 **[`CHANGELOG.md`](./CHANGELOG.md)** 파일에서 확인하실 수 있습니다.  
전체 개발 계획 및 마스터 하네스는 [`.agents/Phase/Phase_harness.md`](./.agents/Phase/Phase_harness.md)에서 관리됩니다.
