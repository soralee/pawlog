## 검토 결과 — 코랄 시안 Phase 1~4 미커밋 변경

검증 상태(직접 실행): `pnpm typecheck` 통과 · `pnpm lint` 통과 · `pnpm test` **53 suites / 220 tests 전부 통과**. `plan/` 문서는 제외했습니다. Expo API는 설치된 `node_modules`(RN 0.86.3 / expo-router 57.0.26 / safe-area-context 5.7.0) 소스로 대조했습니다.

### 높음

| # | file:line | 문제 | 수정 제안 | 담당 |
|---|---|---|---|---|
| H1 | `src/components/form-scroll-container.tsx:22-25` | `KeyboardAvoidingView`에 `keyboardVerticalOffset`이 없다. RN `KeyboardAvoidingView._relativeKeyboardHeight`는 `frame.y + frame.height - keyboardY`를 쓰는데 `frame`은 `onLayout` 기준(부모 상대)이라, Stack 헤더가 있는 화면에선 **헤더 높이만큼 패딩이 부족**하다. 작업 1.8의 목적(키보드가 저장 버튼을 가림)이 폼 16개 전체에서 부분적으로만 해소된다 | `useHeaderHeight()`(`@react-navigation/elements`) 값을 `keyboardVerticalOffset`으로 전달하거나, 화면에서 offset을 주입할 수 있는 prop 추가 | screens |
| H2 | `src/app/(tabs)/index.tsx:115` | `hasAnyPet === false \|\| !dashboard` — 초기 상태가 `null`/`null`이라 **펫이 있어도 로딩 중 "반려동물을 등록하고 건강 기록을 시작해 보세요." EmptyState가 먼저 노출**된다. 포커스마다 재조회하므로 탭 전환 때마다 깜빡인다 | `hasAnyPet === null`은 로딩으로 분기(스펙 §2.17 "loading keeps Hero-sized neutral skeleton"), `hasAnyPet === false`일 때만 EmptyState | screens |
| H3 | `src/features/pets/pet-form.tsx:67,77` (+ `src/db/repositories/pet.repository.ts:10,21`) | 성별 라벨만 `(선택)`이고 **기본값이 `'male'`, 제출도 `values.gender ?? 'male'`** 이라 미입력이 저장되지 않는다. `Pet.gender`가 non-nullable이라 `pets/[petId]/index.tsx:109`의 `: null` 분기는 도달 불가. 결과적으로 사용자가 고르지 않은 **"남아"가 프로필에 표시**된다(결정 4 미충족). `src/__tests__/app/pet-optional-profile.test.tsx:55`가 `'고양이 · 남아'`로 이 동작을 고정하고 있다 | `defaultValues.gender`를 `undefined`로, `Gender`에 null 허용(마이그레이션 010 또는 빈 문자열 규약) 후 표시 분기 복원, 해당 테스트 기대값 수정 | screens + data + tests |

### 중간

