# Pawlog Design Guide

> **Warm Coral을 중심으로 Lavender를 포인트로 더한, 밝고 따뜻한 반려동물
> 건강수첩**

-   Document: Pawlog Design Guide
-   Version: 2.0
-   Platform: iOS / Android
-   Related:
    -   `plan/pawlog-product-plan.md`
    -   `plan/screen-layout.md`
-   Implementation tokens: `src/theme/tokens.ts`

------------------------------------------------------------------------

## 1. Design Vision

Pawlog는 반려동물 건강관리 앱이지만 병원 시스템처럼 차갑거나 업무
도구처럼 딱딱하게 보이지 않아야 한다. 사용자가 느껴야 하는 인상은 **우리
아이를 위한 따뜻한 개인 건강수첩**이다.

### Brand Keywords

Warm / Friendly / Lovely / Calm / Personal / Trustworthy / Simple

### Final Visual Direction

-   **Warm Coral** --- Primary Brand Color
-   **Lovely Lavender** --- Secondary Accent
-   **Warm Cream + White** --- 화면의 기본 기반
-   Green/Sage 계열은 브랜드 컬러로 사용하지 않는다.
-   Green은 성공/완료처럼 의미가 필요한 Semantic Color로만 제한한다.

------------------------------------------------------------------------

## 2. Design Principles

### Pet First

앱 자체 캐릭터보다 사용자의 실제 반려동물 사진과 이름이 주인공이어야
한다.

### Warm, Not Clinical

Blue/Green 중심의 의료 서비스 스타일을 피하고 Cream, Coral, Lavender로
개인적인 기록장의 인상을 만든다.

### Lovely, Not Childish

둥근 Shape와 따뜻한 색을 사용하되 과도한 캐릭터, Pink/Purple 면적, Emoji
UI, Gradient를 피한다.

### Information First

다음 예방접종, 건강검진, 복약 시간, 최근 기록, 체중, 병원비가 장식보다
먼저 읽혀야 한다.

### Consistency Over Novelty

새 화면마다 새로운 Color, Radius, Card Style을 만들지 않고 Design
Token과 공통 Component를 우선 사용한다.

------------------------------------------------------------------------

## 3. Brand Color System

### Primary --- Warm Coral

``` text
Primary        #F47C6C
PrimaryPressed #E96F60
PrimaryLight   #FFF0ED
```

사용: - Primary Button - 활성 Bottom Tab - 주요 CTA - 선택 상태 - 중요한
D-day - 핵심 Highlight

화면 전체 배경이나 Error 의미로 사용하지 않는다.

### Secondary --- Lovely Lavender

``` text
Lavender       #A978E8
LavenderLight  #F4EEFC
```

사용: - Pet Profile Accent - Empty State - Onboarding - 보조 Chip - 작은
Illustration - Secondary Highlight

모든 CTA나 큰 화면 배경에는 사용하지 않는다.

### Neutral

``` text
Background     #FFFDFC
Surface        #FFFFFF
TextPrimary    #292524
TextSecondary  #78716C
TextMuted      #A8A29E
Border         #EEEAE7
Divider        #F3F0EE
```

------------------------------------------------------------------------

## 4. Semantic Colors

브랜드 표현이 아니라 상태 의미 전달에만 사용한다.

``` text
Success #65A986
Warning #E9A23B
Info    #6E9ECF
Danger  #D95C5C
```

Success Green은 완료/정상/성공 상태에서만 사용하며 Navigation, CTA,
Brand Highlight에는 사용하지 않는다.

------------------------------------------------------------------------

## 5. Color Hierarchy

``` text
Warm Cream / White   70~80%
Warm Coral           15~20%
Lavender              5~10%
Semantic Colors       필요할 때만
```

Coral과 Lavender가 화면을 채우는 것이 아니라 White/Cream 위에서 포인트가
되어야 한다.

기본 조합:

``` text
Warm Cream Background
+ White Surface
+ Coral Primary Action
+ Lavender Small Accent
```

------------------------------------------------------------------------

## 6. Typography

