# Pawlog 변경분 커밋 전 리뷰

## 검증

- `pnpm test`: 59 suites / 269 tests 통과. `pet-optional-profile.test.tsx` 등에서 React `act()` 중첩/테스트 환경 경고가 출력됐다.
- `pnpm typecheck`: 통과. `pnpm lint`: 통과.
- Expo v57 문서: SDK 57의 React Native 0.86 / React 19.2.3 기준 확인. 설치 의존성은 Expo 57.0.28, Router 57.0.26, RN 0.86.3.
- 설치 소스 확인: `expo-router/react-navigation`은 `useHeaderHeight`를 export하며 `@react-navigation/elements`의 헤더 높이 hook을 재수출한다. `node_modules/expo-router/build/react-navigation` 확인. RN `KeyboardAvoidingView` 구현에서 `keyboardVerticalOffset`은 키보드 Y 계산에 차감된다. ImagePicker의 `mediaTypes: ['images']`는 `expo-image-picker` 타입에서 허용된다. Gifted Charts `LineChart`의 `color`, `data`, `height`, `width`, `maxValue`, `noOfSections`, `formatYLabel`, `yAxisLabelWidth`, `rulesColor`, `xAxisColor`, `yAxisColor`, `yAxisTextStyle`, `xAxisLabelTextStyle`, `hideDataPoints`, `dataPointsColor`, `thickness`, `isAnimated` 사용은 설치된 타입 정의에서 확인.

## 높음

| # | file:line | 문제 | 수정 제안 | 담당 |
|---|---|---|---|---|
| — | — | 실제 diff에서 새 높음 결함 확인되지 않음 | — | — |

## 중간

| # | file:line | 문제 | 수정 제안 | 담당 |
|---|---|---|---|---|
| M1 | `src/app/pets/[petId]/vaccination/[id].tsx:188-191`, `checkup/[id].tsx:185-188` | 접종/검진 상세의 예정 날짜는 label과 별도 값으로 출력되고 값에 `formatDateForDisplay`를 적용해 중복 접두어/raw ISO 문제 해소. 다만 새 포맷이 인라인으로 조건부 렌더링되어 두 상세 화면 간 표현 차이가 남는지 회귀 화면 캡처로 확인 권고. | — | screens |
| M7 | `src/features/medication/split-medications.ts:42-53` | 주기 인식 정규식에 맞지 않는 자유 입력값은 `return true`로 오늘 복용에 포함된다. 계획 문서의 보류 목록에 “해석 불가 값은 매일로 처리” 결정이 있어 보류. | 정책 변경 시 미인식 문자열 별도 표기 | domain + screens |
| M11 | `src/components/option-sheet.tsx:65-76`, `src/constants/theme.ts:…` | SheetOption은 iconTone/iconColor를 받아 표현 가능. 기록 추가는 도메인 tone을 지정하며, vaccination/checkup index 추가 sheet도 `DomainIconTone` 적용 확인. schedule 추가 sheet도 같은 패턴 확인되어 일관성 지적은 해소. 화면 직접 수정 진행분은 별도 요청에 따라 판정 제외, 진행 중으로 표기. | — | design + screens |
| M12 | `src/__tests__/app/schedule-detail-complete-validation.test.tsx:121-160` | 공통 완료 날짜 검증은 미래/잘못된 날짜 거부 및 날짜 값 보존을 검사한다. 두 도메인 테스트는 repository 재조회로 갱신 확인. 자세한 체크리스트는 아래 표 참조. | — | tests + screens |

## 낮음

