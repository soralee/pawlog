# 2026-09-15 — Pawlog Expo SDK 57 프로젝트 초기 세팅

## Plan vs actual
- 계획대로 된 것: 4개 탭(홈/기록/일정/내 반려동물) 뼈대, 툴체인(ESLint/Prettier/Jest), 런타임 의존성(zustand/RHF/zod/date-fns/expo-sqlite/expo-notifications), `src/` 폴더 구성, DoD 통과 후 커밋 — 목표 자체는 달성.
- divergences:
  - SDK 57 default 템플릿의 실제 구조가 계획의 가정(`app/(tabs)/_layout.tsx`)과 달랐음 — 실제로는 `src/app/*.tsx`(라우트 그룹 없는 플랫 구조) + `expo-router/unstable-native-tabs`(NativeTabs)를 쓰는 템플릿.
  - `eslint-config-expo`/`jest-expo`가 각각 `eslint@9`, `jest@29`까지만 지원해 최신 대신 그 버전으로 고정.
  - pnpm `.npmrc`의 `node-linker=hoisted`가 이 pnpm 버전(11.11.0)에서 프로젝트 단위로 안 읽혀 `pnpm-workspace.yaml`로 우회.
  - (UAT 중 발견) Expo Router가 `src/app/` 아래 모든 파일을 예외 없이 라우트로 스캔해, 거기 둔 테스트 파일이 웹 번들에 포함되어 `expect is not defined` 크래시.
  - (회고 중 자체 발견) eval 작성 중 `tsconfig.json`의 `"types": ["jest"]`이 `@types/node`의 자동 포함까지 막아 `fs`/`path`/`__dirname` 타입 에러 — `["jest", "node"]`로 수정.

## Learnings
- Do differently next time: 새 Expo 프로젝트 계획을 짤 때는 참고 문서(예: 다른 도구가 미리 작성한 plan)의 구조 가정을 그대로 베끼지 말고, `create-expo-app`으로 실제 템플릿을 한 번 만들어보고 실제 구조를 확인한 뒤 계획 문서를 쓴다. 또한 `tsconfig.json`에 `"types"` 배열을 좁힐 때는 그 프로젝트에서 실제로 쓰는 모든 앰비언트 타입 패키지(jest, node 등)를 빠짐없이 나열해야 한다 — 하나라도 빠지면 자동 포함이 아예 꺼진다.

## Doc updates
- CONTEXT.md promotion: none
- ADR added: ADR `260915-133623`(ESLint/Jest 버전 고정), ADR `260915-133631`(pnpm 노드 링커는 pnpm-workspace.yaml로)
- Eval added: `src/__tests__/app-root-no-tests.test.ts` — `src/app/`(Expo Router 루트) 아래 테스트 파일이 없는지 검증 (red→green 확인함)
