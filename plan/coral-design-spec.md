# Pawlog Coral Design Specification

> 상태: A. 따뜻한 코랄 시안 구현 명세. B Sage와 C Lavender 시안은 범위에서 제외한다.
> 정본: `plan/design-guide.md` v3.1 및 확정 결정. 구현 대상 코드의 기준 값은 `src/constants/theme.ts`로 옮긴다.
> 단위는 React Native logical point(pt)다. 기재된 색은 sRGB Hex다.

## 2.1 카드 그림자와 Elevation

### Tokens

| Token | Value | 적용 |
|---|---|---|
| `Elevation.card.shadowColor` | `#292524` | 모든 Surface 카드 그림자 |
| `Elevation.card.shadowOffset` | `{ width: 0, height: 2 }` pt | iOS |
| `Elevation.card.shadowOpacity` | `0.08` | iOS |
| `Elevation.card.shadowRadius` | `8` pt | iOS |
| `Elevation.card.elevation` | `2` | Android |
| `Colors.surface` | `#FFFFFF` | 기본 카드 표면 |
| `Radius.card` | `16` pt | 기본 카드 모서리 |

카드 기본은 Surface + `Colors.border` 1pt 테두리 + 위 그림자다. 카드 사이 간격은 `Spacing.md`(16pt) 이상. 리스트 Divider는 카드 중첩 대신 `Colors.divider`를 사용한다. 그림자 없는 행은 카드 컨테이너가 아닌 리스트다. 같은 카드 안에 그림자를 중첩하지 않는다.

## 2.2 Chip 변형

### API

`Chip` props: `label: string`, `variant: 'filter' | 'status'`, `selected?: boolean`, `tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'info' | 'danger'`, `size?: 'sm' | 'md'`, `leadingIcon?: Ionicons name`, `accessibilityState?: { selected?: boolean }`.

| 상태 | 배경 | 글자/아이콘 | 테두리 |
|---|---|---|---|
| Filter selected | `Colors.primary` `#F47C6C` | `Colors.onPrimary` `#FFFFFF` | 없음 |
| Filter unselected | `Colors.surface` `#FFFFFF` | `Colors.textSecondary` `#78716C` | `Colors.border` `#EEEAE7` 1pt |
| primary status | `Colors.primaryLight` `#FFF0ED` | `Colors.primary` `#F47C6C` | 없음 |
| success | `Colors.successBg` `#EAF6F0` | `Colors.success` `#65A986` | 없음 |
| warning | `Colors.warningBg` `#FDF1E1` | `Colors.warningText` `#8A4B08` | 없음 |
| info | `Colors.infoBg` `#EDF4FA` | `Colors.info` `#6E9ECF` | 없음 |
| danger | `Colors.dangerBg` `#FBEDED` | `Colors.danger` `#D95C5C` | 없음 |

`sm`: 높이 24pt, horizontal padding 8pt, caption 12/Regular, full radius. `md`: 높이 32pt, horizontal padding 12pt, bodySmall 14/Regular, full radius. Schedule filter는 md selected/unselected다. 상태칩은 label을 항상 표시한다. Empty filter results: `해당하는 일정이 없어요.`; loading: 스켈레톤 칩 대신 기존 필터를 유지하고 목록 자리에 `일정을 불러오는 중이에요.`를 표시한다.

## 2.3 Avatar scale

`Avatar` props: `size: 'sm' | 'md' | 'lg' | 'hero'`, `uri?: string | null`, `name: string`, `kind?: 'cat' | 'dog'`, `accessibilityLabel?: string`.

| size | 지름 | 사용 |
|---|---:|---|
| `sm` | 32pt | 최근 기록·작은 식별 |
| `md` | 48pt | Pet switch / 보조 row |
| `lg` | 64pt | Pet 목록 카드 |
| `hero` | 96pt | 홈 단일 반려동물 Hero |

