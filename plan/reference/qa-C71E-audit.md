# [qa#C71E] 코랄 시안 대비 구현 감사 결과

읽기 전용으로 진행했고 코드와 문서는 수정하지 않았습니다. 시안 이미지는 보지 않았고 전달받은 텍스트 요약을 기준으로 삼았습니다. 확인하지 못한 부분은 '추정'으로 표시했습니다.

## 먼저 알아둘 점
- **계획의 전제 "토큰은 시안과 일치"는 일부 거짓입니다.** `src/constants/theme.ts`의 색 3개가 시안과 다릅니다. 이 값들은 `plan/design-guide.md`(v3.1)에는 그대로 적혀 있고, `plan/pawlog-design-guide-v2.md`와 시안에는 다르게 적혀 있습니다. 정본 문서와 시안이 서로 어긋난 상태입니다.

  | 토큰 | 시안/v2 | 현재 코드 (`theme.ts`) |
  |---|---|---|
  | background | `#FFFDFC` | `#FFF9F7` (:17) |
  | border | `#EEEAE7` | `#EEE8E5` (:24) |
  | warning | `#E9A238` (시안 요약), `#E9A23B` (v2 문서) | `#E9A23B` (:28) |

  - warning은 시안 요약과 1비트 차이이고 v2 문서와는 일치하므로 사실상 문제없습니다. 정본을 v3.1로 볼지 v2/시안으로 볼지는 사용자 결정이 필요합니다.
  - 나머지 값은 모두 일치합니다: primary, primaryLight, surface, textPrimary, textSecondary, success, info, danger.
  - 타이포 6단계 크기·굵기는 일치합니다. Radius도 button 14, input 12, card 16, sheet 24로 일치합니다.
- **미커밋 변경은 주로 시각 토큰을 건드리는 작업이었고, 계획 Phase 1~4는 거의 시작되지 않았습니다.**
- **미커밋 변경 중 일정/기록/내 반려동물 탭 헤더의 `+` 아이콘을 텍스트 링크로 바꾼 부분은 시안에서 멀어지는 회귀입니다.**

## (A) 기존 계획 항목별 상태

