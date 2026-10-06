# 2026-10-06 — 디자인 토큰 v2 마이그레이션 (Coral Primary 전환)

## Plan vs actual
- 계획대로 된 것: theme.ts 전면 교체(Primary=Coral, accent 제거, 신규 토큰 추가, Radius 개명), DDayChip 색상 로직 단순화 전부 계획대로. 이미 구현된 Phase A/B/C 화면이 전부 semantic 토큰 이름(`Colors.light.primary` 등)만 참조하고 있어서, 값만 바꿔도 거의 손댈 곳 없이 전체 리브랜딩이 끝남 — Phase A에서 "Consistency Over Novelty" 원칙대로 처음부터 공용 토큰/컴포넌트를 썼던 게 그대로 효과를 봄.
- Divergence: 착수 전 DoD baseline 확인 중 expo-doctor가 패치 버전 드리프트로 또 실패(세션 중 두 번째 — 지난번은 Phase B 직전). 이번에도 `expo install`로 해결.

## Learnings
- Do differently next time: 세션 사이 며칠씩 비는 경우 expo-doctor 패치 드리프트가 거의 매번 재현된다 — 이제 패턴으로 확인됐으니, 다음 작업 착수 전 DoD baseline 체크에서 이 실패를 보면 바로 "며칠 경과 때문"이라고 판단하고 `expo install`부터 돌리면 됨. 별도 디버깅 불필요.

## Doc updates
- CONTEXT.md promotion: none
- ADR added: none (둘 다 되돌리기 쉽고 트레이드오프랄 것도 없는 사소한 결정)
