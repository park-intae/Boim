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

> **결론:** "기존에 구축된 공통 모듈(apiClient, Interceptor)이 있는지 반드시 확인하고, 이를 적극 활용하며 중복 처리를 절대 하지 말 것. 또한 타입 임포트 시 `import type`을 반드시 명시하고, 파일 편집 시 태그 및 문법 짝을 확실하게 검수하며, Replace 툴 사용 시 기존 코드의 유실 여부를 반드시 크로스체크할 것."