원형 crop, 사진 `cover`. 이미지 없음/로드 실패 시 `Colors.primaryLight` 바탕에 `paw` Ionicon 50% primary tint, 이름 accessible label 유지. 로딩 중은 같은 원형 크기의 `Colors.divider` placeholder. 사진 실패는 빈 원 대신 placeholder로 복구한다.

## 2.4 의미색 배경

`Colors` 확장값: `successBg: '#EAF6F0'`, `warningBg: '#FDF1E1'`, `infoBg: '#EDF4FA'`, `dangerBg: '#FBEDED'`. Text foreground는 success `#65A986`, warning `warningText #8A4B08`, info `#6E9ECF`, danger `#D95C5C`. Warning 아이콘/장식에는 기존 `warning #E9A23B`를 유지한다. 의미색은 상태칩·작은 아이콘 타일에만 적용하며 화면 바탕/주요 CTA에는 쓰지 않는다. Pairing은 항상 텍스트 label 또는 아이콘과 함께해 색만으로 뜻을 전달하지 않는다.

## 2.5 Overlay

`Colors.overlay: 'rgba(41,37,36,0.40)'`. Bottom sheet/dimmed dialog 배경만 덮으며, 터치 가능한 backdrop은 dismiss 동작과 접근성 label `닫기`를 제공한다. Overlay 위 modal surface는 `Colors.surface`, `Radius.sheet` 24pt다. 로딩 중 overlay로 화면 전체를 막지 말고 기존 화면 읽기를 유지한다.

## 2.6 Primary content color

`Colors.onPrimary: '#FFFFFF'`. Primary Button와 selected Filter Chip의 글자·아이콘에만 쓴다. Primary 버튼 배경 `Colors.primary #F47C6C`, pressed `Colors.primaryPressed #E96F60`; disabled 배경 `#F6C1B9`, disabled 글자 `#FFFFFF` opacity 0.8. 버튼 높이 48pt 이상, `Radius.button` 14pt. 아이콘 단독 버튼에는 accessible label 필수.

## 2.7 Secondary Button

`Button` props: `variant: 'primary' | 'secondary' | 'text' | 'destructive'`, `size?: 'md'`, `disabled?: boolean`, `loading?: boolean`, `leadingIcon?: Ionicons name`, `onPress`.

Secondary default: background `#FFF0ED`, text/border `#F47C6C`, 1pt border, radius 14pt, min-height 48pt, horizontal padding 16pt. Pressed: background `#FCE2DD`; disabled: background `#F5F0EE`, text/border `#A8A29E`; loading은 label 자리를 유지하고 16pt spinner를 primary 색으로 표시. Text variant는 흰/투명 배경, Coral text, 테두리 없음. Form 오류 시 버튼 상태를 임의로 색만 변경하지 말고 오류 메시지를 표시한다. 한국어 label 예: `프로필 수정`, `취소`, `다시 시도`.

## 2.8 날짜·시간·반복 표기

Domain 유틸은 저장된 ISO 날짜 `yyyy-MM-dd`를 로컬 calendar date로 해석하고, 표시 문자열을 UI에 제공한다. UTC midnight 변환으로 날짜가 하루 밀리지 않도록 한다. 기준 로케일은 한국어, 요일은 축약형 `일·월·화·수·목·금·토`로 고정한다. 목록 짧은 날짜는 연도가 현재 표시 연도와 같을 때 `MM.dd`, 다를 때 `yyyy.MM.dd`.

