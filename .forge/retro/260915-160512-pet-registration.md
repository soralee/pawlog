# 2026-09-15 — Phase 1 반려동물 등록 (Pet CRUD + 나이 계산)

## Plan vs actual
- What went as planned: `pets` 마이그레이션, 등록/조회/수정 Repository, "내 반려동물" 탭 폼 연결 — 목표 자체는 계획대로 달성.
- Divergences: 계획은 수동 `getDatabase()` 싱글턴을 가정했지만 실제로는 `expo-sqlite`의 공식 관용구인 `SQLiteProvider`/`useSQLiteContext`로 채택(더 나은 패턴 발견). `expo-sqlite`가 네이티브 모듈이라 Jest에서 못 도는 걸 실행 중에야 인지해, Repository를 DI로 설계하고 인메모리 페이크로 테스트하는 전략을 그 자리에서 결정(ADR `260915-141837`).

## Learnings
- Do differently next time: 네이티브 모듈에 의존하는 Repository를 계획할 때는 "이걸 어떻게 단위 테스트할지"를 계획 단계에서 먼저 정해두면 실행 중 멈춰서 다시 묻는 일이 줄어든다. `react-hooks/set-state-in-effect` 오탐이 세팅(#1)에 이어 또 나왔다 — 마운트 시 데이터 fetch 패턴에서 구조적으로 반복될 가능성이 있음(다만 evals로 승급할 만큼 기계적으로 검증 가능한 형태는 아님, 매번 사유를 남기는 주석 처리로 충분).

## Doc updates
- CONTEXT.md promotion: none
- ADR added: none (ADR `260915-141837`은 실행 중에 이미 기록됨)