MVP에서는 별도 Custom Font 없이 System Font를 사용한다.

  Token           Size Weight     Usage
  ------------- ------ ---------- -----------------------
  `display`         28 Bold       Pet Name, 핵심 숫자
  `title`           22 Bold       Screen Title
  `heading`         18 SemiBold   Section Heading
  `body`            16 Regular    기본 본문
  `bodySmall`       14 Regular    보조 정보
  `caption`         12 Regular    날짜, Label, Metadata

핵심 숫자는 주변 설명보다 한 단계 강하게 표현한다.

------------------------------------------------------------------------

## 7. Spacing

4pt 기반 Spacing System.

``` ts
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

-   Screen Horizontal Padding: 20
-   Card Padding: 16
-   Section Gap: 24\~32
-   List Item Gap: 12\~16
-   Small Element Gap: 8

색이나 Card를 추가하기 전에 Spacing으로 정보 그룹을 구분할 수 있는지
먼저 확인한다.

------------------------------------------------------------------------

## 8. Shape

``` ts
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

  Component          Radius
  ---------------- --------
  Chip                 Full
  Input                  12
  Button                 14
  Card                   16
  Highlight Card         20
  Bottom Sheet           24
  Pet Avatar         Circle

모든 요소를 Pill 형태로 만들지는 않는다.

------------------------------------------------------------------------

## 9. Border & Shadow

기본 Border:

``` text
1px #EEEAE7
```

Shadow는 Bottom Sheet, Modal, Floating Element 등 실제 Elevation이
필요한 경우에만 사용한다. 일반 Card에 강한 Shadow를 반복하지 않는다.

------------------------------------------------------------------------

## 10. Iconography

-   Simple Line Icon
-   동일한 Stroke 계열
-   둥글고 부드러운 인상
-   Emoji를 실제 Icon System으로 사용하지 않는다.

``` text
Small   16
Default 20
Tab     22~24
Feature 24
```

------------------------------------------------------------------------

## 11. Pet Photography

Pawlog에서 가장 중요한 Visual Asset이다.

``` text
Small Avatar   32
Medium         48
Large          72
Hero           96+
```

-   원형 Avatar 기본
-   Home에서는 큰 Pet Photo 허용
-   Pets 화면에서는 Photo 비중을 더 크게 사용
-   사진이 없으면 Neutral Pet Placeholder 사용
-   Placeholder에는 연한 Coral/Lavender를 사용할 수 있다.

------------------------------------------------------------------------

## 12. Button

### Primary

``` text
Background: Coral
Text: White
Radius: 14
Min Height: 48
```

등록하기, 저장하기, 기록 추가, 일정 추가 등에 사용한다. 한 화면에서
Primary Button은 가능한 하나만 강하게 보여준다.

### Secondary

White 또는 PrimaryLight 배경 + Soft Border. Text는 TextPrimary 또는
Coral.

### Text

취소, 건너뛰기, 전체보기 등 낮은 우선순위 행동.

### Destructive

Danger Color는 삭제 등 파괴적 행동에만 사용한다.

------------------------------------------------------------------------

## 13. Card

Card는 모든 콘텐츠의 기본 컨테이너가 아니다.

사용: - 다음 일정 - Pet Summary - 중요한 건강 요약 - 월 병원비 Summary

최근 기록, 전체 건강 기록, 복약 목록, 병원비 내역은 List를 우선한다.

------------------------------------------------------------------------

## 14. Highlight Card

Home의 다음 일정처럼 중요한 정보에 사용한다.

``` text
Background: #FFF0ED 또는 White
Accent: Coral
Radius: 20
```

Coral/Lavender Highlight Card를 한 화면에 반복 배치하지 않는다.

------------------------------------------------------------------------

## 15. D-day Chip

``` text
D-14
D-3
오늘
완료
```

-   다가오는 중요 일정: Coral
-   완료: Success
-   주의: Warning

항상 Text Label을 포함해 색만으로 상태를 전달하지 않는다.

------------------------------------------------------------------------

## 16. Input

``` text
Label
[ Input                        ]
Helper / Error
```

-   Label을 Placeholder로 대체하지 않는다.
-   선택 입력은 `(선택)` 표시
-   Error는 Input 아래 표시
-   Form은 Single Column
-   충분한 터치 영역을 확보한다.