| 입력 의미 / 입력 값 | 출력 | 규칙 |
|---|---|---|
| 일정일 `2025-09-28` | `2025년 9월 28일 (일)` | 상세 일정·다가오는 일정 |
| 일정일 `2026-01-04` | `2026년 1월 4일 (일)` | 연도 경계, 월/일 앞 0 제거 |
| 목록 날짜 `2026-09-03`, 기준연도 2026 | `09.03` | 동일 연도 짧은 표기 |
| 목록 날짜 `2025-12-31`, 기준연도 2026 | `2025.12.31` | 이전 연도는 연도 포함 |
| 복약 시간 `21:00` | `오후 9:00` | 12시간제, 분은 2자리 |
| 복약 시간 `09:05` | `오전 9:05` | 자정/정오 규칙 포함 |
| 매일, 하루 1회 | `매일 1회` | 반복 요약 |
| 주 1회, 수요일 | `매주 수요일 1회` | 요일 한국어 |
| 지난 일정 예정일 `2026-09-03`, 오늘 `2026-09-06` | `3일 지남` | 미완료 상태 |

유효하지 않은/누락 날짜는 빈 문자열이나 `Invalid Date`로 노출하지 않는다. 로딩 중에는 날짜 자리에 `일정을 불러오는 중이에요.`를 표시하고, 없는 일정은 Empty State `예정된 일정이 없어요.`를 쓴다. Domain 함수 테스트는 표의 모든 입력/출력과 한국 로컬 자정 경계를 포함한다.

## 2.9 Bottom CTA safe area

`BottomActionBar` props: `children`, `bottomInset`, `backgroundColor`, `testID`. Safe Area bottom inset만큼 아래 padding을 추가하고, 버튼 자체 높이는 48pt. 흰 surface + 위쪽 `Colors.divider` 1pt. 화면 ScrollView content bottom padding은 CTA 높이+safe-area+16pt여서 마지막 필드가 가려지지 않는다. Loading/disabled 상태는 Button 규칙을 따른다. Empty state의 보조 CTA는 inline으로 두고 하단 고정 CTA와 중복시키지 않는다.

## 2.10 Summary Card 선택

Weight와 Hospital Expense summary는 정보 요약이므로 White `Card` + 16pt padding + 16pt radius + `Elevation.card`를 사용한다. Weight는 label `현재 체중`, 28pt Bold 수치, 보조 날짜. 병원비는 label `이번 달 병원비`, 28pt Bold 금액. 홈 시안의 병원비 카드는 우측 Coral `stats-chart-outline` 22pt 장식/상세 이동 icon을 쓴다. 실제 데이터 chart는 이 아이콘으로 간주하지 않으며 MVP 범위에서 그리지 않는다. Empty: `아직 기록된 병원비가 없어요.`와 합계 `0원`; loading은 동일 크기 skeleton surface.

## 2.11 Ionicons 매핑

아이콘은 `@expo/vector-icons/Ionicons`, outline 스타일을 기본으로 한다. 아이콘 타일은 40×40pt, radius 12pt, 배경은 다음 mapping. 의미색 위의 아이콘은 해당 foreground token.

| 기능 | Ionicons | 기본 색 |
|---|---|---|
| 일반 건강 기록 | `document-text-outline` | primary |
| 예방접종 | `medkit-outline` | info |
| 건강검진 | `heart-outline` | success |
| 복약 | `medical-outline` | warning |
| 체중 | `scale-outline` | info |
| 병원비 | `wallet-outline` | warning |
| 일정 추가 | `add` | onPrimary, primary 원형 배경 |
| 알림 | `notifications-outline` | textSecondary |
| 이동/상세 | `chevron-forward` | textMuted |
| Pet 사진 없음 | `paw` | primary |
| 병원비 요약 진입 | `stats-chart-outline` | primary |

기록 추가 OptionSheet도 도메인별 foreground 색을 따른다: 건강 기록 `primary #F47C6C`, 예방접종 `info #6E9ECF`, 건강검진 `success #65A986`, 복약 `warning #E9A23B`, 체중 `info #6E9ECF`, 병원비 `warning #E9A23B`. 이 mapping은 선택 UI 전용이며 N4(2)/확정 결정 16이다. OptionSheet, Pet Detail, Home/Schedule row에서 동일 도메인은 같은 아이콘 이름과 색 의미를 사용한다. 아이콘 로드 오류 상태가 발생하는 경우 기능 텍스트는 계속 표시하고 아이콘은 생략한다. 아이콘 자체로만 의미를 전달하는 버튼에는 `accessibilityLabel`을 지정한다.

