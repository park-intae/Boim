# 🚨 AI Agent Error Log (오류 기록 및 재발 방지)

이 문서는 과거 개발 과정에서 발생했던 치명적인 휴먼 에러(및 AI 논리 오류)를 기록하여 동일한 실수를 반복하지 않도록 하기 위해 작성되었습니다. 모든 작업 시 이 문서를 상기해야 합니다.

## 1. 프론트엔드 API 호출 포트 하드코딩 오류
- **발생 상황:** 알림 기능 백엔드 연동(Phase 05-04) 중.
- **오류 내용:** 프론트엔드에서 API 주소를 `http://localhost:3000/api`로 하드코딩하여 연동을 시도함. 실제 백엔드 NestJS 서버는 `4000`번 포트에서 실행 중이었기 때문에 모든 요청이 실패함.
- **해결 및 예방:** 기존에 구축되어 환경변수를 자동 주입받는 `apiClient`(`apps/web/src/api/client.ts`)를 재사용하여 일관된 호출을 보장해야 함. 새로운 API 훅을 작성할 때 **절대로 로컬호스트 주소를 직접 하드코딩하지 말 것**.

## 2. 백엔드 응답 인터셉터 이중 래핑(Double Wrapping) 오류
- **발생 상황:** 백엔드 알림 컨트롤러 생성 후.
- **오류 내용:** 백엔드 전역 설정(\`main.ts\`)에 \`TransformInterceptor\`가 적용되어 있어 모든 반환값이 자동으로 \`{ success: true, data: [...] }\` 형태로 감싸짐. 그러나 \`NotificationController\`에서 수동으로 \`{ success: true, data: ... }\` 구조를 또 리턴해버림.
- **결과:** 프론트엔드가 데이터를 받을 때 \`response.data\`가 배열이 아닌 객체가 되어 \`.filter is not a function\` 런타임 에러 발생.
- **해결 및 예방:** 컨트롤러에서는 오직 **순수한 데이터(배열, 객체)**만 반환해야 함. 응답 래핑(Response Wrapping)은 전역 인터셉터에 온전히 맡길 것.

## 3. 순수 타입(Type) 임포트 시 `import type` 누락 오류 (프론트/백엔드 공통)
- **발생 상황:** `@boim/shared-types` 등 공유 패키지에서 DTO나 인터페이스를 가져올 때 발생.
- **오류 내용:**
  1. 백엔드(NestJS): `emitDecoratorMetadata` 사용 시 클래스가 아닌 순수 타입을 일반 `import`로 가져와서 데코레이터(`@Body()` 등)에 주입하면 `error TS1272` (타입 참조 에러) 발생.
  2. 프론트엔드(Vite): esbuild가 빌드 시점에 런타임 값으로 오인하여 `does not provide an export named` 에러 발생.
- **해결 및 예방:** 클래스가 아닌 순수 타입(interface, type)을 가져올 때는 프론트엔드와 백엔드를 막론하고 무조건 **`import type { ... } from '...'`** 문법을 명시해야 함.

## 4. JSX 태그 구조 불일치(Parse Error)
- **발생 상황:** 기존 레이아웃이나 태그 이름(`section` -> `div`)을 변경하는 도중.
- **오류 내용:** 여는 태그를 수정했으나 닫는 태그를 수정하지 않아 (예: `<div ...> ... </section>`) 프론트엔드 빌드 툴(Vite/oxc)에서 Parse Error 발생.
- **해결 및 예방:** 특정 태그를 교체할 때는 여는 태그와 닫는 태그가 한 쌍으로 정확히 일치하는지 반드시 크로스체크(Cross-check) 할 것.

## 5. 백엔드 TS2304 에러: Cannot find name 'Post', 'Delete'
- **발생 상황:** `UserController`에 가져오기, 계정 탈퇴 등 새로운 엔드포인트 추가 중.
- **오류 내용:** `@Post`, `@Delete` 데코레이터를 사용했으나, 파일 상단 `@nestjs/common` 임포트 목록에 추가하지 않음.
- **해결 및 예방:** 백엔드 컨트롤러에 새로운 메서드 라우트를 추가할 때는 반드시 `@nestjs/common` 임포트 문에 해당 데코레이터가 포함되어 있는지 최우선으로 검증할 것.

## 6. 백엔드 TS2307, TS1272 에러: Cannot find module 및 import type 누락
- **발생 상황:** 위 5번의 임포트 에러를 해결하는 과정에서 발생.
- **오류 내용:** `@nestjs/common` 임포트를 수정하면서 기존에 없던 `JwtAuthGuard`를 잘못 가져와 모듈을 찾을 수 없다는 에러 발생. 동시에 인터페이스(DTO)를 `import type`이 아닌 일반 `import`로 변경하여 `isolatedModules` 환경에서 데코레이터에 잘못 참조됨(TS1272).
- **해결 및 예방:** 자동 수정(Replace) 툴을 사용할 때 기존 임포트 문이 덮어씌워지는 것을 인지하고, 원본 파일의 임포트를 반드시 정확히 확인(View File)한 뒤에 덮어쓸 것. 순수 타입(interface, type)은 무조건 `import type`으로 묶어야 함.

## 7. 엄격한 타입 정의 무시 및 `any` 타입 남용 오류
- **발생 상황:** 소셜 로그인(OAuth) 콜백 API 및 테스트 코드를 작성하는 도중.
- **오류 내용:** `req.user`의 타입을 엄격하게 정의하지 않고 `as any`로 캐스팅하여 에러를 회피함. 이후 이를 수정하기 위해 인터페이스를 도입하는 과정에서 `express`의 `Request`, `Response`를 값(Value)으로 임포트하여 데코레이터 환경에서 `TS1272` 에러가 또다시 재발함.
- **해결 및 예방:**
  1. **절대 `any`를 사용하지 말 것.** 프레임워크 제공 타입을 확장하는 명시적 인터페이스(예: `RequestWithOAuthUser`)를 선언하여 완벽한 타입 안정성을 확보할 것.
  2. 데코레이터에서 참조하는 타입은 반드시 **`import type`**으로 가져올 것(기존 3번 규칙 재상기).
  3. **기능 구현과 테스트 코드는 반드시 한 호흡으로 작성하여 단일 커밋**으로 묶을 것 (하네스 원칙 절대 준수).

## 8. Node 25 환경 Vitest localStorage 미초기화 및 JSDOM 폼 서브밋 이벤트 미트리거 오류
- **발생 상황:** Node.js 25 환경에서 프론트엔드 단위 테스트(`Login.spec.tsx`) 수행 중.
- **오류 내용:**
  1. Node 25의 기본 내장 `localStorage`가 JSDOM 환경의 스토리지와 충돌하여 Zustand persist 미들웨어에서 `TypeError: storage.setItem is not a function` 발생.
  2. JSDOM 환경에서 `<button type="submit">`에 `fireEvent.click`을 가할 때 실제 브라우저와 달리 폼의 `submit` 이벤트가 자동으로 연쇄 발화하지 않아 폼 제출 핸들러가 미호출됨.
- **해결 및 예방:**
  1. `apps/web/src/test/setup.ts`에 완전한 인터페이스를 갖춘 In-Memory `storageMock`을 구성하여 `window` 및 `globalThis`에 주입함으로써 Node 버전과 무관한 안정적인 테스트 환경 구축.
  2. 폼 제출 검증 시에는 JSDOM 합성 이벤트 특성을 고려하여 `fireEvent.submit(form)`을 명시적으로 호출하도록 테스트 코드 작성.

## 9. 인증 서비스(AuthService) 응답 이중 래핑 및 클라이언트 미처리 오류
- **발생 상황:** 로그인 화면에서 정상 계정 입력 후 로그인 버튼 클릭 시 다음 화면으로 전환되지 않는 현상.
- **오류 내용:**
  1. 백엔드 전역 인터셉터(`TransformInterceptor`)가 컨트롤러 반환값을 `{ success: true, data: T }`로 자동 감싸는데, `AuthService.login`에서 수동으로 `{ success: true, data: { accessToken, ... } }` 형태로 반환하여 이중 래핑(`response.data.data.accessToken`)이 발생함.
  2. 프론트엔드 `Login.tsx`에서는 `response.data?.accessToken`만 확인하고 있었으며, 불일치 시 `else` 처리나 사용자 피드백이 없어 버튼을 눌러도 조용히 함수가 종료됨.
  3. `AuthService.reauthenticate` 또한 예외를 던지지 않고 수동으로 `{ success: false, ... }`를 리턴하여 HTTP 200에 성공 응답으로 래핑되는 부작용 존재.
- **해결 및 예방:**
  1. 백엔드 서비스에서는 순수 페이로드(`{ accessToken, refreshToken }`)만 반환하도록 표준화하고, 검증 실패 시 `UnauthorizedException`을 throw하여 전역 `HttpExceptionFilter`가 올바른 `ApiResponse` 에러 구조로 변환하도록 수정.
  2. 프론트엔드 `Login.tsx`는 다중 구조를 수용하는 방어적 토큰 파싱을 적용하고, 응답 실패 시 사용자에게 즉각 에러 피드백을 노출하도록 개선.

## 10. 컨트롤러 응답 객체 직접 래핑에 따른 이중 래핑 및 프론트엔드 파싱 오류 (`reading 'category'`)
- **발생 상황:** Phase 10 증권 파일 업로드 & 패턴 매칭 데이터 파싱 API 연동 중.
- **오류 내용:**
  1. 백엔드 `main.ts`에 `TransformInterceptor`가 전역 등록되어 있어 컨트롤러가 반환한 데이터를 자동으로 `{ success: true, data: result }`로 감싸줌에도 불구하고, `DocumentController`에서 수동으로 `{ success: true, data: result }` 객체를 감싸서 반환함 (2번 오류 재발).
  2. 그 결과 응답이 `{ success: true, data: { success: true, data: result } }`로 이중 래핑되어 프론트엔드가 `res.data`를 참조할 때 실제 결과 객체가 아닌 중첩된 래퍼를 받아 `parseRes.parsedData`가 `undefined`가 됨.
  3. 프론트엔드 `handleParsedData`에서 `parsed.category`를 바로 참조하다가 `Cannot read properties of undefined (reading 'category')` 런타임 오류 발생.
- **해결 및 예방:**
  1. **백엔드:** `DocumentController`의 모든 라우트 핸들러에서 수동 래핑을 제거하고 `return this.documentService...` 형태로 순수 데이터만 반환하도록 수정.
  2. **프론트엔드 API 계층:** `useDocumentQueries.ts`에 재귀적 `unwrapResponse` 헬퍼 함수를 적용하여 단일/이중 래핑 여부에 관계없이 항상 순수한 알맹이 데이터를 보장하도록 방어 처리.
  3. **UI 컴포넌트:** `InsuranceForm.tsx`와 `PolicyDocumentUploader.tsx`의 핸들러에 `if (!parsed || typeof parsed !== 'object') return;` 가드를 두어 데이터 유효성 검증을 다중화.

## 11. 알림 수동 스캔 시 시각적 피드백 부재로 인한 '무반응' 오인 이슈
- **발생 상황:** Phase 11 알림 패널에서 스케줄러 즉시 동기화(🔄) 버튼 클릭 시.
- **오류 내용:** 당일 기준 만기/납입 예정 대상이 0건일 때 백엔드 API는 정상적으로 200 OK와 `{ createdNotifications: 0 }`을 반환했으나, UI에 성공 토스트나 결과 안내 배너가 없어 사용자가 버튼을 눌러도 시스템이 동작하지 않는 것으로 오인함.
- **해결 및 예방:** 스캔 완료 시 상단에 실시간 인앱 피드백 배너(`feedback`)를 즉시 띄워 "알림 검사 완료: X건 검사, Y건 신규 등록" 메시지를 명확히 안내함으로써 작업 상태를 투명하게 전달.

## 12. Prisma BigInt 직렬화 및 프론트엔드 옵셔널 필드 접근 시 TypeError
- **발생 상황:** Phase 12 AI 종합 진단 및 엑셀 다운로드 기능 구현 중.
- **오류 내용:**
  1. Prisma DB에서 `coverageAmount`는 `BigInt` 타입인데, 이를 DTO 또는 엑셀 라이브러리에 바로 전달할 경우 JSON 직렬화 불가(TypeError)가 발생할 위험이 있음.
  2. 프론트엔드 `AiDiagnosisReport.tsx`에서 `diagnosis.totalCoverageAmount`가 옵셔널이거나 비어있을 때 안전 가드 없이 `.toLocaleString()`을 호출하여 컴포넌트 렌더링 중 크래시 발생.
- **해결 및 예방:**
  1. 백엔드 서비스 계층에서 BigInt 필드는 DTO 매핑 시 반드시 `Number(p.coverageAmount)`로 안전 변환 처리.
  2. 프론트엔드에서는 `(diagnosis.totalCoverageAmount ?? 0).toLocaleString()`처럼 널 병합 연산자(Nullish coalescing)를 사용하여 옵셔널 필드에 대한 방어 코드를 필수로 작성.

## 13. 브라우저 인쇄(`window.print()`) 시 뷰포트 높이 고정으로 인한 내용 짤림 버그
- **발생 상황:** Phase 12-04 AI 종합 진단 리포트 인쇄/PDF 저장 기능 실행 시.
- **오류 내용:** SPA의 3열 레이아웃 특성상 최상위(`AppLayout`), 우측 패널(`RightPanel`), 리포트(`AiDiagnosisReport`)에 `h-screen`, `h-[85vh]`, `overflow-hidden`, `overflow-y-auto`가 지정되어 있어, 브라우저 인쇄 엔진이 현재 화면에 보이는 뷰포트 높이만큼만 캡처하여 스크롤 아래쪽 내용(카테고리별 적정도, 리모델링 조언 카드 3종 등)이 인쇄물에서 완전히 잘려나감.
- **해결 및 예방:**
  1. 상위 컨테이너 전반에 `@media print` 스타일(`print:h-auto print:overflow-visible print:block`)을 일괄 적용하여 인쇄 시 뷰포트/스크롤 높이 제한을 완전히 해제.
  2. 인쇄 시 불필요한 UI(사이드바, 헤더, 캘린더, 액션 버튼)는 `print:hidden`으로 숨기고 리포트를 A4 전체 폭(100%)으로 확장.
  3. 각 카드 요소에 `.print-avoid-break`(`page-break-inside: avoid`) 스타일을 부여하여 A4 페이지 경계선에서 카드가 반으로 잘리지 않고 깔끔하게 다음 페이지로 넘어가도록 개선.

## 14. TypeScript strict 모드(`tsc -b`) 미사용 식별자(`TS6133`) 빌드 실패 오류
- **발생 상황:** 컴포넌트 리팩토링 후 전체 모노레포 빌드(`pnpm build`) 수행 중.
- **오류 내용:** `tsconfig`의 `noUnusedLocals: true` 엄격 옵션으로 인해 컴포넌트 파일 상단에 import해두고 JSX 내에서 사용하지 않은 아이콘(`HelpCircle`)이 존재할 경우 `error TS6133: 'HelpCircle' is declared but its value is never read.` 에러와 함께 전체 빌드가 중단됨.
- **해결 및 예방:** 컴포넌트 수정 후 커밋 전 반드시 `pnpm build`를 선제적으로 실행하여 미사용 import 및 로컬 변수를 철저히 검수하고 즉시 제거할 것.

## 15. Axios 클라이언트 인터셉터 사전 언래핑에 따른 React Query 응답 불일치 위험
- **발생 상황:** 프론트엔드 신규 API 쿼리 훅(`useDiagnosisQueries.ts` 등) 개발 중.
- **오류 내용:** 공통 `apiClient`(`apps/web/src/api/client.ts`)에 응답 인터셉터(`response => response.data`)가 기본 등록되어 있어, 백엔드 전역 `TransformInterceptor`의 `{ success: true, data: T }` 중 백엔드가 보낸 응답 본문 전체가 반환됨. 이때 프론트엔드 훅에서 `response.data`를 한 번 더 참조하면 백엔드 래핑 구조에 따라 `undefined`가 될 수 있음.
- **해결 및 예방:** 신규 쿼리 훅 작성 시 `const unwrapData = (res: any) => (res as any)?.data ?? res;`와 같은 방어적 언래핑 유틸을 공통 적용하여 단일/이중 래핑에 상관없이 순수한 페이로드 데이터(`data: T`)를 안전하게 추출하도록 표준화.

## 16. 패키지 설치 시 백그라운드 개발 서버(Dev Server) 예기치 않은 종료 현상
- **발생 상황:** Phase 12-02 `exceljs` 패키지 설치(`pnpm add exceljs`) 수행 중.
- **오류 내용:** 백엔드/프론트엔드 dev 서버가 구동 중인 상태에서 새로운 npm 패키지를 설치하면 pnpm의 심볼릭 링크 및 노드 모듈 락 갱신 과정에서 백그라운드 데몬 프로세스가 예기치 않게 종료되어 API 포트(4000)가 오프라인이 됨.
- **해결 및 예방:** 신규 패키지 설치 직후에는 반드시 프로세스 및 포트 리스닝 상태(`curl` 또는 태스크 상태)를 확인하고, 서버가 종료된 경우 즉시 dev 서버를 재기동하여 연동 단절을 방지할 것.

## 17. CI/자동화 환경에서 Vitest Watch 대화형 모드 블로킹(Hang) 현상
- **발생 상황:** 백그라운드 태스크로 프론트엔드 단위 테스트 실행 시.
- **오류 내용:** `pnpm --filter web test` 명령은 기본적으로 vitest의 인터랙티브 watch 모드로 진입하여 터미널이 무한 대기(Hang) 상태에 빠져 다음 자동화 파이프라인이 진행되지 않음.
- **해결 및 예방:** 비대화형 일회성 테스트 검증 시에는 반드시 `pnpm --filter web exec vitest run` 플래그를 명시하여 테스트 종료 후 프로세스가 정상적으로 0/1 코드를 반환하고 종료되도록 실행할 것.

## 18. pnpm 모노레포 Docker 멀티스테이지 빌드 & 런타임 모듈 누락 오류
- **발생 상황:** Phase 18 Dockerfile 및 Docker Compose 패키징 중 (`apps/api`, `apps/web`).
- **오류 내용:**
  1. `COPY apps/web ./apps/web` 방식으로 호스트 디렉토리를 통째로 복사하면 컨테이너 내 pnpm 심볼릭 링크가 손상되어 `Cannot find module tsc` 에러 발생.
  2. NestJS runner 스테이지에서 루트 `/app/node_modules`만 복사하고 `apps/api/node_modules`를 누락하여 `Cannot find module '@nestjs/core'` 런타임 에러 발생.
  3. `prisma generate` 아티팩트(`@prisma/client`)는 `builder` 스테이지에서 생성되므로 `dependencies` 스테이지 node_modules를 runner로 복사하면 초기화되지 않은 클라이언트 에러 발생.
- **해결 및 예방:**
  1. 소스 코드는 필요한 디렉토리(`src/`, 설정 파일)만 선별 복사하여 심볼릭 링크 구조를 보존할 것.
  2. runner 스테이지에는 Prisma client가 컴파일된 `builder` 스테이지의 `/app/node_modules`와 `/app/apps/api/node_modules`를 모두 복사하고, `NODE_PATH` 환경변수를 함께 지정할 것.
  3. 컴파일 경로(`dist/src/main.js` vs `dist/main.js`) 분기 런타임 스크립트를 적용하여 빌드 아웃풋 불일치 크래시를 방지할 것.

> **결론:** "기존에 구축된 공통 모듈(apiClient, Interceptor)이 있는지 반드시 확인하고, 이를 적극 활용하며 중복 처리를 절대 하지 말 것. 또한 타입 임포트 시 `import type`을 반드시 명시하고, 파일 편집 시 태그 및 문법 짝을 확실하게 검수하며, Replace 툴 사용 시 기존 코드의 유실 여부를 반드시 크로스체크할 것. **무엇보다 `any` 타입은 프로젝트 내에서 절대 금지되며, 기능-테스트-커밋의 원사이클을 반드시 지킬 것.**"
