# 2026-09-16 — Phase B 기록 탭 구조 재편 + 디자인 적용

## Plan vs actual
- 계획대로 된 것: S1(라우트 재편+OptionSheet), S2(4개 타입 CRUD 화면), S3(필터+월별 그룹 타임라인) 전부 계획대로 완료.
- Divergences:
  - `.expo/types/router.d.ts`는 `expo start`(dev server)에서만 갱신되고 `expo export`로는 갱신되지 않아, 새 라우트 파일 추가 직후 typecheck가 실패했다 (빌드 도구 특성, 코드 문제 아님).
  - `get(id)` 추가 리팩터 중 `update()`가 이미 매핑된 도메인 객체를 다시 `toXxx()`로 매핑하려던 실수 — 4개 리포지토리 모두 `...existing` 스프레드로 수정.
  - UAT 중 사용자가 발견: (1) 목록 화면이 마운트 시 한 번만 데이터를 불러와 삭제 후 되돌아와도 갱신 안 됨 → `useFocusEffect`로 교체, (2) 상세 화면 뒤로가기 버튼에 이전 라우트 이름("(tabs)")이 그대로 노출 → 루트 Stack에 `headerBackButtonDisplayMode: 'minimal'` 적용.

## Learnings
- Do differently next time:
  - **목록 화면은 마운트 시 1회 fetch가 아니라 `useFocusEffect`로 불러와야 한다** — 다른 화면(등록/수정/삭제)에서 돌아왔을 때 최신 상태를 반영하려면 포커스 기반 재조회가 기본이어야 함. Phase C(일정)/F(홈)/H(반려동물 목록) 전부 목록 화면을 새로 만드는 작업이라 이 패턴을 처음부터 적용해야 함.
  - 새 라우트 파일을 추가한 직후엔 `pnpm typecheck` 전에 `expo start`를 한 번 잠깐 띄웠다 꺼서 타입드 라우트 파일을 갱신해야 함 (Phase C 이후에도 반복될 가능성 높음).
  - Stack 화면을 새로 추가할 때 헤더 옵션(뒤로가기 버튼 표시 방식 등)은 화면 단위가 아니라 루트 Stack의 `screenOptions`로 한 번에 잡아야 실수가 없다.

## Doc updates
- CONTEXT.md promotion: none (전부 구현/툴체인 디테일, 도메인 용어 아님)
- ADR added: none (되돌리기 쉬운 수정들이라 "hard-to-reverse" 기준 미충족)