| # | 상태 | 근거 (file:line) |
|---|---|---|
| 1.1 | 미착수 | `src/utils/date.ts:28`에 `new Date().toISOString().slice(0,10)`가 그대로 남아 있음 |
| 1.2 | 미착수 | reminder 저장소에 `removeByPet`이 없음 (`src/db`에서 `removeByPet`은 다른 저장소 6개에만 있음) |
| 1.3 | 미착수 | `src/app/pets/[petId]/index.tsx:54-61`의 `Promise.all`이 6개 저장소만 정리함 |
| 1.4 | 미착수 | `split-medications.ts:14`가 `endDate < today`만 확인함 |
| 1.5 | 미착수 | `src/features/schedule`에 `completeSchedule`이 없음 |
| 1.6 | 미착수 | `vaccination/[id].tsx:76`, `checkup/[id].tsx:73`에 `handleComplete`가 중복으로 남아 있음 |
| 1.7 | 미착수 | `build-home-dashboard.ts:13`의 `RecentRecordType`에 병원비가 없고, :103 이후 집계에도 병원비가 없음 |
| 1.8 | 미착수 | `src/app`에서 `KeyboardAvoidingView` 사용이 0건 |
| 1.9 | 미착수 (추정) | `weight/[id].tsx:91`은 `record && editing`만 분기함. 삭제 버튼 노출 여부는 이번에 확인하지 않음 |
| 1.10 | 미착수 | `src/db/migrations`가 001~008뿐이고 `CREATE INDEX`가 0건 |
| 1.11 | 검증할 대상 없음 | 아래 (C)처럼 현재 상태는 모두 통과하지만 Phase 1 작업 자체가 없음 |
| 2.1 | 미착수 | `Elevation`/`shadow` 토큰이 없고, `card.tsx`는 border만 사용함 |
| 2.2 | 미착수 | Chip 변형 토큰이 없음 |
| 2.3 | 미착수 | `Avatar` 크기 스케일이 없고 56/112/80/32/40 같은 숫자를 직접 씀 |
| 2.4 | 미착수 | `d-day-chip.tsx:25,27`에 `#EAF6F0`, `#FDF1E1`이 남아 있음 |
| 2.5 | 미착수 | `option-sheet.tsx:53`, `confirm-dialog.tsx:62`에 `rgba(41,37,36,0.4)`가 남아 있음 |
| 2.6 | 미착수 | `button.tsx:23,26`에 `#FFFFFF`가 남아 있음 |
| 2.7 | 미착수 | `button.tsx:55-59`의 secondary는 흰 배경 + 중성 테두리, 글씨는 `textPrimary` |
| 2.8 | 미착수 | `src/utils/date.ts`에 날짜 포맷 함수가 없음 |
| 2.9, 2.10, 2.12 | 미착수 | 관련 토큰/스펙이 코드에도 문서에도 없음 |
| 2.11 | 미착수 | 펫 상세에서 `medkit-outline`이 4번 반복됨 (`[petId]/index.tsx:126,137,159,170`) |
| 3.1 | 부분 완료 | `ListItem.leading`과 `showDivider`, `minHeight` 56은 추가됨. `leadingText`/`trailingText`는 없음 |
| 3.2 | 미착수 | 하단 Full-width CTA 컴포넌트가 없음 |
| 3.3 | 미착수 | `option-sheet.tsx`에 grabber, chevron, `icon` prop이 없고 행 높이가 44 (:64) |
| 3.4 | 미착수 | 반려동물 선택은 `records.tsx:306`, `schedule.tsx:337`에서 여전히 이름 텍스트 OptionSheet |
| 3.5 | 미착수 | `button.tsx`의 secondary가 그대로이고 :8의 "기본 Sage" 주석도 그대로임 |
| 3.6 | 미착수 | 2.4와 같음 |
| 4.1 | 미착수 | 6개 index 화면 모두 `headerRight`의 `+`가 그대로 있음 (`medication/index.tsx:44` 등) |
| 4.2 | 미착수 | 날짜를 ISO 문자열 그대로 출력함 (`vaccination/index.tsx:66,73`), 시간도 `21:00` 그대로 |
| 4.3 | 미착수 | 모든 `ListItem`이 `title`=값, `subtitle`=날짜 구조 |
| 4.4 | 미착수 | `medication/index.tsx:54-95`에 Today Summary 카드, 종료 복약 기간 표기가 없음 |
| 4.5 | 미착수 | 체중은 "현재" + `heading`(`weight/index.tsx:73-82`), 병원비는 "이번 달" + `heading`(`hospital-expense/index.tsx:66-70`) |
| 4.6 | 미착수 (추정) | `[id].tsx` 6종 구조는 읽지 않았고 변경 흔적도 없음 |
| 4.7 | 미착수 | `records.tsx` 기록 타입 시트가 5항목이고 복약이 없음 |
| 4.8 | 미착수 | `pet-form.tsx`에서 `birthDate`와 `gender`가 필수(:21-27), 아바타 80(:92), 종류/성별 라벨 없음, 나이 분기도 없음 |
| 4.9 | 부분 완료 | 아바타만 40→56으로 변경됨(`index.tsx:126`). 72 미만이고 Hero 구조, Highlight Card, 빈 상태 CTA는 없음 |
| 4.10 | 미착수 | `schedule.tsx`에는 월/일 그룹과 "오늘의 복약", "지난 일정"만 있고 "오늘" 구획이 없음 |
| 4.11 | 부분 완료 | 아이콘과 chevron은 추가됨. medkit 4중복은 그대로임 |
| 4.12 | 미착수 | `hitSlop`이 0건이고 칩 `minHeight`가 36(`schedule.tsx`, `records.tsx`)이라 44 미만 |

