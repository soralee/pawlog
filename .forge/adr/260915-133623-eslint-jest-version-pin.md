---
author: soralee
decided: 2026-09-15 13:36
---
# ESLint/Jest 버전은 Expo 프리셋의 peer 요구사항에 맞춰 고정한다

`eslint-config-expo`(57.0.2)와 `jest-expo`(57.0.5)는 각각 `eslint@^9`, `jest@^29.2.1`까지만 지원한다 — 최신 `eslint@10`/`jest@30`을 설치하면 `eslint-plugin-import`/`eslint-plugin-react`/`jest-watch-typeahead` 등 프리셋 내부 의존성과 peer 충돌이 난다. 그래서 이 프로젝트는 의도적으로 `eslint@^9.39.5`, `jest@^29.7.0`(과 `@types/jest@^29`)로 고정했다. Expo SDK가 올라가 프리셋들이 최신 major를 지원하기 전까지는, `eslint`/`jest`를 습관적으로 최신으로 올리면 안 된다.
