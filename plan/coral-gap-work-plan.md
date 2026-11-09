# Coral Gap Work Plan

- 조사 일자: 2026-11-09
- 정본: `plan/design-guide.md` v3.1 (2026-11-09 팔레트 갱신)
- 확정 결정 19건:
  1. 기능 버그 → 디자인 토큰 → 공용 컴포넌트 → 화면별 블루프린트 순서
  2. 6개 index 화면의 헤더 `+`를 하단 Full-width CTA로 교체
  3. Welcome 화면과 알림 권한·`expo-notifications` 연동 보류
  4. 펫 등록 폼의 생년월일·성별은 `(선택)` 입력으로 변경하고 나이 미표기 분기 추가
  5. 팔레트는 시안 값으로 맞춘다: Background `#FFFDFC`, Border `#EEEAE7`; Warning은 `#E9A23B` 유지. `src/constants/theme.ts`와 `plan/design-guide.md` 정본을 함께 갱신한다.
  6. 일정·기록·내 반려동물 탭 헤더 추가 버튼은 코랄 채움 원형 `+`(44pt 이상)으로 통일하고 접근성 라벨을 유지한다. 미커밋 텍스트 링크 변경은 되돌린다. 결정 2의 6개 Pet index 화면 하단 CTA와 별개다.
  7. 홈은 반려동물 1마리일 때 시안 Pet Hero(Primary Light 배경, 96pt 원형 사진, Title Bold 이름, `나이 · 품종 >`)를 쓰고, 여러 마리일 때 가로 카드 목록을 유지한다.
  8. 미커밋 변경인 홈 다가오는 일정 5→3개 및 Pet Detail Avatar 112pt는 의도된 것으로 유지한다.
  9. 일정 탭에는 완료 일정을 표시하지 않는다(`screen-layout.md` §26). 시안의 지난 일정 중 초록 `완료` 칩 행은 의도한 차이로 두며, 미완료 지난 일정은 Warning `N일 지남`으로 표시한다. 완료 칩은 기록/상세 등 완료 상태 표시에만 사용한다.
  10. 펫 등록 폼(`src/features/pets/pet-form.tsx`)은 `screens` 담당이 수정한다.
  11. 펫 성별 미입력은 DB `''` / 앱 `null` 규약을 사용하며, 이를 위한 마이그레이션은 추가하지 않는다.
  12. N1: 다음 일정 요약에는 오늘 포함 `date >= today`인 일정만 표시한다. 지난 미완료 일정은 일정 탭 `지난 일정`에서 확인한다.
  13. N2: Home 단일 Pet Hero와 다중 Pet 카드의 actionLabel 줄을 제거한다. `내 반려동물` 탭 일정 줄은 N1 기준으로 유지한다.
  14. N3: 일정 탭 오늘 구획은 `오늘` 제목 하나만 쓰고 `오늘의 복약` 소제목은 제거한다.
  15. N4(1): Warning 텍스트는 `Colors.warningText #8A4B08`으로 보정하고, Primary Light 표면용 DDayChip 변형을 둔다.
  16. N4(2): 기록 추가 시트와 나머지 추가 시트(일정 탭, 예방접종·건강검진 index)의 아이콘은 `coral-design-spec.md` §2.11의 도메인별 색을 따른다.
  17. O1: Warning 의미 텍스트는 `warningText #8A4B08`을 사용하고, `warning #E9A23B`은 아이콘·장식에만 쓴다. 일정의 지난 일정 제목/경과일, 체중 증가량, Warning Chip 라벨을 포함한다.
  18. O2: 체중 그래프는 데이터 국소 범위 축(양쪽 여유 `max(0.2kg, 범위의 15%)`, 최소 축 범위 0.4kg, 0.1kg 단위 바깥 반올림), 4–6개 구간, 콘텐츠 전체 폭을 쓴다. 단일 기록은 그래프 대신 안내 문구를 표시한다.
  19. O3: Card 안 `ListItem` 행의 텍스트 그룹은 투명 배경으로 두어 Surface 카드와 같은 색으로 보이게 한다. 다른 Card 내부 `ListItem`에도 적용한다.

## 전제

- 워킹트리에서 삭제된 `src/features/health-records/*` 5개는 HEAD에서 import 0건인 dead code였으므로 기능 손실 없음. 접종·검진의 “기록+다음 예정일 동시 입력” UI는 사라졌으며, 기록/일정 분리는 §26 의도이므로 유지.
- 타이포·radius 토큰은 시안과 일치한다. 색은 Background·Border 2개가 달라 결정 5로 정정한다(2.13, 3.7). 나머지 차이는 정보 위계와 화면 구성이다.
- 현재 `pnpm typecheck` 통과, 테스트 190개 통과(Phase 1 후); Phase 3 후 198개 통과.

