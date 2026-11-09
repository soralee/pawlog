# Phase 6 시뮬레이터 재검증 보고서

- 일시: 2026-11-09 14:21~14:23 (KST)
- 수행: 오케스트레이터 직접 수행. qa#9C1D(codex, auto-review)가 샌드박스에서 CoreSimulatorService 연결이 반복해서 끊겨 사용자 지시로 통합 수행.
- 환경: iPhone 16e 시뮬레이터(iOS 26.0), dev client + 기존 Metro, Maestro 2.12.1
- 시드: `/tmp/pawlog-qa-seed/single.db`(1마리), `multi.db`(3마리), `pastonly.db`(single에서 미래 일정 삭제 + 지난 검진 1건 추가)
- 캡처: `plan/reference/captures/phase6/` 28장
- 기준: `plan/coral-gap-work-plan.md` 확정 결정 12~16, D1~D4, Phase 5 시안 대조 체크리스트(`qa-visual-compare.md`)

## 결과 요약

| 구분 | 통과 | 실패 | 판단 불가 |
|---|---|---|---|
| D1~D4 | 4 | 0 | 0 |
| N1~N4(2) (결정 12~16) | 5 | 0 | 0 |
| 기존 체크리스트 회귀 | 18 | 0 | 0 |

새로 발견한 관찰 사항 3건(O1~O3)은 실패가 아니라 후속 판단 대상이다.

## D1~D4

| # | 결과 | 근거 캡처 | 확인 내용 |
|---|---|---|---|
| D1 | 통과 | `home-single.png`, `medication-index.png` | Hero에 복약 라벨 없음(결정 13). 복약 index `다음 복약은 오후 7:00이에요.`(14:22 기준 첫 이후 복약) |
| D2 | 통과 | `home-single-mid.png`, `schedule.png`, `medication-index.png` | 오전 6:00 → 오후 7:00 → 오후 9:00 순 |
| D3 | 통과 | `weight-index.png` | y축 라벨 소수 1자리(0.0~4.7), 잘림 없음. 점·선 코랄, 축 연회색 |
| D4 | 통과 | `confirm-dialog-delete-nabi.png`, `confirm-dialog-delete.png` | `나비를 삭제할까요?` |

## 확정 결정 12~16

| 결정 | 결과 | 근거 캡처 | 확인 내용 |
|---|---|---|---|
| 12 (N1) 다음 일정에서 지난 일정 제외 | 통과 | `home-single.png`, `pets.png`, `vaccination-index.png`, `checkup-index.png`, `home-multi.png`, `pets-multi.png` | 지난 `코로나 장염(11/4)`이 홈·내 반려동물·접종 index 상단에 나오지 않고 `종합백신 D-5`가 첫 일정 |
| 12 (N1) 지난 일정만 있을 때 | 통과 | `pastonly-home.png`, `pastonly-pets.png`, `pastonly-vaccination-index.png`, `pastonly-checkup-index.png` | 홈 `예정된 일정이 없어요.` + `지난 일정은 일정 탭에서 확인할 수 있어요.` + `일정 추가`. 카드 `다가오는 일정 없음`. index `예정된 예방접종/건강검진이 없어요.` + 안내 |
| 12 (N1) 일정 탭 지난 일정 유지 | 통과 | `schedule-scroll2.png`, `pastonly-schedule.png` | `지난 일정` 구획에 `N일 지남` + `완료하기` 유지 |
| 13 (N2) Hero 라벨 제거 | 통과 | `home-single.png`, `home-multi.png` | 단일 Hero·다중 카드 모두 이름 + 나이·품종만 |
| 14 (N3) 오늘 구획 | 통과 | `schedule.png` | `오늘` 제목 하나, `오늘의 복약` 소제목 없음 |
| 15 (N4(1)) Warning 칩 대비 | 통과 | `home-single.png`, `vaccination-index.png`, `checkup-index.png` | 칩 글자 진한 갈색, 연한 코랄 카드 위 칩은 갈색 테두리 변형 |
| 16 (N4(2)) 기록 추가 시트 아이콘 색 | 통과 | `records-add-sheet.png` | 건강 기록 코랄, 예방접종 파랑, 건강검진 초록, 복약 주황, 체중 파랑, 병원비 주황 |

## 기존 체크리스트 회귀 (18개)

