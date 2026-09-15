---
author: soralee
decided: 2026-09-15 15:40
---
# Development Build는 현재 Xcode/Swift 툴체인에서 컴파일되지 않는다 (당분간 보류)

`expo-dev-client` 설치 후 `expo run:ios`를 시도하면, Expo SDK 57이 의존하는 `expo-modules-jsi@57.1.0`(57.x 최신 패치)의 벤더 Swift 소스(`JavaScriptError.swift` 등 6개 파일)가 `weak let runtime: ...` 형태로 선언되어 있어 컴파일이 실패한다 — `weak`는 Swift에서 항상 `var`에만 허용되므로, 설치된 Xcode 26.0.1(Swift 6.2)의 컴파일러가 이를 거부한다(15개 에러). SDK 58(`expo-modules-jsi@58.x`)에서는 고쳐졌을 가능성이 있지만, 이번 프로젝트는 SDK 57에 고정되어 있고(ADR `260915-103028` 등) SDK 전체를 올리는 것은 이 작업 범위를 크게 벗어난다. 그래서 실제 네이티브 알림 예약을 기기/시뮬레이터에서 검증하는 작업(Phase 3의 S1/S3)은 호환되는 Xcode 버전이 나오거나 expo-modules-jsi 패치가 나올 때까지 보류하고, 이번엔 `medications`/`reminders`의 데이터 계층(마이그레이션·Repository, Jest로 검증 가능한 부분)만 진행한다.
