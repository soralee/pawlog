# Pawlog Screen Layout

## 1. Purpose

이 문서는 Pawlog의 화면 구조, 정보 배치, Navigation과 주요 User Flow를 정의한다.

문서 역할:

- `pawlog-product-plan.md` — 무엇을 만들지
- `screen-layout.md` — 어디에 무엇을 배치하고 어떻게 이동할지
- `design-guide.md` — 어떻게 보이게 할지

UI Reference Screenshot이 제공된 경우 실제 시각적 Layout과 Density는 Screenshot을 우선하고, 이 문서는 정보 구조와 기능적 요구사항을 보완한다.

---

## 2. Core UX Principle

> **Home에서는 지금 알아야 할 것을 보여주고, Records에서는 지나간 일을 찾고, Schedule에서는 앞으로 할 일을 확인하며, Pets에서는 우리 아이 자체를 관리한다.**

---

## 3. Information Architecture

```text
Home
  Pet Hero
  Next Schedule
  Today Medication
  Monthly Expense
  Recent Records

Records
  All
  Health
  Vaccination
  Checkup
  Medication
  Weight
  Expense

Schedule
  All
  Vaccination
  Checkup
  Medication

Pets
  Profile
  Edit
  Add / Switch Pet
```

Create/Edit/Detail 화면은 Bottom Tab에 추가하지 않는다.

---

## 4. App Entry Flow

```text
Splash
  ↓
Pet 존재 여부 확인
  ├─ 없음 → Welcome → Pet Registration → Home
  └─ 있음 → Home
```

MVP에서는 긴 Onboarding Carousel을 만들지 않는다.

### Welcome

목적:

- Pawlog가 무엇을 하는 앱인지 짧게 설명
- 첫 Pet 등록으로 연결

Primary CTA:

```text
반려동물 등록하기
```

---

## 5. Pet Registration

### Required

- 이름
- 종류

### Optional

- 사진
- 생년월일
- 성별

생년월일을 모르는 사용자를 위해 입력을 강제하지 않는다.

Layout:

```text
Header
  반려동물 등록

Photo Picker

이름
[                  ]

종류
[ 강아지 ] [ 고양이 ]

생년월일 (선택)
[                  ]

성별 (선택)
[                  ]

[ 등록하기 ]
```

Single Column Form을 기본으로 한다.

---

## 6. Bottom Navigation

고정 Tab:

```text
홈
기록
일정
내 반려동물
```

등록/수정/상세 화면은 Stack 또는 Modal로 연다.

---

## 7. Home

Home은 특정 Pet 선택에 종속되지 않고 등록된 모든 Pet의 현재 상태를 요약한다.

### Layout Order

순서를 고정한다.

```text
Pet Hero
↓
Next Schedule
↓
Today Medication
↓
Monthly Expense
↓
Recent Records
```

### 7.1 Pet Hero

표시:

- Pet Photo
- 이름
- 나이
- 종류/성별 등 최소 Profile 정보

Pet 전환이 가능한 경우 현재 선택된 Pet이 명확히 보여야 한다.

### 7.2 Next Schedule

가장 가까운 미완료 일정 하나를 우선 노출한다.

표시 예:

```text
다음 일정

종합백신                      D-14
10월 20일
```

필요 시 전체 일정으로 이동할 수 있다.

### 7.3 Today Medication

오늘 복용해야 할 Medication만 표시한다.

예:

```text
오늘의 복약

영양제                       21:00
```

오늘 일정이 없으면 간결한 Empty State를 사용한다.

### 7.4 Monthly Expense

이번 달 Hospital Expense Total만 간단하게 보여준다.

MVP에서는 Chart를 사용하지 않는다.

### 7.5 Recent Records

최근 기록 3~5개.

Timeline 또는 Simple List 형태.

```text
최근 기록                  전체보기

10.02  건강검진
09.28  체중 4.3kg
09.15  예방접종
```

Home에 Shortcut Grid를 추가하지 않는다.

---

## 8. Records

목적:

**이미 일어난 일을 찾는다.**

### Header

```text
기록                         + 기록
```

Header Button 또는 명확한 Add Button을 사용한다.

FAB와 Header Add Button을 동시에 사용하지 않는다.

### Filters

Horizontal Chip:

```text
전체 | 건강 | 예방접종 | 검진 | 복약 | 체중 | 병원비
```

### List