------------------------------------------------------------------------

## 17. Chip

### Selected

``` text
Background: PrimaryLight
Text: Coral
```

### Unselected

``` text
Background: White
Text: TextSecondary
Border: Border
```

Lavender Chip은 Pet 관련 특별한 분류 등 제한된 상황에서만 사용한다.

------------------------------------------------------------------------

## 18. Bottom Navigation

``` text
홈 / 기록 / 일정 / 내 반려동물
```

Active:

``` text
Icon: Coral
Label: Coral
```

Inactive:

``` text
Icon: TextSecondary
Label: TextSecondary
```

Navigation Background는 White로 유지한다.

------------------------------------------------------------------------

## 19. Home Visual Direction

Home은 Pawlog의 디자인 정체성을 가장 많이 보여주는 화면이다.

``` text
Warm Cream Background

안녕하세요
오늘도 보리와 건강한 하루를 보내세요.

[ Pet Photo ]  보리
               8살 3개월

다음 일정
┌────────────────────────────┐
│ 종합백신              D-14 │
│ 9월 28일                   │
└────────────────────────────┘

오늘의 복약
영양제                    21:00

이번 달 병원비
125,000원

최근 기록                 전체보기
09.03 건강검진
08.22 체중 4.3kg
08.10 예방접종
```

-   Pet Photo: 가장 감성적인 요소
-   CTA / D-day: Coral
-   Pet 관련 작은 Accent: Lavender
-   Card: White
-   Background: Warm Cream

------------------------------------------------------------------------

## 20. Records Visual Direction

Home보다 정보 중심으로 구성한다.

``` text
기록                         +

[전체] [건강] [접종] [검진] →

2026년 9월

건강검진
9월 3일 · OO동물병원

체중
8월 22일 · 4.3kg
```

Coral은 선택 Filter와 주요 Action 정도로 제한하며 기록 종류마다 강한
개별 색을 부여하지 않는다.

------------------------------------------------------------------------

## 21. Schedule Visual Direction

``` text
일정                         +

[전체] [접종] [검진] [복약]

9월

28
종합백신                 D-14

29
영양제                   21:00
```

D-day Coral이 자연스럽게 시선을 끌도록 주변 색을 절제한다.

------------------------------------------------------------------------

## 22. Pets Visual Direction

Pets 화면은 Lavender를 가장 자연스럽게 활용할 수 있는 화면이다.

``` text
내 반려동물

        [ Pet Photo ]

            보리
         8살 3개월
       고양이 · 암컷

      [ 프로필 수정 ]

건강 관리
예방접종                  >
건강검진                  >
복약 관리                 >
체중 기록                 >
병원비 기록               >
```

Pet Photo 주변 또는 Profile Metadata에 연한 Lavender를 사용할 수 있다.
Coral과 Lavender를 큰 면적으로 동시에 사용하지 않는다.

------------------------------------------------------------------------

## 23. Empty State

``` text
[Small Illustration]

아직 건강 기록이 없어요.

오늘부터 우리 아이의
건강을 하나씩 기록해 보세요.

[ 첫 기록 남기기 ]
```

Illustration은 Coral + Lavender의 Soft Pastel을 사용하고 CTA는 Coral을
사용한다.

------------------------------------------------------------------------

## 24. Illustration

사용: - Empty State - First Pet Registration - Onboarding - Pet
Placeholder

사용하지 않음: - 기록 목록 장식 - 모든 Section Header - 데이터보다 큰
Illustration

실제 콘텐츠에서는 Pet Photo를 Illustration보다 우선한다.

------------------------------------------------------------------------

## 25. Accessibility

-   최소 Touch Target: `44 x 44`
-   Button 권장 최소 높이: `48`
-   색만으로 의미를 전달하지 않는다.
-   상태에는 Text/Icon을 병행한다.
-   본문 16px 기본
-   Caption은 부가 정보에만 사용
-   OS Font Scaling을 가능한 범위에서 존중한다.

------------------------------------------------------------------------

## 26. Motion

허용: - Bottom Sheet - 화면 전환 - 기록 저장 완료 - Pet 변경 - 작은
State Transition