## 2.12 OptionSheet grabber

Grabber: width 36pt, height 4pt, radius 2pt, color `#D6D3D1`, top margin 8pt, title 위 간격 12pt, centered. Sheet: white, `Radius.sheet` 24pt. Row min-height 52pt, horizontal padding 20pt, trailing `chevron-forward` 16pt `#A8A29E`. Icon prop is Ionicons name and uses 22pt. Loading retains grabber/title and shows `옵션을 불러오는 중이에요.`; empty options show `선택할 항목이 없어요.`. Sheet close/dismiss accessible label `닫기`.

## 2.14 D-day semantic color

`DDayChip` props: `daysUntil: number`, `status?: 'upcoming' | 'completed' | 'overdue'`, `labelOverride?: string`. For `upcoming`, 0–7 days Warning, 8–30 days Coral, 31+ days Info. The cutoff is confirmed. Labels: 0=`오늘`, positive=`D-{n}`. A negative day is overdue and label `n일 지남` with Warning background; it is not rendered as D+N. Schedule chips represent only upcoming/overdue states. A completed `완료` Success chip is reserved for Records/Detail or other completed-status contexts, never Schedule rows. `overdue` remains incomplete and cannot use the completed label.

| State | Foreground | Background |
|---|---|---|
| D-0…D-7 | `#8A4B08` (`warningText`) | `#FDF1E1` (`warningBg`) |
| D-8…D-30 | `#F47C6C` | `#FFF0ED` |
| D-31+ | `#6E9ECF` | `#EDF4FA` |
| completed | `#65A986` | `#EAF6F0` |
| overdue | `#8A4B08` (`warningText`) | `#FDF1E1` (`warningBg`) |

Chip uses caption 12pt, semibold, horizontal padding 8pt, min-height 24pt. Loading date uses a 40×24pt neutral skeleton; absent date shows no D-day chip and row subtitle `날짜를 설정해 주세요.`.

## 2.15 Past schedule presentation

Schedule tab lists upcoming and incomplete overdue items only; completed schedules are excluded in accordance with decision 9 and `screen-layout.md` §26. Schedule row props: `scheduleStatus: 'upcoming' | 'overdue'`, `dueDate`, `title`, `subtitle`, `petName`, `icon`, `daysUntil?`. Upcoming appears under `다가오는 일정`; overdue under `지난 일정`, Warning text `N일 지남` and action `완료하기`; overdue is never auto-completed. No completed row or Success `완료` Chip appears in Schedule. Completed Success Chip is reserved for completed state labels in Records/Detail and other completed-status contexts. Korean copy: headings `다가오는 일정`, `지난 일정`; empty upcoming `다가오는 일정이 없어요.`; empty past `지난 일정이 없어요.`. Loading list: `일정을 불러오는 중이에요.`. Row/card style follows §2.1 and §2.16.

## 2.16 D-day and icon tile component variants

`ScheduleRow` props: `title`, `dateLabel`, `petName?`, `iconName`, `iconTone: 'primary'|'success'|'warning'|'info'`, `daysUntil?`, `scheduleStatus`, `onPress`. Icon tile 40×40pt, radius 12pt, leading gap 12pt; title body 16/semibold; subtitle bodySmall 14; trailing DDayChip. Tile backgrounds: primary `#FFF0ED`, success `#EAF6F0`, warning `#FDF1E1`, info `#EDF4FA`; glyphs use matching decorative foreground colors. Domain icon foreground mapping: health record primary `#F47C6C`; vaccination info `#6E9ECF`; checkup success `#65A986`; medication warning `#E9A23B`; weight info `#6E9ECF`; hospital expense warning `#E9A23B`. Record, Schedule, Vaccination, and Checkup Add Sheets use the same mapping (decision 16). Card background white, 16pt radius/padding, card Elevation §2.1. Missing date uses `날짜를 설정해 주세요.`. Empty list copy as §2.15; loading preserves list height with three neutral card skeletons. Row minimum hit target 56pt (pressable region at least 44pt); text can wrap without clipping.