- 최신순
- 월 단위 Group
- Pet Filter 기준. 기본값 `전체`에서는 모든 Pet을 통합

예:

```text
2026년 10월

10.02
건강검진
정기 건강검진 완료

09.28
체중
4.3kg
```

### Add Record

기록 추가 진입 시 짧은 선택은 Bottom Sheet.

```text
어떤 기록을 남길까요?

건강 기록
예방접종
건강검진
복약
체중
병원비
```

선택 후 해당 Full Screen Form으로 이동한다.

### Detail

```text
< 건강검진                         수정

2026.10.02
정기 건강검진

병원
...

메모
...

삭제
```

Edit는 Header, Delete는 화면 하단의 Destructive Action으로 둔다.

---

## 9. Schedule

목적:

**앞으로 해야 할 일을 확인한다.**

MVP에서는 Calendar Grid보다 Upcoming List를 우선한다.

### Filters

```text
전체 | 예방접종 | 건강검진 | 복약
```

### Upcoming List

가까운 일정 순.

```text
오늘

영양제
21:00

10월 20일

종합백신
D-14
```

### Add Schedule

여기서 추가하는 예방접종/건강검진은 완료 기록이 아니라 아직 수행하지 않은 `일정`이다. 저장 후 Records가 아니라 Schedule에 표시한다.

Schedule에서 직접 추가 가능한 도메인:

- 예방접종
- 건강검진
- 복약

짧은 Type 선택은 Bottom Sheet, 실제 입력은 Full Screen Form.

### Repeating Medication

매일 반복되는 복약을 List에 날짜별 수십 개 Row로 만들지 않는다.

반복 Rule을 하나의 Medication Schedule로 표현하고 오늘/다가오는 일정에서 필요한 Instance만 보여준다.

---

## 10. Pets

목적:

**우리 아이 자체를 관리한다.**

### Profile

```text
[ Large Pet Photo ]

보리
8살 3개월
고양이 · 여아

[ 프로필 수정 ]

예방접종
건강검진
복약
체중
병원비
```

Pet Photo를 충분히 크게 사용한다.

### Multi-pet

- `내 반려동물` Tab은 등록된 모든 Pet을 보여주는 Hub에서 시작한다.
- Pet을 선택하면 해당 Pet의 Profile과 건강 기록/예방접종/검진/복약/체중/병원비를 개별 관리한다.
- Home은 모든 Pet을 Aggregate하며 Pet 선택으로 전체 화면을 전환하지 않는다.
- Records/Schedule은 `전체` 또는 특정 Pet으로 필터링한다.
- 전체 보기 Row에는 Pet 이름 또는 작은 사진을 표시한다.
- 기록/일정 생성 시 대상 Pet은 필수이며 누구의 데이터인지 명확히 표시한다.
- Pet Detail에서 생성하면 해당 Pet을 기본 대상값으로 전달한다.
- Pet이 한 마리면 불필요한 Pet Filter/Switch UI를 숨긴다.

---

## 11. Weight

### Weight Screen

```text
체중

현재
4.3 kg

[ Weight Chart ]

기록

10.01  4.3kg
09.01  4.2kg
08.01  4.1kg
```

Chart는 데이터가 충분할 때만 보여준다.

데이터가 거의 없는 상태에서 빈 Chart Frame을 크게 노출하지 않는다.

---

## 12. Hospital Expense

Finance Dashboard처럼 복잡하게 만들지 않는다.

```text
병원비

이번 달
125,000원

10.02
OO동물병원
85,000원

09.15
OO동물병원
40,000원
```

핵심:

- Monthly Total
- Date
- Hospital
- Amount

---

## 13. Medication

Medication은 Active와 Ended 상태를 구분한다.

```text
복약

복용 중

영양제
매일 21:00

처방약
아침 / 저녁

종료된 복약

...
```

현재 복용 중인 항목이 먼저 보여야 한다.

---

## 14. Notification Permission Flow

앱 실행 직후 OS Permission을 요청하지 않는다.

Flow:

```text
사용자가 Reminder가 필요한 Schedule 저장
↓
Pawlog 설명 UI
"일정을 놓치지 않도록 알림을 보내드릴까요?"
↓
사용자 동의
↓
OS Notification Permission
↓
Notification Schedule
```

사용자 행동의 Context 안에서 Permission을 요청한다.

---

## 15. Bottom Sheet vs Full Screen

