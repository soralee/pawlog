# Pawlog Design Guide

> **Warm Coral을 중심으로 한, 밝고 따뜻한 반려동물 건강수첩**

- Version: 3.0
- Platform: iOS / Android
- Related:
  - `plan/pawlog-product-plan.md`
  - `plan/screen-layout.md`
- Implementation tokens: `src/theme/tokens.ts`

---

## 1. Design Vision

Pawlog는 반려동물의 건강 기록과 앞으로 해야 할 일을 관리하는 앱이다. 병원 시스템처럼 차갑거나 업무 도구처럼 딱딱하게 보이지 않고, **우리 아이를 위한 따뜻한 개인 건강수첩**처럼 느껴져야 한다.

### Brand Keywords

- Warm
- Friendly
- Personal
- Trustworthy
- Simple
- Lovely

### Final Visual Direction

- **Warm Coral** — Primary Brand Color
- **Warm Cream + White** — 화면의 기본 기반
- 실제 반려동물 사진 — 가장 중요한 감성 요소
- Sage/Green과 Lavender는 브랜드 컬러로 사용하지 않는다.
- Green은 성공/완료처럼 의미가 필요한 Semantic Color에서만 제한적으로 사용한다.

---

## 2. Design Principles

### Pet First

Pawlog의 주인공은 앱의 캐릭터나 컬러가 아니라 **사용자의 반려동물**이다.

- 실제 반려동물 사진을 적극 활용한다.
- Home과 Pet Profile에서 사진의 비중을 충분히 확보한다.
- Illustration이 실제 Pet Photo보다 강하게 보이지 않도록 한다.

### Warm, Not Clinical

건강관리 앱이라는 이유로 Blue/Green 중심의 의료 서비스 스타일을 사용하지 않는다.

Warm Cream, White, Coral을 활용해 개인적인 기록장의 인상을 만든다.

### Lovely, Not Childish

둥근 Shape와 따뜻한 색을 사용하되 지나치게 유아적이지 않게 한다.

피한다:

- 과도한 캐릭터
- 화면 전체를 채우는 Pink/Coral
- Emoji 중심 UI
- 지나친 Gradient
- 장식 목적의 요소 남용

### Information First

예쁜 화면보다 다음 정보가 먼저 읽혀야 한다.

- 다음 예방접종
- 건강검진 일정
- 복약 시간
- 최근 건강 기록
- 체중
- 병원비

### Consistency Over Novelty

새 화면마다 새로운 Color, Radius, Card Style을 만들지 않는다. Design Token과 공통 Component를 우선 사용한다.

---

## 3. Color System

### Primary — Warm Coral

```text
Primary        #F47C6C
PrimaryPressed #E96F60
PrimaryLight   #FFF0ED
```

사용:

- Primary Button
- 활성 Bottom Tab
- 주요 CTA
- 선택된 상태
- 중요한 D-day
- 핵심 Highlight
- 주요 Link/Icon Accent

사용하지 않음:

- 화면 전체 Background
- 모든 Card Background
- 긴 본문
- Error 의미

### Neutral

```text
Background     #FFF9F7
Surface        #FFFFFF

TextPrimary    #292524
TextSecondary  #78716C
TextMuted      #A8A29E

Border         #EEE8E5
Divider        #F5F0EE
```

### Semantic Colors

브랜드 표현이 아니라 상태 의미 전달에만 사용한다.

```text
Success #65A986
Warning #E9A23B
Info    #6E9ECF
Danger  #D95C5C
```

Green은 Navigation, CTA, Brand Highlight에 사용하지 않는다.

---

## 4. Color Hierarchy

전체 화면은 다음 비중을 기준으로 한다.

```text
Warm Cream / White   80~85%
Warm Coral           10~15%
Semantic Colors       필요할 때만
```

정확한 픽셀 비율이 아니라 시각적 사용 빈도에 대한 원칙이다.

**화면을 Coral로 채우지 않는다. Coral이 예쁘게 보일 수 있도록 White/Cream 면적을 충분히 확보한다.**

기본 조합:

```text
Warm Cream Background
+ White Surface
+ Coral CTA / Active State
+ Neutral Text
```

---

## 5. Typography

MVP에서는 별도 Custom Font 없이 System Font를 사용한다.

| Token | Size | Weight | Usage |
| --- | ---: | --- | --- |
| `display` | 28 | Bold | Pet Name, 핵심 숫자 |
| `title` | 22 | Bold | Screen Title |
| `heading` | 18 | SemiBold | Section Heading |
| `body` | 16 | Regular | 기본 본문 |
| `bodySmall` | 14 | Regular | 보조 정보 |
| `caption` | 12 | Regular | 날짜, Label, Metadata |

숫자 데이터는 주변 설명보다 한 단계 강하게 보여준다.

---

## 6. Spacing

4pt 기반 Spacing System.

```ts
spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  screen: 20,
  lg: 24,
  xl: 32,
  xxl: 40,
}
```

기본:

- Screen Horizontal Padding: 20
- Card Padding: 16
- Section Gap: 24~32
- List Item Gap: 12~16
- Small Element Gap: 8

