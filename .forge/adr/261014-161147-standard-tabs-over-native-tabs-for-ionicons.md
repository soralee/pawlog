---
author: soralee
decided: 2026-10-14 16:11
---
# 하단 탭 네비게이터로 NativeTabs 대신 표준 Tabs를 쓴다

디자인 가이드의 Ionicons 통일 작업에서 탭바 아이콘을 PNG에서 Ionicons로 바꾸려 했으나, `expo-router/unstable-native-tabs`의 `Trigger.Icon`은 `sf`(SF Symbol)/`drawable`/`src`(이미지)만 받고 임의의 React 컴포넌트를 렌더할 수 없다는 제약을 구현 중에 발견했다. 대안은 (a) iOS에서는 SF Symbol로, Android에서는 drawable로 맞춰 네이티브 탭바를 유지하는 것과 (b) `expo-router`의 표준(JS 기반) `Tabs`로 전환해 `tabBarIcon`에 Ionicons 컴포넌트를 직접 렌더하는 것이었다. 전체 앱에서 아이콘 일관성(Ionicons 하나로 통일)을 지키기 위해 (b)를 택했다 — 플랫폼별로 다른 아이콘 세트(SF Symbol vs drawable)를 유지보수하는 비용과 "같은 디자인 언어" 원칙을 저울질한 결과다. 대가는 네이티브 탭바가 주는 플랫폼 고유의 느낌(예: iOS의 네이티브 블러/하이라이트)을 포기하고 JS 렌더링 탭바를 쓴다는 점이다.