### Bottom Sheet

짧은 선택:

- 기록 종류
- 일정 종류
- Pet 선택
- 단순 Action Menu

### Full Screen

입력이 필요하거나 정보량이 많은 화면:

- Pet 등록/수정
- 건강 기록 Form
- 예방접종 Form
- 건강검진 Form
- 복약 Form
- 체중 Form
- 병원비 Form
- Record Detail

---

## 16. Form Layout

공통 Pattern:

```text
Header

Field Label
[ Input ]

Field Label
[ Input ]

Field Label
[ Input ]

...

[ Primary Action ]
```

- Single Column
- Label을 Placeholder로 대체하지 않는다.
- Optional Field 표시
- Error는 해당 Field 바로 아래
- Keyboard가 활성화되어도 저장 버튼에 접근 가능해야 한다.
- Safe Area를 고려한다.

---

## 17. Empty States

각 화면에서 사용자가 다음 행동을 이해할 수 있어야 한다.

Records:

```text
아직 건강 기록이 없어요.
오늘부터 우리 아이의 건강을 기록해 보세요.

[ 첫 기록 남기기 ]
```

Schedule:

```text
예정된 일정이 없어요.
다음 예방접종이나 검진 일정을 등록해 보세요.

[ 일정 추가하기 ]
```

---

## 18. Loading & Error

Local-first 앱이라도 Database Initialization, Migration, Image Loading 등 상태가 존재한다.

### Loading

전체 화면 Blocking이 필요한 경우에만 사용한다.

### Error

사용자가 취할 수 있는 행동을 함께 제공한다.

예:

```text
기록을 불러오지 못했어요.

[ 다시 시도 ]
```

---

## 19. Suggested Expo Router Structure

실제 구현 단계에서 필요한 Route만 생성한다.

```text
app/
├── _layout.tsx
├── welcome.tsx
├── pet/
│   ├── new.tsx
│   └── [id]/
│       └── edit.tsx
├── record/
│   ├── [id].tsx
│   └── ...
└── (tabs)/
    ├── _layout.tsx
    ├── index.tsx
    ├── records.tsx
    ├── schedule.tsx
    └── pets.tsx
```

모든 미래 Route를 초기부터 빈 파일로 만들 필요는 없다.

---

## 20. MVP Screen Inventory

대략적인 MVP 화면:

1. Splash / Initialization
2. Welcome
3. Pet Registration
4. Home
5. Records
6. Record Type Sheet
7. Health Record Form
8. Vaccination Form
9. Checkup Form
10. Medication Form
11. Weight Form
12. Expense Form
13. Record Detail
14. Schedule
15. Schedule Type Sheet
16. Pets
17. Pet Edit
18. Pet Switch Sheet
19. Weight History
20. Medication List

구현하면서 실제 필요성이 없는 독립 화면은 합칠 수 있다.

---

## 21. Responsive Scope

MVP는 Phone First.

- iOS/Android Phone
- Safe Area 대응
- 작은 화면에서도 Form/Button 접근 가능
- Tablet 전용 Layout은 MVP에서 만들지 않는다.

---

## 22. Visual Reference Priority

Reference Screenshot이 프로젝트에 추가되면 다음 우선순위를 사용한다.

1. **Reference Screenshot** — Layout, spacing 감각, component placement, visual density
2. **screen-layout.md** — Information architecture, navigation, user flow
3. **design-guide.md** — Warm Coral color system, exact tokens, reusable component styling
4. **pawlog-product-plan.md** — Feature scope, domain behavior

Screenshot에 과거 Sage/Lavender Color가 포함되어 있더라도 색은 복제하지 않는다.

Layout은 Screenshot을 최대한 충실하게 재현하고 Color는 `design-guide.md`의 Warm Coral System을 사용한다.


---

# 23. Warm Coral Screen Design Blueprints

이 섹션은 실제 화면 구현 명세다. Claude Code는 기능만 만족하는 임의 CRUD UI가 아니라 아래 Visual Hierarchy를 구현한다.

## Global Rules