## Phase 1 — 기능 결함 수정 (최우선)

| # | 상태 | 작업 | 근거 | 담당 | 선행 |
|---|---|---|---|---|---|
| 1.1 | 완료 | `todayDateString()`의 UTC 날짜를 로컬 캘린더 날짜로 교체. 한국 00:00~09:00 경계 테스트 추가 | `src/utils/date.ts:28` — 로컬 캘린더 날짜 적용 완료 | domain | — |
| 1.2 | 완료 | `reminder.repository.ts`에 기존 6개 repo 패턴의 `removeByPet(petId)`와 테스트 추가 | `src/db/repositories/reminder.repository.ts` — `removeByPet(petId)` 및 테스트 추가 완료 | data | — |
| 1.3 | 완료 | `handleDelete`의 `Promise.all`에 reminder `removeByPet` 추가. 현재 6개만 정리해 알림 행이 고아로 남음 | `src/app/pets/[petId]/index.tsx:53` — 반려동물 삭제 시 Reminder 정리 추가 완료 | screens | 1.2 |
| 1.4 | 완료 | 복약 “오늘 복용 여부” 순수 함수와 테스트 신설. 현재 `endDate`만 확인해 미래 시작·매주 복약도 오늘에 표시됨. Home/Schedule/Summary에 공통 적용 | `src/features/medication/split-medications.ts` — `isMedicationDueToday` 구현, 홈·일정 오늘의 복약 적용 완료 | domain | — |
| 1.5 | 완료 | 순수 `completeSchedule`와 테스트 신설. 완료 가능 여부, 완료일 유효성 및 미래 날짜 금지를 통합 | `src/features/schedule/complete-schedule.ts` — `completeSchedule`, 오류 문구 3종 완료 | domain | — |
| 1.6 | 완료 | 접종·검진 `[id].tsx`의 중복 `handleComplete`를 `completeSchedule` 호출로 정리 | 접종·검진 공통 완료 흐름 적용; 완료일 기본값은 예정일이 미래면 오늘 | screens | 1.5 |
| 1.7 | 완료 | 병원비를 홈 “최근 기록”에 포함 (§6.7 Visibility Matrix 위반) | `src/features/home/build-home-dashboard.ts:13,103` — 병원비를 최근 기록에 포함 완료 | domain | — |
| 1.8 | 완료 | 폼 전부에 `ScrollView`+`KeyboardAvoidingView` 적용. `new*.tsx` 8개 및 `[id].tsx` 편집 모드 6개 대상. 현재 적용 0개라 키보드가 저장 버튼을 가림 | `src/components/form-scroll-container.tsx` — `FormScrollContainer` 적용 완료 | screens | — |
| 1.9 | 완료 | `[id].tsx` 6종에서 `record === null` 로딩/미존재 처리. 현재 빈 화면에 삭제 버튼만 노출 | `weight/[id].tsx:91` — `기록을 찾을 수 없어요` 표시 처리 완료 | screens | — |
| 1.10 | 완료 | `009_create_indexes.ts` 신규 마이그레이션으로 `(pet_id, 날짜컬럼)` 복합 인덱스 7개 추가. 현재 `CREATE INDEX` 0건 | `src/db/migrations/009_create_indexes.ts` — 복합 인덱스 7개 추가 완료 | data | — |
| 1.11 | 완료 | Phase 1 회귀 및 신규 테스트 검증: `pnpm test` / `typecheck` / `lint` | QA 통과: 테스트 190개, typecheck, lint | qa | 1.1~1.10 |

참고: DB에 `FOREIGN KEY` 선언과 `PRAGMA foreign_keys`가 모두 없으며 cascade를 화면 레이어에서 수동 수행 중이다. 이번에는 1.3의 누락만 보완하고 DB 레벨 FK는 별도 과제로 둔다.

## Phase 2 — 디자인 토큰 보강 (design, 전부 design 담당)

