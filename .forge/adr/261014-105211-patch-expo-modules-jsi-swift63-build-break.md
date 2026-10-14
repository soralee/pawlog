---
author: soralee
decided: 2026-10-14 10:52
---
# expo-modules-jsi의 Xcode 26.4(Swift 6.3) 요구를 Xcode 업그레이드 대신 pnpm 패치로 우회한다

Development Build를 시뮬레이터에 처음 설치하려고 `pnpm ios`를 돌리자 `node_modules/expo-modules-jsi`(expo-modules-core 57.0.22가 `~57.1.2`로 고정 요구)의 Swift 소스 여러 곳(`weak let runtime: JavaScriptRuntime?`)이 "'weak' must be a mutable variable" 에러로 빌드가 깨졌다. 원인은 패키지 자체 버그가 아니라 툴체인 요구 버전 차이다 — `weak let`은 Swift 6.3(Xcode 26.4+)에서만 유효한 문법인데, 로컬에 설치된 Xcode는 26.0.1(Swift 6.2)이다(Expo 공식 이슈 [expo/expo#46242](https://github.com/expo/expo/issues/46242), [expo/expo#51041](https://github.com/expo/expo/issues/51041)).

대안은 (a) Xcode를 26.4+로 업그레이드하거나 (b) `pnpm patch`로 `node_modules/expo-modules-jsi`의 `weak let`을 `nonisolated(unsafe) weak var`로 바꿔 로컬에서만 우회하는 것이었다. Xcode 업그레이드는 근본적인 해결책이지만 수 GB 다운로드+설치에 시간이 걸려, 지금 당장 UAT를 위해 시뮬레이터를 띄우는 데는 (b)를 택했다 — `pnpm patch`/`patch-commit`으로 만든 패치는 `pnpm-workspace.yaml`의 `patchedDependencies`에 기록되고 `patches/expo-modules-jsi@57.1.2.patch`로 저장소에 커밋되어, `pnpm install`을 다시 해도 재현된다.

대가는 두 가지다: ① 이 패치는 Xcode 26.4+로 업그레이드하면 더 이상 필요 없어지므로, 업그레이드 후에는 `patches/expo-modules-jsi@57.1.2.patch` 삭제 + `pnpm-workspace.yaml`의 `patchedDependencies` 항목 제거가 필요하다. ② `expo-modules-jsi`가 다음에 또 패치 버전이 올라가면(예: 57.1.3) 패치 대상 버전이 달라져 다시 `pnpm patch`로 재작성해야 한다 — `expo install`로 인한 patch 버전 드리프트 수정 시 이 점을 함께 확인해야 한다.