| # | file:line | 문제 | 수정 제안 | 담당 |
|---|---|---|---|---|
| M1 | `vaccination/[id].tsx:163,223`, `checkup/[id].tsx:160,220` | Label/Value 구조화(4.6)를 넣으면서 값 문자열의 접두어를 안 지웠다 → **"예정일" / "예정일 2026-10-20"** 이중 표기. 더해서 값이 raw ISO라 4.2 미적용 | 값은 `formatDateForDisplay(date,'schedule')`만 출력 | screens |
| M2 | `bottom-action-bar.tsx:13` 및 6개 index(`weight:127`, `medication:153`, `vaccination:129`, `checkup:123`, `hospital-expense:105`, `health-record:80`) | `getBottomActionScrollPadding()`를 **StyleSheet 모듈 스코프에서 인자 없이** 호출 → safe-area inset 미반영(`bottomInset` 인자 사용처 0). 게다가 `BottomActionBar`가 absolute가 아니라 flex 흐름의 형제라 이미 자리를 차지하고 있어 **88pt 더미 여백**이 리스트 끝에 생긴다 | 바를 `position:'absolute'`로 띄우고 inset을 `useSafeAreaInsets()`로 런타임 계산하거나, 흐름 배치를 유지한다면 scroll padding 제거 | screens |
| M3 | `schedule.tsx:243-310`, `records.tsx:231-307`, `pet-form.tsx:140-151,182-194` | 필터 칩·종류/성별 선택 버튼에 **`accessibilityRole="button"`과 `accessibilityState={{selected}}`가 없다**(스펙 §2.2가 명시). 선택 상태가 색으로만 전달됨 | 두 prop 추가 | screens |
| M4 | `constants/theme.ts:48,82-120,123,146` / `theme/tokens.ts:1` | **중복·데드 토큰**: 같은 의미색 bg/fg 쌍이 `Status`·`ChipTokens.status`·`DDayTone`·`IconTileTone` 4중 정의인데 `Status`와 `ChipTokens.status`는 사용처 0. `src/theme/tokens.ts`는 "화면은 이 경로로 가져온다"는 주석과 달리 **import 0건**(전부 `@/constants/theme` 직접 참조). `primaryPressed`도 사용처 0 → §2.6/2.7의 pressed 상태 미구현 | 미사용 그룹 제거 또는 단일 `Semantic` 맵으로 통합, tokens.ts 실사용/삭제 결정, Button에 pressed 스타일 적용 | design + screens |
| M5 | `src/app/(tabs)/index.tsx:318` | 병원비 아이콘이 `bar-chart-outline` — 스펙 §2.10/§2.11은 `stats-chart-outline` | 아이콘 교체(테스트 ID도 함께 확인) | screens |
| M6 | `src/app/(tabs)/schedule.tsx:48-50` | 필터 라벨 `접종`/`검진` — 스펙 §2.17은 `예방접종`/`건강검진` | 라벨 통일 | screens |
| M7 | `src/features/medication/split-medications.ts:13-28` | `frequency`가 **자유 입력 문자열**(`medication/new.tsx:108-117` placeholder "예: 매일")인데 `/매주/`와 `([월화수목금토일])요일` 정규식으로 파싱한다. `주 1회`, `격주`, `매월 1일` 등은 전부 마지막 `return true`로 떨어져 **매일 복용으로 표시**된다 | frequency를 선택형(enum)으로 바꾸거나, 매칭 실패 시 "매일"로 단정하지 않는 정책을 명시 | domain + screens |
| M8 | `src/app/(tabs)/records.tsx:396-400` | `subtitleFor`가 raw ISO(`2026-10-20 · 병원`)를 그대로 출력 — 4.2 적용 누락 | `formatDateForDisplay(entry.date,'list')` 사용 | screens |
| M9 | `src/app/pets/[petId]/medication/index.tsx:53-56` | "다음 복약"이 **오늘 중 가장 이른 시각**이라 이미 지난 시간도 "다음"으로 안내한다(22시에 "다음 복약은 오전 9:00이에요") | 현재 시각 이후 중 최소값, 없으면 문구 생략 | domain + screens |
| M10 | `option-sheet.tsx:106`, `pet-switch-sheet.tsx:105` | grabber 색 `'#D6D3D1'` 하드코딩이 2개 파일에 중복(스펙 §2.12 값이지만 토큰 부재) | `Colors.light.grabber` 등 토큰 신설 후 참조 | design + screens |

### 낮음