| # | 상태 | 작업 | 근거 | 담당 | 선행 |
|---|---|---|---|---|---|
| 2.1 | 완료(스펙) | 테두리 카드에 `Elevation.card` 은은한 그림자 토큰을 신설하고 카드에 적용 | coral-design-spec.md §2.1 | design | — |
| 2.2 | 완료(스펙) | Chip 변형 토큰: 중성 / 선택됨(Coral 채움·흰 글씨) / 상태색 | coral-design-spec.md §2.2 | design | — |
| 2.3 | 완료(스펙) | 임의 숫자로 지정 중인 아바타를 위한 `Avatar` 크기 스케일 `sm/md/lg/hero` | coral-design-spec.md §2.3 | design | — |
| 2.4 | 완료(스펙) | `Status.successBg` / `Status.warningBg` 토큰으로 `d-day-chip.tsx:24,26`의 `#EAF6F0`·`#FDF1E1` 대체 | coral-design-spec.md §2.4 | design | — |
| 2.5 | 완료(스펙) | `option-sheet.tsx:53`·`confirm-dialog.tsx:62`의 `rgba(41,37,36,0.4)`를 대체할 `overlay` 토큰 | coral-design-spec.md §2.5 | design | — |
| 2.6 | 완료(스펙) | `button.tsx:23,26`의 `#FFFFFF`를 대체할 `onPrimary` 토큰 | coral-design-spec.md §2.6 | design | — |
| 2.7 | 완료(스펙) | Secondary 버튼 스펙 확정: 연한 코랄 배경+코랄 글씨·테두리 | coral-design-spec.md §2.7 | design | — |
| 2.8 | 완료(스펙) | 날짜·시간 규칙 정의: 날짜 포맷 `yyyy년 M월 d일 (E)`, `10월 20일`, 리스트 `10.01`(연도 경계 포함), 시간 `오후 9:00`, 반복 `매일 1회`. 요일 표기는 `(일)` 형식으로 확정. 포맷 함수 구현은 domain 담당이 `src/utils`에서 진행 | coral-design-spec.md §2.8 | design | — |
| 2.9 | 완료(스펙) | 하단 Full-width CTA 바의 Safe Area 대응·패딩·리스트 하단 여백 토큰 스펙 (Phase 4.1 선행) | coral-design-spec.md §2.9 | design | — |
| 2.10 | 완료(스펙) | Weight / Hospital Expense 요약의 “평문 vs Highlight Card” 결정. 블루프린트 ASCII에는 카드 테두리가 없고 Vaccination/Checkup에는 명시 카드가 있어 모호함 | coral-design-spec.md §2.10 | design | — |
| 2.11 | 완료(스펙) | 아이콘 매핑 확정: OptionSheet 6종(건강기록·접종·검진·복약·체중·병원비), Pet Detail 메뉴 6종. 현재 `medkit-outline` 4중복 | coral-design-spec.md §2.11 | design | — |
| 2.12 | 완료(스펙) | OptionSheet grabber 크기·색 스펙 확정 | coral-design-spec.md §2.12 | design | — |
| 2.13 | 완료(문서) | `plan/design-guide.md` 정본 팔레트 변경: Background `#FFFDFC`, Border `#EEEAE7`, Warning `#E9A23B` 유지 | 사용자 결정 5; `design-guide.md` §3 | design | — |
| 2.14 | 완료(스펙) | D-day 색 기준 확정: 0~7일 Warning, 8~30일 Coral, 31일 이상 Info. | coral-design-spec.md §2.14 | design | — |
| 2.15 | 완료(스펙) | 일정 탭에는 완료 일정을 노출하지 않고 미완료 지난 일정만 `N일 지남`으로 표시한다. 완료 Success Chip은 기록/상세의 완료 상태에 사용 | coral-design-spec.md §2.15; 결정 9 | design | — |
| 2.16 | 완료(스펙) | D-day Info 배경 포함 상태색 및 Home/Schedule 컬러 아이콘 타일 변형 명세 | coral-design-spec.md §2.16 | design | 2.14 |
| 2.17 | 완료(스펙) | Greeting, 단일/다중 Pet Hero, Schedule 카드 행, 병원비 막대 아이콘은 데이터 Chart가 아닌 장식/진입 아이콘으로 허용, 완료 상태의 화면별 컴포넌트 변형 명세 | coral-design-spec.md §2.17 | design | — |
| 2.18 | 완료(문서) | `ui-redesign-plan.md`의 시안 충돌 지시 정정: 고정 인사 문구, Pet 카드 크기, Chart 금지(아이콘 허용 명시), 그림자 금지, Schedule List Row 우선 | `ui-redesign-plan.md` §4, §5.1, §5.3 | design | — |
| 2.19 | 완료 | `themed-text.tsx`와 `animated-icon.tsx`의 템플릿 파랑 하드코딩 조사 후 토큰화 | `themed-text.tsx`, `animated-icon.tsx` — 결과: 의미별 공통 Colors 토큰 적용 | design | — |

## Phase 3 — 공용 컴포넌트 및 앱 토큰 반영 (screens, Phase 2 스펙 수령 후)