- Background는 Warm Cream, 주요 Surface는 White.
- Coral은 CTA, Active, D-day 등 중요한 곳에만 사용한다.
- Stack Header에 화면명이 있으면 본문에 같은 대형 제목을 반복하지 않는다.
- 기획에 없는 Gear/Setting Action을 추가하지 않는다.
- 큰 `+` 문자만 단독 CTA로 배치하지 않는다.
- Header Add, Bottom CTA, FAB를 한 화면에서 중복 사용하지 않는다.
- 데이터가 없다고 화면을 빈 공간으로 남기지 않고 Empty State를 사용한다.
- 모든 콘텐츠를 Card로 감싸지 않는다.
- Screen padding 20, Section gap 24~32, Card padding 16을 기본으로 한다.

## Home

```text
안녕하세요
오늘도 보리의 건강을 함께 챙겨볼까요?

[Photo]  보리
         8살 · 고양이 · 여아

다음 일정
┌─────────────────────────────┐
│ 종합백신              D-14 │
│ 10월 20일                   │
└─────────────────────────────┘

오늘의 복약
영양제                 21:00 ›

이번 달 병원비
125,000원

최근 기록              전체보기
10.02 건강검진               ›
09.28 체중 4.3kg             ›
09.15 예방접종               ›
```

Pet Photo 72~96, 이름 22 Bold. Next Schedule만 Highlight Card를 우선 사용한다. Recent Records는 Simple List이며 Shortcut Grid는 추가하지 않는다.

## Records

```text
기록                         기록 추가

[전체] [건강] [예방접종] [검진] →

2026년 10월

10.02  건강검진
       정기 건강검진 완료      ›

09.28  체중
       4.3kg                  ›
```

우측 Action은 의미가 드러나는 Text Action을 우선한다. Filter는 Horizontal Chip, 목록은 월 단위 최신순 Simple List다. Empty State는 document icon + 설명 + `첫 기록 남기기`.

## Schedule

```text
일정                         일정 추가

[전체] [예방접종] [건강검진] [복약]

오늘
┌─────────────────────────────┐
│ 영양제                      │
│ 오늘 21:00             오늘 │
└─────────────────────────────┘

다가오는 일정
┌─────────────────────────────┐
│ 종합백신              D-14 │
│ 10월 20일                   │
└─────────────────────────────┘
```

Calendar Grid 대신 Upcoming List. D-day/오늘만 Coral로 강조하며 Type별 무지개 색을 사용하지 않는다.

## Pets

```text
내 반려동물                    추가

          [ Pet Photo ]

             보리
       8살 3개월 · 고양이
              여아

        [ 프로필 수정 ]

건강 관리
예방접종                      ›
건강검진                      ›
복약                          ›
체중                          ›
병원비                        ›
```

Pet Photo 96~120, 이름 22~28 Bold. 실제 사진이 화면의 감성적 중심이다. 관리 메뉴는 Neutral Icon + Label + Chevron의 Simple List다.

## Medication — 복약 관리

현재 복약 관리 화면은 아래 구조를 고정 기준으로 사용한다.

```text
<          복약 관리

┌─────────────────────────────┐
│ 오늘의 복약                 │
│ 1개의 복약 일정이 있어요.    │
│ 다음 복약은 오후 9:00이에요. │
└─────────────────────────────┘

복용 중                         1

┌─────────────────────────────┐
│ 영양제                      │
│ 매일 · 오후 9:00            │
│ 오늘 오후 9:00           ›  │
└─────────────────────────────┘

종료된 복약
처방약
9.01 - 9.07                  ›

[          복약 추가          ]
```

Header 우측 Gear 없음. 본문에 `복약` 대형 제목을 반복하지 않고 큰 `+` 단독 아이콘도 사용하지 않는다. Today Summary는 Primary Light Highlight Card, Active Medication은 White Card, Ended Medication은 Simple List다. Empty State는 medkit icon + `복용 중인 약이 없어요.` + CTA.

## Vaccination

```text
<          예방접종

다음 예방접종
┌─────────────────────────────┐
│ 종합백신              D-14 │
│ 10월 20일                   │
└─────────────────────────────┘

접종 기록
09.15  종합백신              ›
08.15  종합백신              ›

[        예방접종 추가        ]
```

다음 일정은 Highlight Card, 과거 접종은 Simple List다.

## Checkup

```text
<          건강검진

다음 건강검진
┌─────────────────────────────┐
│ 정기 건강검진         D-32 │
│ 11월 7일                    │
└─────────────────────────────┘

검진 기록
10.02  정기 건강검진         ›
06.10  혈액검사              ›

[          검진 추가          ]
```

Vaccination과 동일한 Visual Family를 사용한다.

