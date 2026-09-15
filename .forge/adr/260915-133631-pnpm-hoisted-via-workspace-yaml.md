---
author: soralee
decided: 2026-09-15 13:36
---
# pnpm 노드 링커는 `.npmrc`가 아니라 `pnpm-workspace.yaml`로 고정한다

React Native/Expo 프로젝트는 Metro와 Jest가 패키지를 평평한(flat) `node_modules` 구조로 찾는다는 전제가 있어, pnpm의 기본 격리(isolated) 링킹(`node_modules/.pnpm/...` 중첩 구조) 아래서는 `@react-native/jest-preset` 같은 패키지를 Jest의 `transformIgnorePatterns`가 못 찾아 `Cannot use import statement outside a module`로 깨진다. 관례대로 `.npmrc`에 `node-linker=hoisted`를 적었지만 이 pnpm 버전(11.11.0)은 프로젝트 단위 `.npmrc`의 이 키를 읽지 않았고, `pnpm-workspace.yaml`의 `nodeLinker: hoisted`만 실제로 적용됐다. 그래서 이 프로젝트는 hoisted 링킹을 `pnpm-workspace.yaml`로 고정한다 — `.npmrc`만 보고 "이미 설정했다"고 착각하지 않는다.