## 2.17 Coral screen variants

### Home

Greeting: `안녕하세요, {petName} 보호자님` / `오늘도 좋은 하루예요! 🧡`; right bell `notifications-outline` 22pt, accessible label `알림`. One pet: Primary Light band, 96pt Avatar, name Title 22/Bold, metadata `나이 · 품종 >` bodySmall secondary. Multiple pets: horizontal cards, Avatar 56–64pt, name 16/Semibold, metadata 14. No fake pet card. Missing age/breed omits only that value; use `품종 미입력` only where a form explicitly needs a placeholder. Empty pet copy `반려동물을 등록하고 건강 기록을 시작해 보세요.` with `반려동물 등록하기` CTA; loading keeps Hero-sized neutral skeleton.

Next schedule: card rows §2.16, title `다음 일정`, date `yyyy년 M월 d일 (E)`. Empty `예정된 일정이 없어요.` plus `일정 추가`. Today medication: icon `medical-outline`, name `영양제`, time `오후 9:00`; empty `오늘 복용할 약이 없어요.` Rows inside the Today medication Card have transparent text wrappers and visually match the white Card surface; no background rectangle is painted behind the row text. The same rule applies to ListItem rows nested in any Card; icon tiles and separators may retain their own specified colors. Monthly expense: label `이번 달 병원비`, large total and decorative/detail icon `stats-chart-outline`; empty total `0원`, note `아직 기록된 병원비가 없어요.` Recent records rows use leading date (`09.03`), title and secondary hospital/type. Loading state uses content-shaped skeletons instead of empty copy.

### Schedule

Header `일정`; top-right filled Coral circular `add`, at least 44×44pt, accessible label `일정 추가`. Filter chips `전체`, `예방접종`, `건강검진`, `복약`; selected filled primary/white, unselected neutral. Group headings `다가오는 일정`, `지난 일정`; list upcoming and incomplete overdue only (§2.15–2.16). Never render completed schedules here; Success `완료` chips are for Records/Detail completed states only. Date and time format §2.8. Empty full screen copy `예정된 일정이 없어요.` + `일정 추가`; loading copy `일정을 불러오는 중이에요.`. Bottom tabs and safe area remain visible.

### Card and icon-only controls

Use white rounded cards with subdued shadow, 16pt corner radius, 16pt padding, and Ionicons. Do not add data chart, gradient or decorative emoji beyond the greeting heart. Tap actions retain visible text or accessible labels.

## 2.19 Template color cleanup

`themed-text.tsx` and `animated-icon.tsx` must consume shared `Colors` roles and contain no one-off blue literal. Map text to `Colors.textPrimary`/`textSecondary`; icon active state to `Colors.primary`, inactive to `Colors.textSecondary`, semantic state only to `Colors.info` when meaning is explicitly informational. `animated-icon` loading/default neutral uses `Colors.textMuted`. Keep current animation timing and layout. If the icon fails/loading, preserve its surrounding text and dimensions. Korean accessible copy for error/fallback: `상태를 표시할 수 없어요.`; do not display a blue generic fallback. No extra brand palette is introduced.

## 2.20 N1 — 다음 일정은 오늘 포함 예정 일정만