| # | 상태 | 작업 | 근거 | 담당 | 선행 |
|---|---|---|---|---|---|
| 3.1 | 완료 | `ListItem`의 `leadingText`/`trailingText` 지원 구현 | `components/list-item.tsx` — 테스트 198개 통과 | screens | — |
| 3.2 | 완료 | 하단 `BottomActionBar` 컴포넌트 구현 | `BottomActionBar` — 테스트 198개 통과 | screens | — |
| 3.3 | 완료 | `OptionSheet` grabber, 행 우측 chevron, Ionicons `icon` prop, 행 높이 52~56 구현 | `OptionSheet` — 테스트 198개 통과 | screens | — |
| 3.4 | 완료 | Pet Switch Sheet 구현: 제목 “반려동물 선택”, Photo 40~48, 선택 ✓(코랄), “+ 반려동물 추가” 행 | `PetSwitchSheet` — 테스트 198개 통과 | screens | — |
| 3.5 | 완료 | Button secondary 변형, 색 토큰화, 폐기된 “기본 Sage” 주석 수정 | `Button` — 테스트 198개 통과 | screens | — |
| 3.6 | 완료 | DDayChip 하드코딩 배경색을 semantic token으로 교체 | `DDayChip` — 테스트 198개 통과 | screens | — |
| 3.7 | 완료 | `src/constants/theme.ts` Background/Border를 시안 팔레트로 변경 (`#FFFDFC`, `#EEEAE7`), Warning은 `#E9A23B` 유지 | `src/constants/theme.ts:17,24`; 테스트 198개 통과 | screens | 2.13 |

## Phase 4 — 화면별 블루프린트 적용 (screens)

| # | 상태 | 작업 | 근거 | 담당 | 선행 |
|---|---|---|---|---|---|
| 4.1 | 완료 | 6개 index 헤더 `+` 제거 후 하단 Full-width CTA 적용. 접종·검진은 CTA가 기존 OptionSheet를 열도록 유지 | `medication/index.tsx:44`, `vaccination/index.tsx:49`, `checkup/index.tsx:46`, `weight/index.tsx:51`, `hospital-expense/index.tsx:44`, `health-record/index.tsx:40` — 결과: 6개 index 화면에 하단 Full-width CTA 적용 | screens | — |
| 4.2 | 완료 | 전 화면 날짜·시간 포맷 적용. 현재 ISO(`2026-10-20`)와 raw 시간(`21:00`) 노출 | `vaccination/index.tsx:66`, `medication/index.tsx:72` 외 — 결과: 날짜·시간 포맷을 표시 화면에 반영 | screens | — |
| 4.3 | 완료 | 3.1을 활용해 전 index 화면 리스트 좌우 정렬 교정 | 전 index 화면 — 결과: index 목록 좌우 정보 정렬 적용 | screens | — |
| 4.4 | 완료 | 복약 화면: Today Summary 카드(“오늘의 복약 / N개 / 다음 복약 …”), “복용 중” 우측 개수, 종료 복약 기간(`9.01 - 9.07`), Active는 White Card | `medication/index.tsx:54-95` — 결과: 복약 Summary·복용 중 개수·종료 기간·Active Card 반영 | screens | — |
| 4.5 | 완료 | 체중·병원비 요약 라벨을 “현재 체중”·“이번 달 병원비”로, 수치는 28 Bold(`display`), 월 표기 추가 | `weight/index.tsx:73-82`, `hospital-expense/index.tsx:66-70` — 결과: 체중·병원비 요약 라벨과 금액 위계 반영 | screens | — |
| 4.6 | 완료 | 기록 상세 6종을 `날짜 → 제목 → Label/Value(병원·메모)`로 구조화. 삭제는 구분선+하단 텍스트 Danger | `checkup/[id].tsx:188-225` 외 — 결과: 기록 상세 정보 위계와 삭제 Action 정리 | screens | — |
| 4.7 | 완료 | 기록 타입 시트에 “복약” 추가. 블루프린트 6항목 중 현재 5개 | `(tabs)/records.tsx:316-322` — 결과: 기록 타입 선택에 복약 항목 추가 | screens | — |
| 4.8 | 완료 | 펫 등록: “종류”·“성별” 라벨, 생년월일·성별 zod optional, CTA “등록하기”, 사진 80→96. `formatAge(new Date(pet.birthDate))`가 깨지므로 나이 미표기 분기 필수 | `features/pets/pet-form.tsx:21-27,92,94,125-167`, `pets/[petId]/index.tsx:102`; 결정 10 — 결과: 선택 입력·종류/성별 라벨·등록 CTA·사진 크기·나이 미표기 처리 반영 | screens(결정 10) | — |
| 4.9 | 완료 | 사진은 40→56으로 변경됨. 남은 범위: 단일 Pet Hero 96pt/배경/이름·나이·품종, 다음 일정 Highlight Card, Empty State+등록 CTA. | `(tabs)/index.tsx:82,125,155` — 결과: 홈 Pet Hero·다음 일정 Card·Empty State/등록 CTA 반영 | screens | — |
| 4.10 | 완료 | 일정 탭에 “오늘” 구획 추가(현재 월/일 그룹만) | `(tabs)/schedule.tsx:259` — 결과: 일정 탭 오늘 구획 적용 | screens | — |
| 4.11 | 완료 | 아이콘/chevron은 추가됨. 남은 범위: 중복 `medkit-outline`을 2.11 매핑으로 교체. | `pets/[petId]/index.tsx:126,137,159,170` — 결과: Pet Detail 도메인별 아이콘 구분 적용 | screens | — |
| 4.12 | 완료 | 헤더 액션·필터 칩 Pressable에 최소 높이/hitSlop 적용해 터치 영역 44pt 보장 | `records.tsx:225`, `pets.tsx:58` 외 — 결과: 헤더/필터 터치 영역 44pt 보장 | screens | — |