## Weight

```text
<            체중

현재 체중
4.3 kg
최근 측정 10월 1일

[ Weight Trend Chart ]

체중 기록
10.01                     4.3kg
09.01                     4.2kg
08.01                     4.1kg

[          체중 기록          ]
```

현재 체중은 28 Bold. Chart는 데이터가 충분할 때만 노출하며 History는 Simple List다.

## Hospital Expense

```text
<           병원비

이번 달 병원비
125,000원
10월

병원비 내역
10.02  OO동물병원        85,000원
09.15  OO동물병원        40,000원

[         병원비 기록         ]
```

금액은 28 Bold. Finance Dashboard처럼 확장하지 않고 Chart를 추가하지 않는다.

## Pet Registration / Edit

```text
<        반려동물 등록

        [  Photo  ]
       [사진 추가]

이름
[ 보리                       ]

종류
[ 강아지 ] [ 고양이 ]

생년월일 (선택)
[ 2018. 03. 12              ]

성별 (선택)
[ 여아                       ]

[          등록하기          ]
```

Photo 96 원형, Single Column, Field gap 20. Edit CTA는 `저장하기`다.

## Common Record Form

```text
<          기록 추가

날짜
[ 2026.10.06                ]

항목
[                           ]

병원 (선택)
[                           ]

메모 (선택)
[                           ]

[           저장하기         ]
```

Domain별 Field는 Product Plan을 따른다. Input 48+, Field gap 20, Save는 Full-width Coral이며 Floating Save Button은 사용하지 않는다.

## Record Detail

```text
<          건강검진          수정

2026년 10월 2일

정기 건강검진

병원
OO동물병원

메모
특이사항 없음

─────────────────────────────

             삭제
```

Label/Value 중심이며 모든 값을 Card로 감싸지 않는다. 수정은 Header Text Action, 삭제는 하단 Danger Action이다.

## Record Type Sheet

```text
╭─────────────────────────────╮
│ ━━━━━                       │
│ 어떤 기록을 남길까요?        │
│ 건강 기록                  › │
│ 예방접종                   › │
│ 건강검진                   › │
│ 복약                       › │
│ 체중                       › │
│ 병원비                     › │
╰─────────────────────────────╯
```

White Surface, Top Radius 24, Row 52~56. Emoji 대신 Ionicons를 사용한다.

## Pet Switch Sheet

```text
╭─────────────────────────────╮
│ ━━━━━                       │
│ 반려동물 선택               │
│ [Photo] 보리              ✓ │
│ [Photo] 모카                │
│ + 반려동물 추가              │
╰─────────────────────────────╯
```

Photo 40~48, 선택 상태만 Coral Accent를 사용한다.

## Notification Permission

```text
        [bell icon]

일정을 놓치지 않도록
알림을 보내드릴까요?

예방접종, 검진, 복약 시간을
필요한 때 알려드려요.

[       알림 받기       ]
      나중에 할게요
```

OS Permission 전에 표시하고 앱 첫 실행 즉시 띄우지 않는다.

---

# 24. Claude Code Implementation Contract

화면 구현 전 Product Scope → 이 문서의 Screen Blueprint → `design-guide.md`의 Token/Icon 규칙 순으로 확인한다.

- Blueprint의 정보 순서와 Hierarchy를 임의 변경하지 않는다.
- 새로운 Section/Action/Setting을 임의 추가하지 않는다.
- Stack Header Title을 본문에 반복하지 않는다.
- 단독 대형 `+` CTA를 만들지 않는다.
- Warm Coral 외 새로운 Brand Color를 만들지 않는다.
- 임의 Hex/Radius/Spacing을 추가하지 않는다.
- 모든 것을 Card로 만들지 않는다.
- 실제 Pet Photo가 있으면 Photo를 시각적 중심으로 사용한다.
- 데이터가 없으면 Empty State를 구현한다.
- Screenshot Reference가 있으면 Layout Density를 최대한 맞춘다.

Self-check:

```text
[ ] Header 제목이 본문에서 중복되지 않았는가?
[ ] 기획에 없는 Gear/+ 등의 Action이 생기지 않았는가?
[ ] CTA가 어디에 있는지 즉시 이해되는가?
[ ] Warm Coral이 강조 요소에만 사용되는가?
[ ] White/Cream 면적이 충분한가?
[ ] 화면 아래가 의미 없이 크게 비어 있지 않은가?
[ ] Card가 과도하게 반복되지 않는가?
[ ] Empty State가 정의되어 있는가?
[ ] Touch Target 44 이상인가?
[ ] Theme Token과 Ionicons를 사용했는가?
```