**규칙:** `다음 일정`은 로컬 오늘 날짜 이상(`date >= today`, D-0 포함)인 미완료 일정만 가리킨다. 지난 일정은 다음 일정의 정렬/슬롯 계산에 포함하지 않는다. `aggregateSchedule`는 일정 탭이 지난 일정을 별도로 보여줘야 하므로 과거 항목을 그대로 반환해도 된다. 홈·Pet 카드·도메인 index summary는 같은 `getUpcomingSchedule(entries, today)` 필터를 사용한다.

| 화면 | 일정 있음 | 예정 일정 없음 | 지난 일정 찾기 |
|---|---|---|---|
| 홈 `다음 일정` | 오늘 또는 미래 중 가장 가까운 일정부터 표시, 기존 한도 3개 유지 | `예정된 일정이 없어요.` + `일정 추가` CTA. 과거 건만 있으면 보조문구 `지난 일정은 일정 탭에서 확인할 수 있어요.` | 탭 `일정` > `지난 일정` |
| `내 반려동물` 카드 | `다음 일정 · {제목} {D-day}`; 오늘은 `오늘` | `다가오는 일정 없음`으로 바꾸고 과거 일정의 제목/경과일은 넣지 않는다. 해당 Pet 카드 하단 설명 또는 탭의 안내로 `지난 일정은 일정 탭에서 확인할 수 있어요.` | 탭 `일정` > `지난 일정`에서 Pet 필터 적용 |
| 예방접종 index 상단 | 오늘/미래 중 가장 가까운 미완료 접종 일정만 `다음 예방접종` 카드에 표시 | `예정된 예방접종이 없어요.`. 과거 미완료 일정이 있으면 `지난 일정은 일정 탭에서 확인해 주세요.` 안내. 기존 완료 접종 기록 목록은 계속 표시 | 일정 탭 `지난 일정`; 완료 접종 사실은 해당 index의 `접종 기록` 목록 |
| 건강검진 index 상단 | 오늘/미래 중 가장 가까운 미완료 검진 일정만 `다음 건강검진` 카드에 표시 | `예정된 건강검진이 없어요.`. 과거 미완료 일정이 있으면 `지난 일정은 일정 탭에서 확인해 주세요.` 안내. 기존 완료 검진 기록 목록은 계속 표시 | 일정 탭 `지난 일정`; 완료 검진 사실은 해당 index의 `검진 기록` 목록 |

오늘 일정은 `date === today`로 포함하고 chip은 D-0가 아닌 `오늘`로 표기한다. 과거 미완료 일정은 `N일 지남`으로 표시하며 `다음` 카드에 넣지 않는다. Empty/Loading 상태를 혼동하지 않는다: 로딩은 `일정을 불러오는 중이에요.`, 일정 없음은 위 명시 문구. Index의 완료 기록 목록이 있을 때 화면 전체 EmptyState로 기록을 가리지 않는다.

## 2.21 N2 — Pet Hero actionLabel 제거

단일 Pet Hero에는 이름과 `나이 · 품종 >`만 둔다. `오늘 복약 …`, `D-14 …` actionLabel 줄은 렌더링하지 않는다. 다중 Home의 수평 Pet 카드에도 actionLabel 줄이 있으면 같은 규칙으로 제거해 카드에는 사진, 이름, 나이·종만 남긴다. 이 결정은 `내 반려동물` 탭의 `다음 일정` 줄에 적용되지 않으며 해당 줄은 N1 필터만 따른다.

D1에서 Hero 라벨의 복약 시각을 복약 화면의 다음 복약 시각과 일치시킨 변경은 라벨 제거 후 UI에서 더 이상 쓰지 않으므로 actionLabel 전용 로직과 테스트를 정리한다. `PetSummary.actionLabel`, `actionLabelFor`, Home의 actionLabel 렌더링/테스트를 제거한다. `getNextMedicationTime`은 Pet Medication index의 “다음 복약” 표시에 사용하므로 유지한다. 제거 대상은 Home actionLabel 전용 계산/렌더링과 관련 테스트다. 반면 Home `todayMedications` 집계, `isMedicationDueToday`, 시간순 정렬과 복약 index의 다음 복약 시각은 실제 복약 표시를 위해 유지한다.