피함: - 큰 Bounce - 반복 장식 Animation - 건강 정보 확인을 방해하는
Motion

------------------------------------------------------------------------

## 27. Voice & Microcopy

Tone: - 따뜻함 - 친근함 - 간결함 - 불안을 조장하지 않음

Good:

``` text
다음 건강검진까지 21일 남았어요.
오늘 21:00에 영양제 일정이 있어요.
보리의 첫 건강 기록을 남겨보세요.
```

Avoid:

``` text
반드시 지금 확인하세요!
건강검진을 놓치면 위험할 수 있습니다!
AI가 건강 상태를 판단했습니다.
```

Pawlog는 의료 진단 앱이 아니다.

------------------------------------------------------------------------

## 28. Theme Tokens

`src/theme/tokens.ts` 초기 기준:

``` ts
export const colors = {
  primary: '#F47C6C',
  primaryPressed: '#E96F60',
  primaryLight: '#FFF0ED',

  lavender: '#A978E8',
  lavenderLight: '#F4EEFC',

  background: '#FFFDFC',
  surface: '#FFFFFF',

  textPrimary: '#292524',
  textSecondary: '#78716C',
  textMuted: '#A8A29E',

  border: '#EEEAE7',
  divider: '#F3F0EE',

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

------------------------------------------------------------------------

## 29. Design Priority

구현 시 충돌이 생기면:

``` text
1. 사용성과 정보 가독성
2. screen-layout.md의 정보 구조
3. design-guide.md의 Token / Component 규칙
4. 개별 화면의 장식적 표현
```

시각적으로 예쁘다는 이유만으로 정보 구조를 변경하지 않는다.

------------------------------------------------------------------------

## 30. Do / Don't

### Do

-   Warm Cream과 White를 화면 대부분으로 사용
-   Coral을 대표색으로 사용
-   Lavender를 작은 감성 포인트로 사용
-   실제 Pet Photo 적극 활용
-   충분한 White Space 확보
-   List와 Typography로 정보 위계 구성
-   Design Token 재사용

### Don't

-   Sage/Green을 브랜드 Primary로 사용
-   Coral/Lavender로 화면 전체를 채우기
-   모든 Card를 Pink/Purple Background로 만들기
-   기록 종류마다 무지개처럼 다른 색 사용
-   강한 Gradient 반복
-   지나치게 귀여운 캐릭터 중심 디자인
-   모든 콘텐츠를 Card로 만들기
-   임의의 Hex/Radius/Spacing 추가

------------------------------------------------------------------------

## 31. MVP Design Completion Criteria

-   Coral이 Primary로 일관되게 사용된다.
-   Lavender가 Secondary Accent 역할을 유지한다.
-   Sage/Green이 브랜드 요소에서 제거되어 있다.
-   Warm Cream / White가 화면 대부분을 차지한다.
-   Pet Photo가 앱의 감성적 중심 역할을 한다.
-   Home / Records / Schedule / Pets가 같은 Visual Language를 사용한다.
-   Button / Chip / Card / Input / D-day / List 스타일이 통일되어 있다.
-   모든 화면이 Theme Token을 사용한다.
-   Empty / Error / Loading / Disabled 상태가 정의되어 있다.
-   최소 터치 영역과 텍스트 가독성을 확보한다.

------------------------------------------------------------------------

## 32. Future Considerations

MVP 이후 검토: - Dark Mode - App Icon - Onboarding Illustration - Home
Widget - PDF Health Report - Advanced Charts - Multi-Pet UX 고도화 - Pro
Feature Visual Language

Dark Mode는 MVP에서 제외한다. 향후 Theme 확장을 위해 Component 내부에서
직접 Hex를 사용하기보다 Semantic Token을 사용한다.

------------------------------------------------------------------------

# Final Direction

> **Warm Coral을 중심으로 Lavender를 포인트로 더한, 밝고 따뜻한 반려동물
> 건강수첩.**

Pawlog에서 가장 먼저 기억되어야 하는 것은 특정 색이나 캐릭터가 아니라
**사용자의 반려동물과 그 아이의 건강 기록**이다.