| # | file:line | 문제 | 수정 제안 | 담당 |
|---|---|---|---|---|
| L1 | `src/components/d-day-chip.tsx:81`, `src/constants/theme.ts` | DDayChip 텍스트가 `smallBold`를 사용(명세 caption 12pt와 불일치). 보류 목록에 명시되어 보류. | 명세/타입 크기 후속 정합 | design |
| L2 | `src/components/button.tsx` | disabled 색 및 leadingIcon/size 상세 준수 여부와 별개로, 기존 리뷰 지적은 후속 보류 목록에 있어 보류 처리. | 명세와 구현 정합 | screens |
| L3 | `src/components/pet-avatar.tsx` | 호출부에 숫자형 size 사용이 남아 있어 Avatar 명세 키 통일 미해소. `src/app/(tabs)/pets.tsx` 카드 등에 숫자 전달 사용이 남았다. | 모든 호출부를 `sm/md/lg/hero`로 통일 | screens |
| L5 | `src/app/(tabs)/index.tsx`, `src/app/pets/[petId]/vaccination/index.tsx` | 지난 일정 안내 문구 차이는 보류 결정에 기재되어 있어 보류(요청상 차이 자체는 지적만). | 카피 결정 시 일괄 통일 | design |
| L6 | `src/app/(tabs)/index.tsx` | 알림 버튼 동작 보류 범위에 해당. 계획 문서에 알림 권한/연동 보류가 기록되어 있음. | 알림 기능 도입 때 접근성 상태 포함 | screens |
| L7 | `src/utils/date.ts:1-9` | 기존 중복 import alias는 정리되어 `differenceInCalendarDays` 단일 import 사용. 해소. | — | domain |
| L8 | `src/app/(tabs)/schedule.tsx` | 필터 결과 0건 문구는 실제 빈 상태 분기에서 `해당하는 일정이 없어요.` 사용. 해소. | — | screens |
| L9 | `src/app/pets/[petId]/*/[id].tsx` | not-found EmptyState 문장부호 정합성은 계획의 보류 목록. 보류. | 후속 카피 정리 | design |
| L10 | `src/app/(tabs)/records.tsx`, `pets.tsx` | 좌우 padding 차이는 현 diff 기준 디자인 세부 편차로 남아 있음. | `Spacing.screen`으로 통일 | screens |
| L11 | `src/components/add-circle-button.tsx` | 공통 AddCircleButton 신규 구현과 각 탭 사용이 확인되어 해소. | — | screens |
| L12 | `src/components/form-scroll-container.tsx:32` | SafeAreaView에 edges를 지정하지 않아 기본 전체 edge 적용. 이전 리뷰도 기존 패턴/추정으로 기록. `SafeAreaView`는 상위 navigator safe area 처리와 중복 여부를 시뮬레이터에서 검증할 것. | 화면별 inset 중복 측정 후 필요한 edge만 명시 | screens |
| L13 | `src/features/medication/split-medications.ts:1-3` | 외부 date-fns import 다음 내부 `@/` import 순서로 정렬되어 해소. | — | domain |
| L14 | `app.json:19,29`, `src/components/animated-icon.module.css:2` | 앱 설정에 템플릿 splash/adaptive 색이 남아 있음. 이전 계획에서 앱 아이콘 색 정리는 보류 결정. 보류. | 브랜딩 후속 시 수정 | design |
| L15 | `src/utils/date.test.ts` | timezone 테스트 격리 설정을 `jest/setup-env.js`로 분리했고 관련 setup 테스트 신규. 해소. | — | tests |
| L16 | `src/components/option-sheet.tsx:38-40`, `pet-switch-sheet.tsx` | sheet surface가 backdrop Pressable 내부에 있어 빈 영역 터치가 dismiss 이벤트로 전파될 수 있음. 기존 이슈지만 수정은 보류 목록에 있음. | 내부 래퍼에서 responder 전파 차단 | screens |
| L17 | `src/app/(tabs)/schedule.tsx:356-394` | 지난 일정에 경고색 경과일과 `완료하기` 버튼이 존재. 해소. | — | screens |
| L18 | `.gitignore:31-34` | `.claude/settings.local.json`과 `.agents/` ignore 규칙 존재. 해소. | — | — |

## 이전 리뷰 항목별 판정

근거는 코드에서 확인한 핵심 줄이며, 보류는 계획 문서의 명시된 보류 항목을 뜻한다.