## 2.22 N3 — Schedule 오늘 구획 제목 단일화

Schedule의 날짜 구획 제목은 `오늘` 하나만 둔다. 오늘 일정 행 뒤에 오늘 복약 행을 같은 구획에 바로 이어 붙이고, 중간의 `오늘의 복약` 소제목은 렌더링하지 않는다. 오늘 일정만 있고 복약이 없거나, 복약만 있거나, 둘 다 있는 경우 모두 이중 제목 없이 표현한다. 오늘 항목이 없으면 `오늘` 구획 자체를 표시하지 않는다. Loading은 기존 `일정을 불러오는 중이에요.` 상태를 사용한다.

## 2.23 N4(1) — Warning 칩 대비 보정

이후 사용되는 Warning DDayChip 텍스트 전경은 아래 표의 `warningText`를 쓴다. 의미색/아이콘 표시는 기존 `warning #E9A23B`을 유지한다.

N1 이후에도 예방접종/건강검진 index 상단에는 Primary Light `#FFF0ED` 요약 카드와 0–7일 Warning D-day Chip의 조합이 남는다. QA 캡처 `vaccination-index.png`의 overdue chip은 N1로 사라지지만, 오늘/미래 D-5와 D-6은 여전히 Warning이므로 같은 조합은 남는다.

