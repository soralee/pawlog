# 2026-10-14 — Ionicons 아이콘 시스템 도입 + 상세 화면 헤더 레이아웃 정리

## Plan vs actual
S1·S3는 계획대로. S2(탭바 아이콘 교체)는 계획과 다른 방식으로 해결됨 — `NativeTabs`가 JS 아이콘 컴포넌트를 렌더할 수 없다는 기술 제약을 구현 중에 발견해, 사용자 확인 후 표준 `Tabs`로 전환(ADR `261014-161147`).

## Learnings
- Do differently next time: 네이티브 UI 프리미티브(이번엔 `NativeTabs`)를 쓰기로 정할 때는 그릴링 단계에서 "이 작업에 필요한 렌더링 방식(이번엔 임의 아이콘 컴포넌트)을 실제로 지원하는지"를 먼저 확인해야 한다 — 구현 중간에 막히면 아키텍처를 다시 정해야 해서 더 비쌈.
- 정리 후보(조치 안 함): NativeTabs→Tabs 전환으로 더 이상 안 쓰는 `assets/images/tabIcons/*.png` 12개가 코드베이스에 남아있음(참조 0건 확인). 이번 작업이 만든 orphan이 아니라 손대지 않음 — 사용자가 원하면 별도로 삭제.

## Doc updates
- CONTEXT.md promotion: none
- ADR added: `.forge/adr/261014-161147-standard-tabs-over-native-tabs-for-ionicons.md`