| 항목 | 판정 | 근거 및 판정 내용 |
|---|---|---|
| H1 | 해소 | `src/components/form-scroll-container.tsx:36` — `keyboardVerticalOffset={headerHeight}`. Expo Router hook import/use는 설치된 Router 소스에서 확인. |
| H2 | 해소 | `src/app/(tabs)/index.tsx:111,128` — `hasAnyPet === false`와 `hasAnyPet === null || !dashboard` 로딩 분리. |
| H3 | 해소 | `src/features/pets/pet-form.tsx:68,78` — `gender: undefined`, 제출 때 `values.gender ?? null`; repository nullable 계약 반영. |
| M1 | 해소 | `vaccination/[id].tsx:188-191`, `checkup/[id].tsx:185-188` — 예정일 출력에 날짜 formatter 적용. |
| M2 | 해소 | `src/components/bottom-action-bar.tsx:21-28,38` — safe area context에서 bottom inset 계산. scroll padding이 CTA 중복을 만드는지 전체 화면에서 별도 문제 재현 안 됨. |
| M3 | 해소 | `src/app/(tabs)/schedule.tsx:…` 필터 컨트롤 및 `src/features/pets/pet-form.tsx` 선택 요소에 accessibility role/state가 구현됨. |
| M4 | 해소 | `src/constants/theme.ts`에 통합 의미색/도메인 색 토큰 존재, `src/theme/tokens.ts`에서 theme를 재수출하여 import 경로 사용. `primaryPressed`도 Button pressed 스타일에서 참조. |
| M5 | 해소 | `src/app/(tabs)/index.tsx:320` — `stats-chart-outline`. |
| M6 | 해소 | `src/app/(tabs)/schedule.tsx:53-54` — `예방접종`, `건강검진`. |
| M7 | 보류 | `src/features/medication/split-medications.ts:53` fallback `return true`; plan 보류 목록에 자유 문자열 미인식은 매일 처리 유지. |
| M8 | 해소 | `src/app/(tabs)/records.tsx:367` — 목록 날짜를 `formatDateForDisplay(entry.date, 'list')`로 렌더. |
| M9 | 해소 | `src/app/pets/[petId]/medication/index.tsx:…` 현재 시각 이후 첫 항목을 선별하는 로직 및 공용 시각 비교 함수 확인. |
| M10 | 해소 | `src/components/option-sheet.tsx:113`, `pet-switch-sheet.tsx:105` — `Colors.light.grabber`. |
| L1 | 보류 | `d-day-chip.tsx:81` `smallBold`; plan 보류 목록에 14pt 유지 기록. |
| L2 | 보류 | Button disabled 색/props 차이는 plan 보류 항목. |
| L3 | 미해소 | 숫자 size 인자를 받는 Avatar 호출부가 남아 있음. |
| L4 | 해소 | `src/utils/date.ts:32-35,47-49,73-75` — 날짜 문자열 유효성 검사, invalid 표기 빈 문자열, `daysUntil`은 null 반환. 주요 상세 호출부는 `날짜를 설정해 주세요.` fallback. |
| L5 | 해소 | `src/app/(tabs)/index.tsx`, `pets.tsx`, pet detail은 `formatAgeFromDateString`로 ISO 날짜를 로컬 날짜 파싱. |
| L6 | 보류 | 알림 연동/권한은 계획 문서 보류. |
| L7 | 해소 | `src/utils/date.ts:1-9` 단일 import. |
| L8 | 해소 | 일정 필터 결과 0건은 `해당하는 일정이 없어요.` 출력. |
| L9 | 보류 | EmptyState 문장부호 통일은 보류 목록. |
| L10 | 미해소 | records/pets 화면에 `Spacing.lg` 좌우 padding이 남고 다른 탭은 `Spacing.screen`. |
| L11 | 해소 | 공통 `src/components/add-circle-button.tsx` 구현 및 탭 적용. |
| L12 | 보류 | safe-area edge 설정은 계획상 후속 점검. |
| L13 | 해소 | import 순서 정리. |
| L14 | 보류 | app.json 템플릿 색 정리는 계획상 후속. |
| L15 | 해소 | Jest TZ setup 분리 및 복구/격리 테스트 추가. |
| L16 | 보류 | 시트 내부 터치 닫힘은 기존 동작 유지 결정. |
| L17 | 해소 | `src/app/(tabs)/schedule.tsx:356-394` overdue 안내/action 구현. |
| L18 | 해소 | `.gitignore:31-34`. |
| R1 | 범위 밖 | 이전 리뷰 본문에 R1 식별 항목이 없어 이번 코드 diff 대상으로 매핑 불가. |
| R2 | 범위 밖 | 이전 리뷰 본문에 R2 식별 항목이 없어 이번 코드 diff 대상으로 매핑 불가. |

## D1–D4 시뮬레이터 결함

| 항목 | 판정 | 근거 |
|---|---|---|
| D1 복약 시각 기준 | 해소 | `src/app/pets/[petId]/medication/index.tsx`의 다음 복약 표시는 현재 시각 비교 함수 사용; 홈 hero action label은 제거됨. |
| D2 복약 시간순 | 해소 | `src/features/home/build-home-dashboard.ts:81-91` 정렬; `schedule.tsx`와 medication index에도 시각 comparator 적용. |
| D3 체중 차트 | 해소 | `src/app/pets/[petId]/weight/index.tsx:85-104` 코랄 색/축 포맷/라벨 폭 props. LineChart props 설치 타입과 대조 완료. |
| D4 조사 | 해소 | `src/utils/korean.ts:5-10` 종성 기반 `을/를`, 삭제 확인 테스트 존재. |

## Phase 6.1–6.10 및 확정 결정 12–16