---

# 25. Multi-pet Tab Requirements

Multi-pet은 MVP의 기본 UX다. `selectedPetId` 하나로 Home/Records/Schedule 전체를 동시에 전환하는 구조를 사용하지 않는다.

## 25.1 Home — All Pets Summary

```text
오늘도 아이들의 건강을 챙겨볼까요?

우리 아이들                         + 추가

[보리 사진]       [모카 사진]
보리              모카
8살 · 고양이      4살 · 강아지
D-14 예방접종      오늘 복약 21:00

다가오는 일정                       전체보기
[보리] 종합백신              D-14
       10월 20일
[모카] 심장사상충             오늘
       오늘 21:00

오늘의 복약
[모카] 영양제 · 21:00              ›

이번 달 병원비
전체                      185,000원
보리                       85,000원
모카                      100,000원

최근 기록                           전체보기
[보리] 건강검진 · 10.02            ›
[모카] 체중 6.2kg · 10.01          ›
```

- Home은 모든 Pet의 Aggregate Summary다.
- Pet Summary를 누르면 해당 Pet Detail로 이동한다.
- 일정/복약/최근 기록에는 대상 Pet을 표시한다.
- Pet이 한 마리면 병원비 Pet별 Breakdown 등 중복 UI를 숨긴다.

## 25.2 Records — All / Pet-specific

```text
기록                         기록 추가

반려동물  [전체] [보리] [모카]
종류      [전체] [건강] [예방접종] [검진] →

2026년 10월
10.02  [보리] 건강검진            ›
10.01  [모카] 체중 6.2kg          ›
```

- Pet Filter와 Record Type Filter는 별개다.
- Pet Filter 기본값은 `전체`.
- 전체 보기에서는 모든 Row에 Pet 이름 또는 작은 Photo를 표시한다.
- 특정 Pet 선택 시 해당 Pet 데이터만 보여준다.
- Pet이 한 마리면 Pet Filter를 숨긴다.
- 기록 추가 시 대상 Pet은 필수다.
- 전체 Context에서 추가하면 Pet을 선택하고, Pet Detail에서 추가하면 해당 Pet을 기본값으로 사용한다.

## 25.3 Schedule — All / Pet-specific

```text
일정                         일정 추가

반려동물  [전체] [보리] [모카]
종류      [전체] [예방접종] [건강검진] [복약]

오늘
[모카] 영양제 · 21:00             오늘

다가오는 일정
[보리] 종합백신 · 10월 20일       D-14
```

- Pet Filter 기본값은 `전체`.
- 전체 보기의 모든 일정에 대상 Pet을 표시한다.
- Pet Filter와 Schedule Type Filter를 함께 사용할 수 있다.
- 정렬은 Filter와 무관하게 가까운 일정 우선이다.
- 새 일정 생성 시 대상 Pet은 필수다.
- 반복 복약 역시 Pet별로 귀속된다.

## 25.4 Pets — Multi-pet Hub

```text
내 반려동물                    추가

우리 아이들

┌─────────────────────────────┐
│ [Photo] 보리                │
│ 8살 · 고양이             ›  │
│ 다음 일정 · 종합백신 D-14   │
└─────────────────────────────┘

┌─────────────────────────────┐
│ [Photo] 모카                │
│ 4살 · 강아지             ›  │
│ 오늘 복약 · 21:00           │
└─────────────────────────────┘
```

- Tab 첫 화면은 특정 Pet Profile이 아니라 등록된 Pet 전체를 보여주는 Hub다.
- Pet Card에는 Photo, 이름, 기본 정보와 가장 가까운 건강 Action을 보여준다.
- `추가`로 새 Pet을 등록한다.
- Pet Card를 누르면 Pet Detail로 이동한다.

### Pet Detail

```text
          [ Pet Photo ]

             보리
       8살 3개월 · 고양이
              여아

        [ 프로필 수정 ]

건강 관리
건강 기록                    ›
예방접종                      ›
건강검진                      ›
복약                          ›
체중                          ›
병원비                        ›
```

