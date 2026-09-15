# 2026-09-15 — Phase 2 건강 기록 (health_records/vaccinations/checkups/weight_records)

## Plan vs actual
- What went as planned: 4개 테이블 + Repository(생성/petId별 목록/수정/삭제) 전부 계획대로. "기록" 탭 세그먼트 구조(착수 직전 그릴링에서 확정한 대로).
- Divergences: "추가/수정/삭제 화면" 중 수정(edit) UI는 이번 범위에서 뺐다(Repository엔 있음, UI엔 없음). UAT 중 두 가지 실사용 이슈 발견: (1) 날짜 형식만 확인하고 실제 존재 여부는 검증 안 함, (2) 등록 날짜가 오늘로 고정되어 있어 자유 입력 요청. 둘 다 그 자리에서 수정.

## Learnings
- Do differently next time: `@testing-library/react-native@14`의 `fireEvent.*`가 Promise를 반환하는데 `await` 누락 시 상태 업데이트가 조용히 유실되는 문제가 같은 작업 안에서 두 번 발생 — 아래에서 기계적으로 막도록 승급함.
- 날짜 입력 필드는 "형식 검증"과 "실제 존재 검증"을 처음부터 같이 설계해야 한다(이번엔 UAT에서야 발견).

## Doc updates
- CONTEXT.md promotion: none
- ADR added: none
- Eval added: `@typescript-eslint/no-floating-promises`를 `eslint.config.js`에 추가(type-aware, `projectService: true`) — await 안 한 Promise를 lint 단계에서 기계적으로 잡는다. 기존 코드의 의도적 fire-and-forget 8곳(마운트 시 데이터 fetch, 스플래시 처리)은 `void`로 명시해 통과시켰다. lint 실행 시간 영향 미미(1.4초). 커밋 `b3cb1cf`.