| # | file:line | 문제 | 수정 제안 | 담당 |
|---|---|---|---|---|
| L1 | `d-day-chip.tsx:50` | 칩 글자가 `smallBold`(14pt/700) — 스펙 §2.14는 caption 12pt semibold | 12pt 타입 추가 또는 스펙 정정 | design |
| L2 | `button.tsx:83-85` | disabled가 `opacity: 0.5` — 스펙 §2.6/2.7의 disabled 색(`#F6C1B9`, `#F5F0EE`/`#A8A29E`) 미반영. `leadingIcon`/`size` prop도 미구현 | 스펙 반영 또는 스펙에서 제외 | screens |
| L3 | `pet-avatar.tsx:12` 외 | `AvatarSizeKey`('sm'~'hero') API를 **아무도 쓰지 않는다**(전부 `AvatarSize.hero` 같은 숫자 전달, `form-pet-context.tsx:32`는 `32`, `pets.tsx:87`은 `56`) | 호출부를 키 기반으로 통일 | screens |
| L4 | `utils/date.ts:40-44` 호출부 전반 | `formatDateForDisplay(...) \|\| rawISO` 폴백이 스펙 §2.8("Invalid/빈 문자열 노출 금지")과 어긋나게 ISO를 노출한다. `daysUntil(invalid)`는 `D-NaN` 생성 가능(`d-day-chip` 경유) | 폴백 문구를 `날짜를 설정해 주세요.`로 통일, `daysUntil`에 유효성 가드 | domain + screens |
| L5 | `(tabs)/index.tsx:46`, `pets.tsx:93`, `pets/[petId]/index.tsx:106` | `new Date(pet.birthDate)` = UTC 파싱. 스펙 §2.8은 로컬 캘린더 해석 요구(음수 오프셋 지역에서 하루 밀림) | `parseISO` 사용 | domain |
| L6 | `(tabs)/index.tsx:149-157` | 알림 벨이 `onPress={() => {}}` no-op인데 버튼 role/label은 노출 | 알림 보류 범위이면 비활성 표기 또는 렌더 제외 | screens |
| L7 | `utils/date.ts:1-9` | `differenceInCalendarDays`를 `calendarDays`로 **한 번 더 별칭 import** | 별칭 제거 | domain |
| L8 | `schedule.tsx:316` | 필터 적용 중 결과 0건일 때도 `다가오는 일정이 없어요.` — 스펙 §2.2는 `해당하는 일정이 없어요.`(records 탭은 이미 분기함) | records 탭과 동일하게 분기 | screens |
| L9 | 6개 `[id].tsx` not-found | `기록을 찾을 수 없어요`(마침표 없음) vs 다른 EmptyState 제목은 전부 마침표 사용 | 표기 통일 여부 결정 | design |
| L10 | `records.tsx:403`, `pets.tsx:119` | 화면 좌우 패딩이 `Spacing.lg`(24), 홈·일정·index는 `Spacing.screen`(20) | `Spacing.screen`으로 통일 | screens |
| L11 | `schedule.tsx:472`, `records.tsx:389`, `pets.tsx:125` | `addCircleButton` 스타일 3중 복붙(4.13 결과물) | 공용 `AddCircleButton` 컴포넌트화 | screens |
| L12 | `form-scroll-container.tsx:21`, 각 탭/index 화면 | `SafeAreaView` 기본 `edges`가 all이라 **Stack 헤더 아래/탭바 위에서 inset이 중복** 적용될 수 있다(native-stack은 screen 단위로 `SafeAreaInsetsContext`를 재정의하지 않음을 번들 소스로 확인). 기존 레포 패턴이라 신규 결함은 아님 — 추정 | `edges={['bottom','left','right']}` 지정 | screens |
| L13 | `split-medications.ts:1-3` | import 순서가 레포 컨벤션(외부 → `@/`)과 반대. lint는 통과 | 정렬 | domain |
| L14 | `animated-icon.module.css:2` / `app.json:19,29` | 2.19로 코드의 블루는 제거됐지만 CSS에 `#f47c6c` 리터럴이 남고, **네이티브 스플래시 `#208AEF`·adaptiveIcon `#E6F4FE`는 템플릿 블루 그대로** → 부팅 시 파랑→코랄 점프(추정, app.json은 이번 diff 밖) | app.json 팔레트 정리를 후속 과제로 등록 | design |
| L15 | `utils/date.test.ts:50-55` | `process.env.TZ`를 설정만 하고 복구하지 않아 같은 파일 후속 테스트에 누수 | `afterEach`에서 원복 | tests |
| L16 | `option-sheet.tsx:36-37`, `pet-switch-sheet.tsx:34-35` | 시트 내부 빈 영역(grabber·타이틀 패딩) 탭이 backdrop `onPress`로 전파돼 시트가 닫힌다. 기존 구조지만 이번에 grabber/타이틀 영역이 커져 노출면이 넓어짐 | 시트 래퍼에 `onStartShouldSetResponder` 또는 Pressable 중첩 | screens |
| L17 | `schedule.tsx:385-422` | 지난 일정 행이 `DDayTone.overdue` 칩 대신 본문 텍스트로만 `N일 지남` 표기, §2.15의 `완료하기` 액션도 없음 | 칩/액션 적용 여부 결정 | design + screens |
| L18 | `.claude/settings.local.json`, `.agents/teams/orchestrator-2.json` | 반영: `.gitignore`에 `.claude/settings.local.json`, `.agents/` 추가 | 로컬 설정·에이전트 폴더 ignore 반영 완료 | — |

### 규약 적합 확인(문제 없음)
- Expo v57 API: `Stack.Screen options`, `useFocusEffect`/`useRouter`/`useLocalSearchParams`(expo-router), `useSQLiteContext`, `expo-image` `contentFit`, `ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] })`, `SafeAreaInsetsContext` — 모두 현행 API.
- 그림자: `Elevation.card`의 iOS `shadow*` + Android `elevation` 조합은 RN 0.86 코어에서 유효(웹 번들에서만 deprecation 경고 가능 — 추정).
- 레포지토리 DI: 화면이 `db`를 받아 `createXRepository(db)` 패턴 유지, `reminder.removeByPet`이 기존 6개 repo와 동일 시그니처, `009_create_indexes`는 `migrations` 배열 말미에 등록·`IF NOT EXISTS`로 멱등.
- 라우트 중첩: `src/app` 구조와 `router.push` 경로 전부 실제 파일과 일치. 탭 헤더 코랄 원형 `+`(44pt·접근성 라벨) 3곳, 6개 index 하단 CTA + 접종/검진 OptionSheet 유지 — 결정 2·6대로 구현됨.
- 한국어 카피: `~해요` 체, 오류 문구 3종(`complete-schedule.ts:9-13`), `기록을 찾을 수 없어요` 6곳, `(선택)` 라벨 — 일관.

가장 먼저 손볼 것은 **H1(폼 16개 전체에 영향) → H2 → H3 → M1** 순을 권합니다.