색이나 Card를 추가하기 전에 Spacing으로 정보 그룹을 구분할 수 있는지 먼저 확인한다.

---

## 7. Shape

```ts
radius = {
  sm: 8,
  input: 12,
  button: 14,
  card: 16,
  largeCard: 20,
  sheet: 24,
  full: 999,
}
```

| Component | Radius |
| --- | ---: |
| Chip | Full |
| Input | 12 |
| Button | 14 |
| Card | 16 |
| Highlight Card | 20 |
| Bottom Sheet | 24 |
| Pet Avatar | Circle |

둥근 형태를 사용하지만 모든 요소를 Pill 형태로 만들지는 않는다.

---

## 8. Border & Shadow

기본 Border:

```text
1px #EEE8E5
```

기본 Card 구분은 Border 또는 Background 차이로 표현한다.

Shadow는 다음처럼 실제 Elevation이 필요한 경우에만 사용한다.

- Bottom Sheet
- Modal
- Floating Element

일반 Card에 강한 Shadow를 반복하지 않는다.

---

## 9. Pet Photography

Pawlog에서 가장 중요한 Visual Asset이다.

```text
Small Avatar   32
Medium         48
Large          72
Hero           96+
```

- 원형 Avatar 기본
- Home에서는 큰 Pet Photo 허용
- Pets 화면에서는 Photo 비중을 더 크게 사용
- 사진이 없으면 Neutral + Soft Coral Pet Placeholder 사용

---

## 10. Button

### Primary

```text
Background: #F47C6C
Text: White
Radius: 14
Min Height: 48
```

등록하기, 저장하기, 기록 추가, 일정 추가 등에 사용한다.

한 화면에서 Primary Button은 가능한 하나만 강하게 보여준다.

### Secondary

```text
Background: White 또는 #FFF0ED
Border: #EEE8E5
Text: #292524 또는 #F47C6C
```

### Destructive

Danger Color는 삭제 등 파괴적 행동에만 사용한다.

---

## 11. Card

Card는 모든 콘텐츠의 기본 컨테이너가 아니다.

Card 사용:

- 다음 일정
- Pet Summary
- 중요한 건강 요약
- 월 병원비 Summary

List 우선:

- 최근 기록
- 전체 건강 기록
- 복약 목록
- 병원비 내역

Home의 중요한 Highlight Card는 `#FFF0ED` 또는 White를 사용할 수 있다.

---

## 12. D-day Chip

예:

```text
D-14
D-3
오늘
완료
```

- 다가오는 중요 일정: Coral
- 완료: Success
- 주의: Warning

항상 Text Label을 포함해 색만으로 상태를 전달하지 않는다.

---

## 13. Input

```text
Label
[ Input                        ]
Helper / Error
```

- Label을 Placeholder로 대체하지 않는다.
- 선택 입력은 `(선택)` 표시
- Error는 Input 아래 표시
- Form은 Single Column
- 충분한 터치 영역을 확보한다.

---

## 14. Chip

Selected:

```text
Background: #FFF0ED
Text: #F47C6C
```

Unselected:

```text
Background: White
Text: #78716C
Border: #EEE8E5
```

---

## 15. Bottom Navigation

```text
홈 / 기록 / 일정 / 내 반려동물
```

Active:

```text
Icon: #F47C6C
Label: #F47C6C
```

Inactive:

```text
Icon: #78716C
Label: #78716C
```

Bottom Navigation Background는 White로 유지한다.

---

## 16. Screen Visual Direction

### Home

Home은 Pawlog의 디자인 정체성을 가장 많이 보여주는 화면이다.

- Background: Warm Cream
- Pet Photo: 가장 감성적인 요소
- CTA / D-day / Active: Coral
- Card: White
- Text: Neutral
- Shortcut Grid를 추가하지 않는다.

정보 순서는 `screen-layout.md`를 따른다.

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

### Records

Home보다 정보 중심으로 구성한다.

- 선택 Filter: Coral
- 주요 Action: Coral
- 목록은 White/Cream 기반
- 기록 종류마다 서로 다른 강한 컬러를 부여하지 않는다.

### Schedule

다가오는 일정의 긴급도가 먼저 읽혀야 한다.

- D-day: Coral
- 완료: Success
- 주변 요소는 Neutral
- Calendar Grid가 아닌 Upcoming List가 MVP 기본이다.

### Pets

실제 Pet Photo와 Profile 정보가 화면의 중심이다.

Coral은 프로필 수정 버튼이나 선택 상태 등 Action에 사용하고, 사진보다 강하게 보이지 않도록 한다.

---

## 17. Empty State & Illustration

Empty State에서는 작은 Illustration을 사용할 수 있다.

```text
[Small Illustration]

아직 건강 기록이 없어요.

오늘부터 우리 아이의
건강을 하나씩 기록해 보세요.

[ 첫 기록 남기기 ]
```

Illustration:

- Soft Coral + Neutral
- Simple
- 작은 크기

실제 콘텐츠에서는 Pet Photo를 Illustration보다 우선한다.

---

## 18. Accessibility