- Pet Detail 이하 화면은 해당 Pet으로 Scope한다.
- Domain 화면에서 생성한 데이터는 해당 Pet에 귀속한다.
- Form 상단 또는 Field에서 대상 Pet을 명확히 보여준다.
- 다른 Pet으로 바꾸기 위해 앱 전체 Context를 암묵적으로 변경하지 않는다.

## 25.5 Data Ownership Rule

모든 아래 데이터는 반드시 하나의 `petId`에 귀속한다.

```text
health_records
vaccinations
checkups
medications
hospital_expenses
weight_records
reminders
```

Aggregate 화면은 여러 Pet의 데이터를 Query/Service Layer에서 합쳐 표현한다. Pet별 원본 데이터의 소유 관계를 변경하지 않는다.

## 25.6 Single-pet Graceful Mode

등록된 Pet이 한 마리일 때도 동일한 구조를 사용하되 불필요한 Multi-pet UI를 숨긴다.

- Records/Schedule의 Pet Filter 숨김
- Home 병원비의 전체/개별 중복 Breakdown 숨김
- 기록/일정 Form의 Pet 선택 과정은 생략 가능하지만 대상 Pet 이름은 확인 가능하게 표시



---

# 26. Record ↔ Schedule Lifecycle

화면 구현 시 가장 중요한 Domain Rule:

> **기록은 실제로 일어난 일, 일정은 아직 해야 하는 일이다.**

날짜가 미래/과거인지 만으로 Records와 Schedule을 분류하지 않는다.

## 26.1 Schedule Add

일정 탭에서 추가 가능한 항목:

```text
예방접종 일정
건강검진 일정
복약 일정
```

예방접종/검진 Form의 날짜 Label은 `접종일`, `검진일`이 아니라 **`예정일`** 로 표시한다.

저장 직후 해당 항목은 Schedule에 표시되어야 하며 Records에는 표시하지 않는다.

## 26.2 Record Add

기록 탭에서 추가 가능한 항목:

```text
건강 기록
예방접종 기록
건강검진 기록
체중 기록
병원비 기록
```

예방접종/검진의 날짜는 **실제 수행일**이다. 미래 날짜를 완료 기록으로 저장하지 않는다.

## 26.3 Complete Schedule Flow

예방접종/건강검진 일정 Detail에는 명확한 `완료하기` Action을 제공한다.

```text
<          예방접종 일정

보리
종합백신

예정일
2026.10.20

[          완료하기          ]
```

완료 선택:

```text
접종을 완료했나요?

실제 접종일
[ 2026.10.20 ]

병원 (선택)
[            ]

메모 (선택)
[            ]

[       완료하고 기록하기     ]
```

완료 후:

- Upcoming Schedule에서 제거
- Records에 완료 기록 표시
- Home Upcoming에서 제거
- Home Recent Records에 반영 가능
- 예약된 관련 Notification 취소/정리

## 26.4 Past-due UI

예정일이 지나도 자동으로 Records로 이동시키지 않는다.

Schedule에서 별도 Section 또는 상태로 보여준다.

```text
지난 일정

[보리] 종합백신
10월 2일 · 5일 지남              ›

[       완료하기       ]
```

사용자가 실제로 수행하지 않았을 수 있기 때문이다.

## 26.5 Medication Exception

복약은 매 복용 회차마다 Records로 전환하지 않는다.

- 활성 복약 계획은 Schedule에서 관리
- Home에는 오늘 필요한 복약만 Instance 형태로 표시
- 반복 규칙은 하나의 Medication으로 유지
- 종료된 Medication은 복약 관리 화면의 종료 목록으로 이동
- MVP에서는 매일의 복용 완료 여부를 Records Timeline에 생성하지 않는다.

## 26.6 Copy Rules

모호한 Label을 피한다.

```text
Records:
예방접종 기록 추가
건강검진 기록 추가

Schedule:
예방접종 일정 추가
건강검진 일정 추가
복약 일정 추가
```

Form에서도:

```text
완료 기록 → 실제 접종일 / 실제 검진일
예정 일정 → 예정일
```

Claude Code는 두 Context에서 같은 Form을 재사용하더라도 Label과 Validation을 동일하게 처리하지 않는다.


# Final Screen Direction

> **Pawlog는 CRUD 관리 도구가 아니라, 사용자의 반려동물 사진과 건강 기록이 중심이 되는 따뜻한 개인 건강수첩이다.**
