# 2026-09-15 — Phase 3 복약 및 일정 (범위 축소: 데이터 계층만)

## Plan vs actual
- What went as planned: `medications`/`reminders` 마이그레이션 + Repository(S2).
- Divergences: S1(`expo-dev-client` 전환)이 Xcode 26.0.1/Swift 6.2와 `expo-modules-jsi@57.1.0`의 컴파일 비호환으로 실패, S3(실제 알림 예약)까지 함께 보류됨(ADR `260915-154023`). 사용자 확인 후 이번 범위를 S2만으로 좁혔다. 이후 진행한 로드맵 재편(screen-layout.md 기반)에 이 상황을 이미 반영해뒀다(Phase D/I가 이 ADR을 참조).

## Learnings
- Do differently next time: 네이티브 빌드가 필요한 작업은 착수 훨씬 전(가능하면 프로젝트 세팅 단계)에 "실제로 빌드가 되는지" 가볍게 한 번 확인해두면, Phase 중간에 멈추지 않고 더 일찍 알 수 있다.

## Doc updates
- CONTEXT.md promotion: none
- ADR added: none (ADR `260915-154023`은 실행 중에 이미 기록됨)