기존 Warning 글자 `#E9A23B`와 Primary Light `#FFF0ED`의 WCAG 상대휘도 대비율은 **1.95:1**이며, 일반 크기 12pt 텍스트의 WCAG 2.2 AA 기준 4.5:1보다 낮다. 기존 `#E9A23B`를 의미색/아이콘 색으로 보존하되 텍스트 전경 token `Colors.warningText: '#8A4B08'`을 추가한다. 해당 색의 대비는 `#FFF0ED` 위 **6.13:1**, 기존 `warningBg #FDF1E1` 위 **6.10:1**이다. 근거: [WCAG 2.2 SC 1.4.3 Contrast (Minimum)](https://www.w3.org/TR/WCAG22/#contrast-minimum).

`DDayChip`에 `surfaceTone?: 'default' | 'primaryLight'` 변형을 정의한다. Warning 상태 기본형은 `warningBg #FDF1E1` + `warningText #8A4B08`; `primaryLight` 표면 변형은 카드와 동일한 `#FFF0ED` 배경 + 1pt `warningText` 테두리 + `warningText` 글자다. Coral/Info/Success 상태의 현재 대비쌍과 배경은 유지한다. 기록 추가 시트 아이콘의 도메인별 색은 §2.11/§2.16과 확정 결정 16을 따른다.

## 2.24 O1 — Warning 의미 텍스트 대비

`Colors.warning #E9A23B`는 장식 아이콘·아이콘 타일 glyph에만 쓴다. Warning 상태를 전달하는 모든 문자는 `Colors.warningText #8A4B08`을 쓴다. 적용처: 일정의 `지난 일정` 구획 제목과 `N일 지남` 보조 문구, 체중 변화량(증가), Warning `Chip` 라벨 및 DDayChip 라벨. warning 색을 쓰는 나머지 위치가 아이콘/장식이라면 기존 색을 유지한다. 색상만으로 상태를 전달하지 않고 문구를 함께 표시한다.

| 배경 | `#E9A23B` 기존 Warning 대비 | `#8A4B08` WarningText 대비 |
|---|---:|---:|
| Background `#FFFDFC` | 2.14:1 | 6.70:1 |
| Surface `#FFFFFF` | 2.17:1 | 6.79:1 |
| Primary Light `#FFF0ED` | 1.95:1 | 6.13:1 |
| Warning BG `#FDF1E1` | 1.94:1 | 6.10:1 |

일반 텍스트는 모든 지정 배경에서 4.5:1 이상이어야 하므로 semantic Warning 글자색은 `warningText`로 통일한다. `Chip tone="warning"` 라벨도 예외가 아니며 Warning 아이콘 타일 glyph는 장식 색 `warning`을 유지한다. 대비 기준: [WCAG 2.2 SC 1.4.3](https://www.w3.org/TR/WCAG22/#contrast-minimum).

## 2.25 O2 — 체중 그래프 축과 가용 폭

`react-native-gifted-charts` LineChart는 측정값의 실제 변화가 읽히도록 데이터의 국소 범위를 사용한다. 축 최소/최대는 관측 최솟값·최댓값에 양쪽 여유를 더해 0.1kg 단위로 바깥쪽 반올림한다. 각 방향 여유는 `max(0.2kg, 데이터 범위의 15%)`; 총 축 범위는 최소 0.4kg로 한다. 예: 4.2–4.3kg → y축 4.0–4.5kg. 축은 0부터 시작하지 않는다.

눈금 간격은 1/2/5×10ⁿ 중 축 범위에 4–6개 구간이 생기는 가장 작은 간격을 고른다. 0.1kg 정밀도로 표시하고, 모든 눈금 라벨은 소수점 1자리(`4.0`, `4.1` …)로 쓴다. 정렬된 체중 데이터는 시간순 선으로 연결하고 각 측정값에 점을 표시한다.

차트는 safe area 안의 콘텐츠 전체 폭, 즉 화면 너비에서 좌우 화면 여백을 뺀 폭을 사용한다. 데이터 점이 적어도 동일한 전체 폭을 확보하고 점 사이 공간을 균등 분배해 절반 폭에 몰리지 않게 한다. 가로 스크롤은 점이 콘텐츠 영역을 넘는 경우에만 쓴다.

| 기록 수 | 동작 |
|---:|---|
| 0 | 차트 대신 기존 빈 상태 `등록된 체중 기록이 없어요.` 유지 |
| 1 | 단일 점 차트는 그리지 않고 요약/기록 목록을 유지. 그래프 위치에 `기록이 1개 더 쌓이면 변화 그래프를 볼 수 있어요.` 표시 |
| 2+ | 계산된 y축 범위와 전체 콘텐츠 폭의 선 그래프 표시 |

데이터 조회 중에는 차트 영역 크기의 중립 skeleton을 표시한다. 오류 시 `체중 그래프를 불러오지 못했어요.`와 `다시 시도`를 제공하고 요약/기록은 계속 사용할 수 있게 둔다.

## 2.26 O3 — Card 안 ListItem 배경

원인: `src/components/list-item.tsx`의 `textGroup`이 `ThemedView`를 사용하면서 `type`을 지정하지 않는다. `ThemedView`는 기본적으로 `theme.background`(`#FFFDFC`)를 칠하고, 부모 `Card`는 `type="surface"`(`#FFFFFF`)를 칠하므로 두 면이 다른 색으로 보인다. 해결 스펙은 `textGroup`에서 배경을 칠하지 않는 것이다.

`ListItem`의 텍스트 그룹은 기본 Background `#FFFDFC`를 칠하지 않고 투명해야 한다. Card 안에서는 부모 Surface `#FFFFFF`가 비쳐 행 전체가 카드와 동일한 바탕으로 이어져야 하며, 텍스트 영역만 다른 색의 사각형으로 보이면 안 된다. O3에서 확인된 Home 오늘 복약 Card의 행과, 앞으로 추가되는 모든 Card 내부 ListItem에 적용한다. 독립된 리스트 행도 별도 배경을 그리지 않고 부모 화면 바탕을 유지한다. 구분선은 필요할 때만 `Colors.divider #F5F0EE`로 표시하고, 지정된 leading icon tile / status chip의 배경은 유지한다. 별도 Card 안에 또 Card 배경을 중첩하지 않는다.
