# 2026-10-14 — 멀티펫 전환 2/3 (Records/Schedule 전체+펫별 필터 + 기록·일정 생명주기 분리)

## Plan vs actual
- 계획대로 된 것: S1~S8 전부 그릴링에서 확정한 그대로 구현됨. 생명주기 분리(같은 행 nullable 필드)와 멀티펫 필터(Graceful Mode 포함) 둘 다 추가 설계 변경 없이 순조롭게 진행.
- Divergence(사소, 구현 세부사항 수준): 펫 필터 Chip과 "+"의 펫 선택 Sheet가 같은 펫 이름을 접근성 라벨로 써서 테스트에서 충돌 — 필터 Chip 라벨을 `"{이름} 필터"`로 구분. Schedule 탭의 `groups` 파생값에서 React Compiler가 "기존 메모이제이션을 보존할 수 없다"는 lint 에러를 내 `useMemo`를 걷어냄(동작 차이 없음, lint로 즉시 잡힘).
- Divergence(환경 이슈, 계획 외): UAT를 위해 시뮬레이터에 Development Build를 처음 설치하는 과정에서 `expo-modules-jsi`가 Xcode 26.4(Swift 6.3)를 요구하는데 로컬 Xcode는 26.0.1이라 빌드가 깨짐. `pnpm patch`로 우회(ADR `261014-105211`). CocoaPods 로컬 Podspec 캐시가 `expo install`로 패키지 버전을 바꿀 때마다 stale해지는 문제도 재현 — `ios/Pods`+`Podfile.lock` 삭제 후 재설치로 해결(두 번 재현됨).

## Learnings
- Do differently next time: 이번 세션에서 처음으로 시뮬레이터에 Development Build를 설치했는데, Xcode 버전 요구사항이 걸림돌이 될 수 있다는 걸 몰랐다 — 다음에 Xcode를 26.4+로 업그레이드하면 `patches/expo-modules-jsi@57.1.2.patch`와 `pnpm-workspace.yaml`의 `patchedDependencies` 항목을 정리해야 한다(ADR에 기록해둠).
- Do differently next time: `expo install`로 네이티브 패키지 버전을 바꾼 뒤에는 `ios/Pods`가 거의 항상 stale해진다 — `pod update <pkg> --no-repo-update`로 하나씩 고치려 하지 말고, 바로 `rm -rf ios/Pods ios/Podfile.lock && pod install`로 깨끗하게 재설치하는 게 더 빠르다(이번에 두 번 다 결국 이 방법으로 해결).

## Doc updates
- CONTEXT.md promotion: none (도메인 용어 변경 없음 — 이미 ADR `261007-103000`에서 생명주기 모델 확정 완료)
- ADR added: `.forge/adr/261014-105211-patch-expo-modules-jsi-swift63-build-break.md` (Xcode 버전 요구를 pnpm 패치로 우회한 결정 — 되돌리는 조건과 재현 방법을 남겨둠)