| # | 상태 | 작업 | 근거 | 담당 | 선행 |
|---|---|---|---|---|---|
| 4.13 | 완료 | 탭 헤더 기록·일정·내 반려동물 추가 액션을 코랄 채움 원형 `+`로 복원하고 접근성 라벨/44pt 터치 영역 유지. 6개 index 하단 CTA(4.1)와 별도 적용 | 사용자 결정 6; 감사 `records.tsx`, `schedule.tsx`, `pets.tsx` — 결과: 탭 헤더 원형 Coral +와 접근성 라벨 복원 | screens | 2.2 |
| 4.14 | 완료 | 홈 인사말과 종 아이콘, 단일 Pet Hero 및 다중 Pet 가로 카드 분기 구현 | 시안; `ui-redesign-plan.md` §5.1 — 결과: 인사말/알림 아이콘, 단일·다중 Pet 요약 분기 반영 | screens | 2.17 |
| 4.15 | 완료 | 홈 다음 일정 카드형 행(색 아이콘 타일/날짜/D-day), 오늘 복약 아이콘·시간, 병원비 카드/장식 막대 아이콘 구현 | 감사 `(tabs)/index.tsx:155-215`; 시안 — 결과: 홈 일정·복약·병원비 카드형 시안 구성 반영 | screens | 2.1, 2.16, 2.17 |
| 4.16 | 완료 | 홈 최근 기록 행을 날짜 좌측·제목/병원 등 보조 정보로 구성하고 Expense 포함 데이터 연결 | 감사 `(tabs)/index.tsx:225-231`; 제품 계획 §6.7 — 결과: 최근 기록 날짜/보조 정보 및 병원비 데이터 반영 | screens + domain | 1.7, 2.8 |
| 4.17 | 완료 | Schedule 탭 카드형 행, 색 아이콘 타일, 날짜/반복 설명, D-day 칩, 선택/비선택 필터 색 구현 | 감사 `(tabs)/schedule.tsx:~290`; 시안 — 결과: 일정 카드 행·아이콘 타일·필터·D-day 변형 반영 | screens | 2.8, 2.2, 2.14, 2.16 |
| 4.18 | 제외(결정 9) | 일정 탭의 완료 일정 행은 표시하지 않는다. 미완료 지난 일정은 Warning `N일 지남`으로 표시 | 사용자 결정 9; `screen-layout.md` §26 | — | — |
| 4.19 | 완료 | 시안 날짜 포맷을 Home/Schedule 표시 경로에 적용 | 시안 `2025년 9월 28일 (일)`; 감사 date utils — 결과: 시안 날짜 포맷을 Home/Schedule에 적용 | domain + screens | 2.8 |

## Phase 5 — QA (qa)