- 계획의 line 번호는 대부분 정확해서 '근거 오류'인 항목은 찾지 못했습니다. 근거가 부정확한 부분은 2.7뿐입니다. 이전에 이 항목을 시안과 달라 보류했지만, 현재는 계획이 맞는 상태입니다.
- 전제 "health-records 5개 삭제는 import 0건 dead code"는 추정이지만 타당합니다. `pnpm typecheck`가 통과하므로 깨진 import는 없습니다.

## (B) 계획에 없는 신규 결함

| 화면/컴포넌트 | 시안·문서 기대값 | 현재 구현 (file:line) | 제안 담당 | 권장 Phase |
|---|---|---|---|---|
| 정본 토큰 불일치 (background/border) | 시안과 v2: `#FFFDFC`, `#EEEAE7` | `src/constants/theme.ts:17,24`가 v3.1 값(`#FFF9F7`, `#EEE8E5`) | design (정본 확정은 사용자 결정) | 2 |
| 홈 인사말 | "안녕하세요, 보리 보호자님 / 오늘도 좋은 하루예요! 🧡" + 종 아이콘 | `(tabs)/index.tsx:87`이 "오늘도 아이들의 건강을 챙겨볼까요?"뿐이고 종 아이콘이 없음 | screens | 4 (알림 연동은 보류 범위이므로 아이콘은 표시만) |
| 홈 Pet Hero | 코랄 연한 배경 + 원형 96 + 이름 굵게 + "8살 3개월 · 품종 >" | 가로 스크롤 `Card` 목록 + 56 아바타 + `type="default"` 이름 (`index.tsx:111-137`) | screens | 4 |
| 홈 "다음 일정" 카드 | 색 아이콘 타일 + 제목/날짜 + 우측 D-day 칩 | 구분선이 있는 평문 `ListItem`, 날짜는 ISO (`index.tsx:155-168`) | screens | 4 |
| 홈 "오늘의 복약" | 아이콘 + 제목 + 시간 | 아이콘 없음, `[이름] 약` 접두 (`index.tsx:175-190`) | screens | 4 |
| 홈 "이번 달 병원비" | 카드 안에 큰 Bold 숫자 + 우측 코랄 막대 차트 아이콘 | 카드 없이 "전체" 라벨 + `display` 숫자, 차트 아이콘 없음 (`index.tsx:194-215`) | screens/design | 4 |
| 홈 "최근 기록" 행 | 좌측 날짜(`09.03`) + 제목/보조(병원명) | 제목 `[펫] 건강 기록`, 부제 ISO 날짜. 병원명 없음 (`index.tsx:225-231`) | screens + domain | 3~4 |
| 홈 "다가오는 일정" 개수 | 시안은 항목 수 제한 없음 | 미커밋 변경으로 `UPCOMING_SCHEDULE_LIMIT`을 5→3으로 줄임 (`build-home-dashboard.ts:53`) | domain | 확인 필요 (추정: 의도를 알 수 없음) |
| 홈 상단 빈 상태 | Empty State + 등록 CTA | 안내 텍스트뿐이고 `EmptyState` 미사용 (`index.tsx:78-88`) | screens | 4 (4.9에 포함됨) |
| 일정 탭 헤더 | 우측 코랄 채움 원형 `+` 버튼 | 텍스트 링크 "일정 추가" (`schedule.tsx:~195`). 미커밋 변경으로 `+` 아이콘이 텍스트로 바뀜 (회귀) | screens | 4 |
| 일정 탭 칩 선택 상태 | 선택=코랄 채움 + 흰 글씨, 비선택=중성 회색 | 선택=`primaryLight` 배경 + 코랄 테두리, 글씨 색은 그대로 (`schedule.tsx`의 `filterChipSelected`) | design(토큰) + screens | 2·4 |
| 일정 탭 행 | 카드형 행 + 색 아이콘 타일 + 날짜 `2025년 9월 28일 (일)` + 우측 D-day | 월/일 그룹 + 평문 `ListItem`, 제목만 있고 날짜 문자열 없음, 아이콘 타일 없음 (`schedule.tsx:~290`) | screens | 3~4 |
| 일정 탭 D-day 칩 색 | D-14 코랄, D-59 info 블루, D-2 warning | `d-day-chip.tsx:26-28`은 코랄/warning(3일 이하)/success뿐, info 분기가 없음 | design/screens | 2·3 |
| 일정 탭 지난 일정 | 녹색 "완료" 칩 + `2024년 9월 10일` | 지난 일정은 warning 색 라벨 + "N일 지남" + chevron. 완료 일정 자체를 목록에 안 보여줌(추정: `aggregateSchedule`이 미완료만 반환) | screens + domain | 4 |
| 일정 탭 복약 행 | 복약은 "매일 1회" 같은 빈도 문구 | 이쪽은 `frequency time`으로 일치하는 편 | — | — |
| 날짜 포맷 전반 | `2025년 9월 28일 (일)` (시안) | `formatDate` 계열 유틸이 없고 모든 곳에서 ISO 노출 (`date.ts` 전체) | domain | 2~4 |
| 탭 헤더 `+` (기록, 내 반려동물) | 시안의 일관된 `+` 컨트롤 | 미커밋 변경으로 `+` 아이콘을 텍스트("기록 추가", "추가")로 교체 (`records.tsx`, `pets.tsx`) (회귀) | screens | 4 |
| 탭바 | 활성 코랄 | `app-tabs.tsx:33`에서 `colors.primary`로 일치. 비활성 `textSecondary` | — (정상) | — |
| `Card` | 둥근 모서리 + 은은한 그림자 | `card.tsx`는 border만 있고 shadow 없음 (:7 주석에도 "Shadow 최소화") | design | 2 |
| `Button` | Secondary: 연한 코랄 배경 + 코랄 글씨 + 코랄 테두리 | `button.tsx:55-59` 흰 배경/중성 테두리/`textPrimary`. Text 변형은 `textSecondary` (시안: 코랄) (`button.tsx:25`) | design/screens | 2·3 |
| 펫 상세 아바타 | Pet Hero 96 | 미커밋 변경으로 96→112 (`[petId]/index.tsx:99`). 시안 기준(96)을 초과 | screens | 4 (추정: 의도 불명) |
| `Input` | 라벨 + 플레이스홀더 + 테두리 | `input.tsx`는 읽지 않았고 테스트만 통과 (추정: 미검증) | design | 5 |
| `src/components` 하드코딩 | 토큰 사용 | `themed-text.tsx:81` `#3c87f7`, `animated-icon.tsx:138,145` 파란색은 템플릿 잔재로 보임 (추정) | design | 2 |
| `FormPetContext` | (신규, 문서상 ui-redesign-plan §5.6) | `form-pet-context.tsx`가 `getPet`을 직접 호출하고 테스트가 있음. 현재는 문제 없음 | — | — |

## (C) 명령 실행 결과
- `pnpm test`: 43 suites 통과, 137 tests 통과, 실패 없음 (약 5초).
- `pnpm typecheck` (`tsc --noEmit`): 오류 없이 종료.
- `pnpm lint` (`expo lint`): 경고·오류 출력 없이 종료.

## 권장 순서 (제안)
1. 정본 팔레트를 v3.1과 v2/시안 중 어느 쪽으로 맞출지 사용자에게 먼저 확인합니다. background/border 값이 여기에 달려 있습니다.
2. 미커밋의 탭 헤더 텍스트 링크 변경은 4.1의 CTA 교체 때 함께 정리하는 편이 낫습니다. 지금은 시안과 가장 멀어진 상태입니다.
3. 시안과 직접 닿는 순서는 Phase 2(그림자, 칩, 버튼, D-day info 색)를 먼저 하고, 이어서 홈 Hero와 일정 행 재구성(Phase 3~4)입니다.