- 최소 Touch Target: `44 x 44`
- Button 권장 최소 높이: `48`
- 색만으로 의미를 전달하지 않는다.
- 상태에는 Text/Icon을 병행한다.
- 본문 16px 기본
- Caption은 부가 정보에만 사용
- OS Font Scaling을 가능한 범위에서 존중한다.

---

## 19. Motion

허용:

- Bottom Sheet
- 화면 전환
- 기록 저장 완료
- Pet 변경
- 작은 State Transition

피함:

- 큰 Bounce
- 반복 장식 Animation
- 건강 정보 확인을 방해하는 Motion

---

## 20. Voice & Microcopy

Tone:

- 따뜻함
- 친근함
- 간결함
- 불안을 조장하지 않음

Good:

```text
다음 건강검진까지 21일 남았어요.
오늘 21:00에 영양제 일정이 있어요.
보리의 첫 건강 기록을 남겨보세요.
```

Pawlog는 의료 진단 앱이 아니다.

---

## 21. Theme Tokens

`src/theme/tokens.ts` 초기 기준:

```ts
export const colors = {
  primary: '#F47C6C',
  primaryPressed: '#E96F60',
  primaryLight: '#FFF0ED',

  background: '#FFF9F7',
  surface: '#FFFFFF',

  textPrimary: '#292524',
  textSecondary: '#78716C',
  textMuted: '#A8A29E',

  border: '#EEE8E5',
  divider: '#F5F0EE',

  success: '#65A986',
  warning: '#E9A23B',
  info: '#6E9ECF',
  danger: '#D95C5C',
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  screen: 20,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const radius = {
  sm: 8,
  input: 12,
  button: 14,
  card: 16,
  largeCard: 20,
  sheet: 24,
  full: 999,
} as const;

export const typography = {
  display: { fontSize: 28, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '700' },
  heading: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  bodySmall: { fontSize: 14, fontWeight: '400' },
  caption: { fontSize: 12, fontWeight: '400' },
} as const;
```

---

## 22. Screenshot Reference Rule

UI Reference Screenshot이 프로젝트에 제공되는 경우 **레이아웃과 시각적 구성은 Screenshot을 우선 기준으로 사용한다.**

우선순위:

1. Reference Screenshot — Layout, component placement, visual density
2. `screen-layout.md` — Information architecture, navigation, user flow
3. `design-guide.md` — Color values, tokens, component styling
4. `pawlog-product-plan.md` — Feature scope and domain rules

단, Reference Screenshot에 Sage, Green, Lavender 등 과거 디자인 컬러가 포함되어 있더라도 해당 컬러는 복제하지 않는다.

**Screenshot의 구조는 유지하고 색상은 이 문서의 Warm Coral Color System으로 치환한다.**

Claude Code 등 구현 도구는 Reference Screenshot을 임의로 재해석하거나 새로운 디자인을 추가하기보다 가능한 한 동일한 Layout Hierarchy와 Visual Density를 재현한다.

---

## 23. Do / Don't

### Do

- Warm Cream과 White를 화면 대부분으로 사용한다.
- Coral을 Pawlog의 유일한 브랜드 Primary로 사용한다.
- 실제 Pet Photo를 적극 활용한다.
- 충분한 White Space를 둔다.
- List와 Typography로 정보 위계를 만든다.
- Design Token을 재사용한다.
- Screenshot Reference가 있다면 레이아웃을 충실하게 따른다.

### Don't

- Sage/Green을 브랜드 Primary로 사용한다.
- Lavender를 브랜드 Secondary로 사용한다.
- 화면 전체를 Coral/Pink로 채운다.
- 모든 Card를 Coral Background로 만든다.
- 기록 종류마다 무지개처럼 다른 색을 사용한다.
- 강한 Gradient를 반복한다.
- 지나치게 귀여운 캐릭터를 중심으로 디자인한다.
- 모든 콘텐츠를 Card로 만든다.
- 임의의 Hex, Radius, Spacing을 화면마다 추가한다.

---

## 24. MVP Design Completion Criteria

- Warm Coral이 Primary로 일관되게 사용된다.
- Sage와 Lavender가 브랜드 요소에서 제거되어 있다.
- Warm Cream / White가 화면 대부분을 차지한다.
- Pet Photo가 앱의 감성적 중심 역할을 한다.
- Home / Records / Schedule / Pets가 동일한 Visual Language를 사용한다.
- Button / Chip / Card / Input / D-day / List 스타일이 통일되어 있다.
- 모든 화면이 Theme Token을 사용한다.
- Reference Screenshot이 있는 화면은 레이아웃과 시각적 밀도가 충분히 유사하다.
- Empty / Error / Loading / Disabled 상태가 정의되어 있다.
- 최소 터치 영역과 텍스트 가독성을 확보한다.

---

# Final Direction

> **Warm Coral을 중심으로 한, 밝고 따뜻한 반려동물 건강수첩.**

Pawlog에서 가장 먼저 기억되어야 하는 것은 컬러나 캐릭터가 아니라 **사용자의 반려동물과 그 아이의 건강 기록**이다.
