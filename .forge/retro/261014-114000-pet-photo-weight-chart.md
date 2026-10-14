# 2026-10-14 — Phase G (프로필 사진 및 체중 그래프)

## Plan vs actual
계획대로 진행. 두 가지만 특기할 만함:
- 계획 문서가 가리킨 "`screen-layout.md` §16"이 실제로는 §11로 바뀌어 있었음 — 문서 번호가 바뀌는 건 이 세션에서 반복된 패턴(§6/§25/§26도 같은 이유로 재확인했던 적 있음).
- SDK 57의 `expo-file-system`이 레거시 API(`FileSystem.documentDirectory` 등)에서 `File`/`Directory` 클래스 기반 API로 바뀌어 있어, AGENTS.md의 "Expo HAS CHANGED" 경고대로 실제 타입 선언을 확인하고 구현함(웹 검색 결과와 실제 타입이 미묘하게 달랐음 — `copy()`가 새 File을 반환하는 게 아니라 `Promise<void>`였음).

## Learnings
- Do differently next time: 외부 라이브러리의 "최근 변경된 API"를 다룰 때는 웹 검색 요약을 그대로 믿지 말고 `node_modules`의 실제 `.d.ts`를 직접 확인하는 게 더 정확함(이번에 `File.copy()`의 반환 타입이 요약과 실제가 달라 타입 에러로 발견됨). 이번엔 타입체크가 바로 잡아줘서 큰 문제는 없었음.
- Do differently next time: 새 네이티브 모듈을 추가한 뒤의 Pods 재설치는 이제 거의 기계적인 단계(rm -rf Pods Podfile.lock && pod install)로 자리잡음 — 이번엔 한 번에 성공해 `261014-105211` 패치의 재현성도 함께 확인됨.

## Doc updates
- CONTEXT.md promotion: none
- ADR added: none (새로운 트레이드오프 결정은 없었음 — 기존 ADR `260915-103028`의 "필요해질 때 설치" 방침을 그대로 실행한 것뿐)

## Follow-up candidate (백로그 후보, 이 Plan 범위 밖)
Pet Detail의 건강 관리 목록 중 "건강 기록"/"예방접종"/"건강검진" 세 항목이 아직도 `/records`(전체 탭)로만 이동하고, 이번에 고친 "체중"처럼 `/pets/[petId]/...` 중첩 라우트로 가지 않음 — Plan 1(`pet-detail-and-nested-routes`) 당시 남겨진 미완료 부분으로 보임. 언젠가 작은 정리 작업으로 처리하면 좋을 듯.