1차 QA(qa#C71E)·리뷰(reviewer#9D41, `plan/reference/reviewer-9D41-review.md`) 후 후속 수정 완료. 테스트 237개(Phase 5 시점, Phase 7 후 285개) / typecheck / lint 통과.

시안 대조 체크리스트:
- Home: 인사 두 줄과 종 아이콘, 단일 Pet Hero(Primary Light/96pt 사진/이름/나이·품종), 다중 Pet 가로 카드
- Home: 다음 일정 카드와 아이콘 타일/날짜/D-day, 오늘 복약 아이콘·시간, 병원비 큰 숫자와 장식 막대 아이콘, 최근 기록의 날짜/제목/보조 정보
- Schedule: 제목과 코랄 원형 `+`, 필터 선택 상태, 카드형 일정 행/색 아이콘 타일/날짜 또는 반복 문구/D-day 칩
- Schedule: 오늘 구획의 단일 제목 `오늘`; 오늘 복약 소제목 없음. 완료 일정 행은 제외하고 지난 미완료는 Warning `N일 지남`
- N1: 홈/내 반려동물/접종·검진 index의 다음 일정은 오늘 포함 예정만 표시하며, 빈 문구와 지난 일정 진입 위치 확인
- N2: Home 단일·다중 Pet 요약에서 actionLabel 없음; 내 반려동물 카드 일정 줄은 N1 기준 유지
- N4(1): 접종·검진 index Primary Light 카드 위 Warning 칩의 글자 대비 4.5:1 이상
- 공통: Secondary 버튼 배경·글자·테두리, 카드 은은한 그림자, 탭 Active Coral

## Phase 6 — 시뮬레이터 QA 후속 결정 반영

| # | 상태 | 작업 | 근거 | 담당 | 선행 |
|---|---|---|---|---|---|
| 6.1 | 완료 | 공유 `getUpcomingSchedule(entries, today)` 필터를 추가해 `date >= today`만 반환. `aggregateSchedule`는 Schedule의 지난 일정 표시에 필요하므로 과거 포함 원본 집계는 유지 | `src/features/schedule/aggregate-schedule.ts:44-59`; `src/features/schedule/aggregate-schedule.test.ts:74-107` — 결과: `getUpcomingSchedule`/`getNextUpcomingSchedule` 추가, 오늘 포함·과거 제외 경계 테스트 통과 | domain | — |
| 6.2 | 완료 | Home `upcomingSchedule`를 6.1 필터로 제한하고 3개 한도 유지. 예정 없음 문구/CTA와 overdue 전용 안내를 명세대로 표시 | `src/features/home/build-home-dashboard.ts:68-80,152-160`; `src/app/(tabs)/index.tsx:251-263`; `src/__tests__/app/phase6-upcoming-schedule.test.tsx:66-125` — 결과: 예정 일정 필터, 빈 상태/CTA/지난 일정 안내 반영 | domain + screens | 6.1 |
| 6.3 | 완료 | 내 반려동물 카드의 `nextScheduleLabel` 계산에서 6.1 적용. 미래/오늘 일정만 `다음 일정 · …`, 없으면 `다가오는 일정 없음`; past due는 표시하지 않고 일정 탭 `지난 일정` 안내 | `src/app/(tabs)/pets.tsx:42-53,106-118`; `src/__tests__/app/phase6-upcoming-schedule.test.tsx` — 결과: 다음 일정 요약 필터와 지난 일정 안내 반영 | domain + screens | 6.1 |
| 6.4 | 완료 | 예방접종/건강검진 index 상단 요약에 6.1 적용. upcoming 없으면 해당 도메인 빈 문구와 overdue 안내를 보이고, 완료 기록 목록은 유지 | `src/app/pets/[petId]/vaccination/index.tsx:43-92`; `src/app/pets/[petId]/checkup/index.tsx:40-89`; `src/__tests__/app/phase6-upcoming-schedule.test.tsx` — 결과: 예정 일정만 요약, 없음/지난 안내와 완료 기록 목록 유지 | domain + screens | 6.1 |
| 6.5 | 완료 | `PetSummary.actionLabel`, `actionLabelFor`, 단일·다중 Home actionLabel 렌더링을 제거. D1의 Hero actionLabel 전용 로직/테스트를 제거하고 `getNextMedicationTime`은 복약 index에서 사용하므로 유지; `todayMedications`, `isMedicationDueToday`, 시간순 정렬 유지 | `src/features/home/build-home-dashboard.ts:35-41,61-79`; `src/app/(tabs)/index.tsx:160-214`; `src/app/pets/[petId]/medication/index.tsx:64,94`; 결과: Hero `actionLabel` 제거, `getNextMedicationTime`은 복약 index에서 사용하므로 유지 | domain + screens | — |
| 6.6 | 완료 | Home actionLabel 회귀 테스트를 제거/갱신하고 단일·다중 Pet 카드에 actionLabel이 없음을 검증 | `src/features/home/build-home-dashboard.test.ts:286-293`; `src/__tests__/app/qa-visual-defects.test.tsx:133-170` — 결과: Home actionLabel 제거 및 단일 Pet Hero/복약 index 동작 테스트 통과 | tests | 6.5 |
| 6.7 | 완료 | Schedule 오늘 구획에서 `오늘의 복약` subheading 제거, 오늘 일정과 복약 행을 `오늘` 아래 연속 표시 | `src/app/(tabs)/schedule.tsx:300-309`; `src/__tests__/app/schedule.test.tsx:134-152`; `src/__tests__/app/qa-visual-defects.test.tsx:113-120` — 결과: 오늘 구획에 단일 제목 `오늘`, 복약 소제목 제거 테스트 통과 | screens | — |
| 6.8 | 완료 | `Colors.warningText #8A4B08` 추가, `DDayChip.surfaceTone='primaryLight'` 변형(Primary Light 바탕/WarningText 테두리·글자) 구현. 기본 Warning chip도 `warningBg`/`warningText` 대비쌍 사용 | `src/constants/theme.ts:30-35`; `src/components/d-day-chip.tsx:43-64`; `src/app/pets/[petId]/vaccination/index.tsx:68-77`; `src/app/pets/[petId]/checkup/index.tsx:65-74` — 결과: `warningText`와 `primaryLight` 표면 변형 반영 | screens | — |
| 6.9 | 완료 | 6.8의 Warning 글자/배경 조합 대비율, Primary Light 변형, 기존 D-day 경계(0/7/8/30/31), N1 날짜 경계(어제/오늘/내일), 빈 결과/로딩 문구를 테스트 | `src/components/d-day-chip.test.tsx:19-33`; `src/features/schedule/aggregate-schedule.test.ts:74-107`; `src/__tests__/app/phase6-upcoming-schedule.test.tsx` — 결과: 경계/대비/N1 빈 상태 검증 포함, 테스트 268개·typecheck·lint 통과 | tests | 6.1, 6.8 |

| 6.10 | 완료 | 기록 추가 OptionSheet 아이콘에 도메인별 foreground 색 적용: 건강 기록 Coral, 접종 Info Blue, 검진 Success Green, 복약 Warning Orange, 체중 Info Blue, 병원비 Warning Orange | `src/app/(tabs)/records.tsx:319-354`; `src/components/option-sheet.tsx:53-70`; 사용자 결정 16; `coral-design-spec.md` §2.11 — 결과: 도메인별 아이콘 색 반영 | screens | — |
| 6.11 | 완료 | 일정 탭 및 예방접종·건강검진 index의 추가 시트 아이콘에 도메인별 foreground 색 적용. 같은 도메인은 모든 추가 시트에서 §2.11/§2.16 매핑을 공유 | `src/constants/theme.ts:130` `DomainIconTone`; `src/app/(tabs)/schedule.tsx:423-435`; `src/app/pets/[petId]/vaccination/index.tsx:130-136`; `src/app/pets/[petId]/checkup/index.tsx:127-133`; 사용자 결정 16; `coral-design-spec.md` §2.11, §2.16 — 결과: 모든 추가 시트가 `DomainIconTone` 공유 | screens | — |

### D1–D4 시뮬레이터 결함 수정 완료

- D1 복약 시각 기준: Home Hero actionLabel 제거; 복약 index의 다음 복약 시각은 현재 시각 이후 첫 복약으로 표시. `src/app/(tabs)/index.tsx:160-179`; `src/app/pets/[petId]/medication/index.tsx:64,94`; 회귀 `src/__tests__/app/qa-visual-defects.test.tsx:133-170`.
- D2 복약 시간순: Home/Schedule/복약 index 모두 오름차순 정렬. `src/features/home/build-home-dashboard.ts:81-93`; `src/app/(tabs)/schedule.tsx:105-120`; `src/app/pets/[petId]/medication/index.tsx:21-56`; 검증 `src/__tests__/app/qa-visual-defects.test.tsx:98-131`.
- D3 체중 차트: 코랄 선/점, y축 1자리 반올림, 44pt 라벨 폭 및 토큰 색 적용. `src/app/pets/[petId]/weight/index.tsx:85-104`.
- D4 목적격 조사: `withObjectParticle`로 받침에 맞는 `을/를`을 표시. `src/utils/korean.ts:5-10`; 검증 `src/__tests__/app/pet-detail-delete-reminder.test.tsx:68-103`.

## Phase 7 — O1–O3 시뮬레이터 재검증 후속

근거 캡처: `plan/reference/qa-visual-compare-phase6.md`; 캡처는 `plan/reference/captures/phase6/`에 있다. 상세 스펙은 `coral-design-spec.md` §§2.24–2.26.

| # | 상태 | 작업 | 근거 | 담당 | 선행 |
|---|---|---|---|---|---|
| 7.1 | 완료 | Warning 의미 텍스트 사용처를 `warningText #8A4B08`으로 통일: 일정 `지난 일정` 제목/`N일 지남`, 체중 증가량, Warning Chip 라벨. 아이콘·장식은 `warning #E9A23B` 유지 | `src/app/(tabs)/schedule.tsx:358-380`; `src/app/pets/[petId]/weight/index.tsx:77-81`; `src/components/chip.tsx:30`; `coral-design-spec.md` §2.24 | screens | — |
| 7.2 | 완료 | Warning 텍스트가 Background/Surface/Primary Light/Warning BG에서 4.5:1 이상인지 검증하고 warning icon/tile 색은 그대로인지 회귀 테스트 | `src/constants/theme.ts:17,20,30-35`; `src/components/chip.tsx:30`; `coral-design-spec.md` §2.24 | tests | 7.1 |
| 7.3 | 완료 | 체중 LineChart에 데이터 기반 y축(여유 `max(0.2kg, 범위×15%)`, 최소 0.4kg, 0.1kg 바깥 반올림), 4–6 구간 눈금과 콘텐츠 전체 폭 적용. 단일 점은 차트 대신 안내문 출력 | `src/app/pets/[petId]/weight/index.tsx:24,44-48,85-104`; `react-native-gifted-charts`; `coral-design-spec.md` §2.25 | screens | — |
| 7.4 | 완료 | 체중 차트 축 경계(4.2–4.3kg→4.0–4.5kg), 간격/라벨, 좁은 데이터 수의 전체 폭, 0/1/2+ 기록 동작 테스트 | `src/app/pets/[petId]/weight/index.tsx:24,44-48,85-104`; `coral-design-spec.md` §2.25 | tests | 7.3 |
| 7.5 | 완료 | `ListItem` 텍스트 그룹의 기본 Background 칠하기를 제거해 투명하게 한다. Home 복약 Card 행과 이후 모든 Card 내부 행은 부모 Surface를 그대로 보이고, 독립 리스트는 부모 화면 배경을 유지한다. 명시된 타일/구분선만 색을 갖게 한다 | `src/components/list-item.tsx:50-57`; `src/components/themed-view.tsx:15-19`; `src/components/card.tsx:9-10`; `src/app/(tabs)/index.tsx:271-294,357-367`; `coral-design-spec.md` §2.26 | screens | — |
| 7.6 | 완료 | Card 안 ListItem의 투명 텍스트 배경 및 별도 icon tile/divider 유지 여부를 Home 복약·최근 기록과 체중 화면에서 검증 | `src/components/list-item.tsx`; `src/app/(tabs)/index.tsx:271-294,357-367`; `src/app/pets/[petId]/weight/index.tsx:109-125`; `coral-design-spec.md` §2.26 | tests | 7.5 |

## 보류 (이번 범위 제외, 사용자 결정)

- Welcome 화면 (§20 #2): §23에 블루프린트가 없어 레이아웃 설계부터 필요
- 알림 권한 화면 및 `expo-notifications` 연동: 패키지만 있고 앱 코드 import 0건, `reminder.repository.ts:12`에 “S3 범위 밖” 명시
- `reminder.repository` 재예약 API(`scheduled_at` 갱신 메서드): 위 항목과 함께 보류
- DB 레벨 `FOREIGN KEY` + `PRAGMA foreign_keys` 도입
- 접종·검진의 “기록 + 다음 예정일 동시 입력” UI 복원 여부
- 복약 `frequency` 자유 문자열 파싱 정책: 해석 불가 값은 매일로 처리하는 현행 규칙 유지
- `DDayChip` 글자 크기: 스펙 12pt와 현재 구현 14pt 차이 유지
- 지난 일정 안내 문구 통일 여부: 홈·내 반려동물은 `확인할 수 있어요.`, 접종·검진 index는 `확인해 주세요.`
- Button disabled 색과 `leadingIcon`/`size` 미구현 상태 유지
- `AvatarSizeKey` 미사용 상태 유지
- `EmptyState` 제목 마침표 표기 통일
- `SafeAreaView`의 `edges` 중복 inset 여부 점검
- `app.json` splash/adaptiveIcon 템플릿 파랑(`#208AEF`/`#E6F4FE`) 교체 여부
- 시트 내부 탭 시 닫히는 동작의 변경 여부

캡처 폴더 `plan/reference/captures/`는 `.gitignore`에서 제외하도록 관리한다.
