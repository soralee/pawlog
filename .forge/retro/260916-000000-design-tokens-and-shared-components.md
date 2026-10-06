# 2026-09-16 — Phase A 디자인 토큰 + 공용 컴포넌트

## Plan vs actual
- 계획대로 된 것: 토큰(Colors/Spacing/Radius/Typography) 재작성, Button/Input/Card/ListItem/DDayChip/EmptyState/ConfirmDialog 7개 컴포넌트 + 테스트 49개 전부 계획대로 완료.
- Divergence: ConfirmDialog 작성 중 ThemedText의 기존 type 유니온이 design-guide Typography 스케일(display/title/heading/body/bodySmall/caption)과 부분적으로만 겹친다는 걸 발견 — heading 하나만 추가해서 해결. default/small/subtitle 등 나머지 옛 variant는 이번 범위 밖이라 손대지 않음.

## Learnings
- Do differently next time: 화면을 재설계하는 단계(Phase B 이후)에서 ThemedText를 실제로 쓸 때, 남은 옛 variant 이름과 design-guide 스케일 이름이 계속 부분적으로만 겹치는 채로 갈지, 이번 기회에 전부 정리할지 판단이 필요함. Phase B에서는 그냥 기존 이름(title/small/default)을 그대로 썼음 — 아직 미정리 상태.

## Doc updates
- CONTEXT.md promotion: none (구현 세부사항, 도메인 용어 아님)
- ADR added: none (되돌리기 쉬운 사소한 타입 보강이라 ADR 기준 미충족)