| 단계/결정 | 판정 | 근거 |
|---|---|---|
| 6.1 일정 집계 | 해소 | `src/features/schedule/aggregate-schedule.ts:22-41` 미완료 접종/검진만 집계 후 날짜 오름차순 정렬. |
| 6.2 홈 예정 일정 | 해소 | `src/features/home/build-home-dashboard.ts:68-79` 오늘 이후 일정 3개 제한, 지난 일정 플래그 별도 계산. |
| 6.3 홈 복약 정렬 | 해소 | `build-home-dashboard.ts:81-91` 오늘 복약 선별 후 시각 오름차순. |
| 6.4 탭 일정 | 해소 | `src/app/(tabs)/schedule.tsx:…` upcoming/overdue 분리, 완료 행 제외, overdue action 포함. |
| 6.5 펫 목록 | 해소 | `src/app/(tabs)/pets.tsx` 일정 요약과 포커스 재조회 흐름 구현. |
| 6.6 기록 목록 | 해소 | `src/app/(tabs)/records.tsx:367` 표시 날짜 formatter, 유형별 icon tone 사용. |
| 6.7 접종/검진 index | 해소 | 두 index에서 예정 일정 summary, D-day, bottom CTA 및 시트 흐름 구현. 시트 아이콘 색 부분은 진행 중이라 판정에서 제외. |
| 6.8 D-Day/옵션 시트 | 해소 | `d-day-chip.tsx`, `option-sheet.tsx` 토큰 기반 색/크기 및 접근성 label. 예정된 색 작업은 진행 중. |
| 6.9 domain 함수/완료 흐름 | 해소 | `complete-schedule.ts`, repository update 및 validation 화면 테스트 존재. 아래 체크리스트 참조. |
| 6.10 테스트/통합 | 해소 | 전체 269 테스트, typecheck/lint 통과. 콘솔 `act()` 경고는 남음. |
| 결정 12–16 | 해소 | `plan/coral-design-spec.md`의 일정 완료/미완료 분리, 색 의미/도메인 아이콘/시트 옵션 규칙과 코드 일치. 추가 시트 색 부분은 진행 중. |

## 완료하기 테스트 점검

| 테스트 | (a) 기본값 과거 예정일→예정일 / 미래 예정일→오늘 | (b) 미래 날짜 거부 | (c) 잘못된 날짜 거부 | (d) 완료 시 DB 갱신 단언 |
|---|---|---|---|---|
| `schedule-detail-complete-validation.test.tsx` | 범용 validation 케이스는 완료 input의 초기 기본값을 검사하지 않음 | `미래 날짜(내일)는 거부하고 완료 저장하지 않는다` 122-130 | `잘못된 날짜 형식은 거부하고 완료 저장하지 않는다` 132-140 | 직접 update mock 호출 단언은 아니고 `getCompletedAt` DB 조회 null 여부로 간접 확인 128-139, 성공은 142-160 |
| `vaccination.test.tsx` | `미래 예정일이면 실제 접종일 기본값은 오늘…` 124-145, `과거 예정일이면…예정일…` 147-169 | 해당 파일의 완료 전용 테스트에는 미래 입력 거부 케이스 없음. 기록 등록의 미래 날짜 거부는 별도 test 40행 | 완료 전용 흐름에 잘못된 날짜 케이스 없음 | repository 재조회로 `vaccinatedAt` 값 확인 143-144, 167-168 |
| `checkup.test.tsx` | 미래 예정일 기본 오늘 118-139, 과거 예정일 기본 예정일 141-163 | 완료 전용 테스트에 미래 입력 거부 없음. 기록 등록 미래 거부는 별도 test 37행 | 완료 전용 흐름에 잘못된 날짜 케이스 없음 | repository 재조회 `checkedAt` 137-138, 161-162 |

완료 흐름 테스트는 줄어든 동작 assertion은 확인되지 않았다. 다만 실제 DB update 함수 호출 자체에 대한 spy 단언은 없고 repository 재조회로 최종 저장 값을 확인한다. 잘못된 날짜/미래 날짜 거부는 공통 validation 테스트의 `describe.each` 케이스에서 확인한다.

## 디자인·라우팅·DI·카피 및 진행 중 작업