모두 통과. 대표 근거: 인사 두 줄과 종 아이콘·단일 Hero·다중 카드(`home-single.png`, `home-multi.png`), 일정 카드와 아이콘 타일/날짜/D-day(`home-single.png`, `schedule.png`), 오늘 복약 아이콘·시간(`home-single-mid.png`), 병원비 큰 숫자와 장식 아이콘·최근 기록 날짜/보조 정보(`home-single-mid.png`, `home-single-bottom.png`), 일정 탭 원형 `+`·필터 선택 상태·D-day 의미색(D-5 경고, D-20 코랄, D-41 정보)(`schedule.png`, `schedule-scroll2.png`, `schedule-filter-vaccination.png`), Secondary 버튼(`pastonly-home.png` `일정 추가`), 카드 그림자·탭 Active Coral(전 캡처).

## 관찰 사항 (실패 아님, 후속 판단 필요)

| # | 내용 | 근거 캡처 | 제안 담당 |
|---|---|---|---|
| O1 | Warning 색 **텍스트**는 여전히 `#E9A23B`라 밝은 배경에서 대비가 약하다(결정 15는 칩만 대상). 일정 탭 `지난 일정` 제목과 `2026년 11월 4일 (수) · 5일 지남`, 체중 `최근 6개월 +0.1kg` | `schedule-scroll2.png`, `pastonly-schedule.png`, `weight-index.png` | design → screens (`warningText` 적용 범위 결정) |
| O2 | 체중 차트가 y축 0부터 시작해 4.2→4.3kg 변화가 거의 평평하고, 차트가 화면 폭의 절반 정도만 차지한다 | `weight-index.png` | design → screens |
| O3 | 홈 `오늘의 복약` 카드 안 각 행의 텍스트 영역 뒤에 카드와 미세하게 다른 배경 사각형이 보인다 | `home-single-mid.png`, `pastonly-home.png` | screens |

참고: 우측 상단 톱니 `Tools` 버튼은 dev client 오버레이라 앱 결함이 아니다.

## 자동 검증 (같은 워킹트리, 14:10 실행)

- `pnpm test`: 59 suites / 269 tests 통과
- `pnpm typecheck`: 오류 0
- `pnpm lint`: 오류 0, 경고 0

## 시뮬레이터 DB

- 시작 백업: `/tmp/pawlog-qa-seed/orig-phase6/pawlog.db` (SHA1 `95c7eb3fb938b2efcb7701d79a8d47c9b68fb06f`, 14:07 체중 기록 1건 포함)
- 복원 후: SHA1 `95c7eb3fb938b2efcb7701d79a8d47c9b68fb06f` 일치, 행 수 pets 1 · checkups 1 · medications 2 · weight_records 1 · 나머지 0

## Phase 7 재검증 (2026-11-09 14:57, iPhone 16e)

시드: `pastonly`(지난 일정 2건, 오늘 복약 3건, 체중 2건), `oneweight`(같은 시드에서 체중 1건만 남김). 캡처: `plan/reference/captures/phase7/`(gitignore 대상).

| 항목 | 결과 | 근거 캡처 |
|---|---|---|
| O1 경고 글자색 | 통과 — `지난 일정` 제목과 `… · N일 지남`이 진한 주황 `#8A4B08`, 체중 `최근 6개월 +0.1kg`도 같은 색. 복약 아이콘 타일은 기존 주황 유지 | `p7-schedule.png`, `p7-weight-index.png` |
| O2 체중 그래프 | 통과 — y축 4.0–4.5kg, 0.1kg 간격, 화면 폭 전체 사용 | `p7-weight-index.png` |
| O2 기록 1개 | 통과 — 그래프 대신 `기록이 1개 더 쌓이면 변화 그래프를 볼 수 있어요.` 표시 | `p7-weight-one.png` |
| O3 복약 카드 행 배경 | 통과 — 카드 안 행의 글자 영역에 별도 배경 사각형이 보이지 않음. 카드 밖 최근 기록 목록도 화면 바탕 유지 | `p7-home.png`, `p7-home-mid.png` |
| 6.11 추가 시트 아이콘 색 | 통과 — 일정 탭: 예방접종 파랑·건강검진 초록·복약 주황, 예방접종 index 두 항목 파랑, 건강검진 index 두 항목 초록 | `p7-schedule-add-sheet.png`, `p7-vaccination-add-sheet.png`, `p7-checkup-add-sheet.png` |

결과 5/5 통과. 확인 후 앱 DB를 원본으로 복원(SHA1 `95c7eb3f…` 일치).
