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

Home은 현재 선택된 Pet 기준이다.

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
- 현재 선택된 Pet 기준

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

여러 Pet이 있는 경우:

- 현재 선택된 Pet이 항상 명확해야 한다.
- Pet Switch UI를 제공한다.
- Records/Schedule/Home은 선택된 Pet 기준으로 변경된다.
- 등록 Form에서는 대상 Pet을 명확히 표시한다.

Pet 선택처럼 짧은 선택 UI는 Bottom Sheet 사용을 권장한다.

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

# Final Layout Principle

> **Home은 현재, Records는 과거, Schedule은 미래, Pets는 반려동물 자체를 관리한다.**

화면을 추가하거나 기능을 배치할 때 이 역할이 섞이지 않도록 한다.