- 하드코딩 색: 변경 핵심 화면의 실제 색은 `Colors`/`IconTileTone`/`DomainIconTone`을 사용한다. `option-sheet.tsx` 주석의 hex 설명은 코드 색 literal이 아니다. 도메인 아이콘 추가 시트들은 공통 tone 규칙을 사용한다.
- DI: 화면에서 `useSQLiteContext()`로 DB 획득 후 repository factory에 전달하는 기존 레포 패턴을 유지한다. Migration 009는 목록에 등록되어 있다.
- 라우트: 일정 상세/신규 화면 경로는 `src/app/pets/[petId]/vaccination|checkup` 파일 구조에 존재한다.
- 한국어: `~해요` 체와 안내 문구는 일관. 지난 일정 문구 두 종류는 보류 지적.
- 추가 시트의 아이콘 색 정리는 screens 담당이 수정 중이다. 이번 판정에서 해당 코드 수정 전후를 제외하고 상태는 **진행 중**.

## 커밋 판단 및 분할

현재 diff만으로는 커밋 보류 권고: L3 Avatar 숫자 API 호출과 L10 좌우 padding 차이가 해소되지 않았고, 진행 중 아이콘 정리도 남았다. 완료 테스트에는 직접 update spy가 없는 점을 테스트 담당이 검토할 수 있다.

권장 논리 단위:

1. `feat(data): 반려동물 기록 인덱스와 저장소 보완` — migration/repository와 단위 테스트.
2. `feat(ui): 코랄 토큰과 공용 컴포넌트 추가` — theme, Button/Chip/Sheet/Avatar/CTA.
3. `feat(schedule): 일정 집계와 완료 흐름 구현` — schedule domain, 접종·검진 화면 및 테스트.
4. `feat(home): 홈과 탭 대시보드 개편` — home builder와 tabs 화면.
5. `test(ui): 시뮬레이터 결함 회귀 테스트 추가` — D1~D4와 폼/접근성 테스트.
6. `docs(plan): 코랄 시안 스펙과 작업 계획 추가` — plan 문서 및 본 리뷰. `plan/reference/captures/`는 `.gitignore`에 있으므로 커밋 대상에서 제외한다.
7. `.gitignore` 및 로컬 에이전트 설정은 코드 커밋과 분리 검토; `.claude/settings.local.json` 및 `.agents/`는 제외한다.

## 오케스트레이터 교차 확인 (2026-11-09)

reviewer 판정 중 근거가 비었거나 미해소로 남긴 항목을 코드에서 직접 확인했다.

| 항목 | reviewer 판정 | 교차 확인 결과 | 근거 |
|---|---|---|---|
| L10 | 미해소 | **해소** — 네 탭 모두 `Spacing.screen` 사용 | `(tabs)/index.tsx:379`, `pets.tsx:134`, `records.tsx:374`, `schedule.tsx:446` |
| L3 | 미해소 | **보류** — 숫자 호출 2곳만 남음. `pets/[petId]/index.tsx:105` `size={112}`는 확정 결정 8(Pet Detail 112pt 유지), `form-pet-context.tsx:32` `size={32}`는 `AvatarSize.sm`과 같은 값. 보류 목록의 `AvatarSizeKey 미사용 상태 유지`에 해당 | `pet-avatar.tsx:12,22` 숫자/키 모두 허용 |
| M4 | 해소 | **부분 해소** — `primaryPressed`는 사용 중(`button.tsx:78`, `add-circle-button.tsx:41`). 그러나 `src/theme/tokens.ts`는 여전히 import 0건(재수출만 하고 쓰는 곳 없음) | `rg "theme/tokens" src` 결과 없음 |
| M3 | 해소 | 해소 확인 — `Chip`이 `onPress` 시 `accessibilityRole="button"`, 필터일 때 `accessibilityState.selected` 부여. pet-form 성별(`pet-form.tsx:141,178`)과 일정 필터(`schedule.tsx:246-257`)가 `Chip` 사용 | `chip.tsx:79,81` |
| M9 | 해소 | 해소 확인 — `getNextMedicationTime(medications, now = new Date())`가 현재 시각 이후 첫 시각 반환, 테스트 존재 | `split-medications.ts:36-39`, `split-medications.test.ts:112,117` |
| M11·6.11 | 진행 중 | **해소** — 일정 탭·접종·검진 추가 시트 모두 `DomainIconTone` 적용, 매핑은 `theme.ts:130` 한 곳 | `schedule.tsx:423-435`, `vaccination/index.tsx:130-136`, `checkup/index.tsx:127-133` |

결론: 커밋을 막는 미해소 항목은 없다. 남은 정리 후보는 `src/theme/tokens.ts` 미사용 파일 처리와 `form-pet-context.tsx:32`의 `AvatarSize.sm` 치환(선택)이다. 완료하기 흐름 테스트는 약화되지 않았다(위 표 참조, 거부 케이스는 공통 validation 테스트에서 검증).
