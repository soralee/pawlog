# Pawlog UI Redesign Plan

> 목적: 현재 구현된 Pawlog 코드를 기반으로 화면 완성도를 높인다. 단순히 스타일 값을 바꾸는 것이 아니라, 이전에 검토했던 Coral / Sage / Lavender 콘셉트 시안 수준으로 정보 위계, 여백, 카드·리스트 형태, 화면 밀도, Empty State, 반려동물 사진 활용을 명확히 설계한다.
>
> **현재 구현에서는 Warm Coral만 최종 브랜드 방향으로 사용한다.** Coral / Sage / Lavender 시안은 디자인 완성도의 참고 기준이지, 세 가지 테마를 앱에 추가하라는 의미가 아니다.

## 1. Source of Truth

Claude Code는 작업 전 다음 문서를 읽는다.

1. `plan/pawlog-product-plan.md` — 제품 범위와 도메인 규칙
2. `plan/screen-layout.md` — 화면 구조, 이동, 기록·일정 생명주기, Multi-pet 요구사항
3. `plan/design-guide.md` — Warm Coral 디자인 토큰, Typography, Iconography, 공통 치수
4. 이 문서 — 현재 코드 기준 UI Redesign 작업 순서와 화면별 시각적 목표

기존 코드를 먼저 확인하고 기존 DB/Repository/Navigation/동작을 최대한 보존한다. UI Redesign 작업을 이유로 도메인 로직을 임의 재작성하지 않는다.

## 2. Current Implementation Review

현재 `main` 브랜치의 주요 UI 경로:

- `src/app/(tabs)/index.tsx` — Home Dashboard
- `src/app/(tabs)/records.tsx` — Records 통합 Timeline 및 Pet/Type Filter
- `src/app/(tabs)/schedule.tsx` — Schedule 목록, Pet/Type Filter, 지난 일정/복약
- `src/app/(tabs)/pets.tsx` — Multi-pet Hub
- `src/components/app-tabs.tsx` — Bottom Tab Navigation
- `src/components/card.tsx`, `list-item.tsx`, `empty-state.tsx`, `pet-avatar.tsx`, `option-sheet.tsx` — 공통 UI
- `src/constants/theme.ts` — 실제 디자인 토큰
- `src/theme/tokens.ts` — theme token re-export

현재 코드에서 확인되는 특징과 개선 대상:

- 공통 Token/Component가 이미 있으므로 화면마다 새로운 스타일을 만들기보다 이를 정리·확장한다.
- Home은 실제 데이터와 다중 Pet 요약을 읽고 있지만 Pet Card의 사진이 40pt이고 정보 밀도가 낮아 화면의 Hero 역할이 약하다.
- Records/Schedule은 큰 Screen Title과 넓은 여백이 강조되고, 필터와 목록의 시각적 연결이 약하다.
- Records의 Add Action은 단독 `+` 아이콘이라 명확한 Text Action보다 의미가 약하다. 단, 기존 접근성 Label과 동작은 보존한다.
- Pets Hub는 기본 구조가 있지만 Card 내부 정보 위계와 다음 Action 표현을 더 정돈할 수 있다.
- EmptyState는 원형 placeholder만 있어 화면의 완성도가 낮다. 새 이미지 Asset을 추가하지 않고 Ionicons와 토큰으로 개선한다.
- `record-type-tabs.tsx`에는 하드코딩된 `#ccc`, `#3c87f7`가 있어 Warm Coral token 사용 규칙과 충돌한다.
- 스크린샷에 보이는 떠 있는 회색 Gear는 앱 디자인에 포함하지 않는다. 개발 환경 Overlay인지 먼저 확인하고 앱 코드에서 임의로 추가하지 않는다.
- 현재 화면의 여백이 크다는 이유로 장식 카드나 Shortcut Grid를 새로 추가하지 않는다.

이 항목은 시각적 개선 대상이다. 기능 버그를 발견하면 따로 기록하고, 디자인 변경과 섞어서 데이터 생명주기를 임의로 바꾸지 않는다.

## 3. Final Art Direction

### Visual Goal

**따뜻한 코랄을 중심으로 한 밝고 따뜻한 반려동물 건강수첩.**

- Base: Warm Cream + White
- Primary Accent: Warm Coral
- Content: 실제 반려동물 사진, 간결한 건강 정보
- Mood: 따뜻하고 친근하지만 유아적이지 않음
- UI Density: 지금보다 정보가 잘 묶이고 한눈에 읽히되, 빽빽하지 않음

### Required Tokens

`src/constants/theme.ts`의 토큰을 사용한다.

| Token | Value |
| --- | --- |
| Primary | `#F47C6C` |
| Primary Pressed | `#E96F60` |
| Primary Light | `#FFF0ED` |
| Background | `#FFF9F7` |
| Surface | `#FFFFFF` |
| Text Primary | `#292524` |
| Text Secondary | `#78716C` |
| Text Muted | `#A8A29E` |
| Border | `#EEE8E5` |
| Divider | `#F5F0EE` |

Spacing, Radius, Typography도 기존 `Spacing`, `Radius`, `Typography` 토큰을 우선한다. 새 Hex 값이나 새 브랜드 컬러를 추가하지 않는다. Sage/Green/Lavender를 Primary 또는 테마 선택지로 추가하지 않는다.

## 4. Shared Layout Rules

- Phone-first, iOS/Android Safe Area 대응
- Screen horizontal padding: 20~24pt 범위에서 기존 토큰 사용
- Root Tab Header는 간결하게: 제목 22 Bold, 우측 Action은 터치 영역 44x44 이상
- Stack Header에 화면명이 표시되면 본문에서 같은 제목을 크게 반복하지 않는다.
- Primary Button은 높이 48 이상, Radius 14
- List Row는 터치 가능한 경우 높이 56 전후를 목표로 하고 최소 터치 영역 44 확보
- Section 간격 24~32, Card 내부 padding 16
- 아이콘은 `@expo/vector-icons/Ionicons`만 사용
- Card는 중요한 요약에만 사용하고, Timeline/내역은 단순 리스트 우선
- 그림자와 Gradient는 기본적으로 사용하지 않는다.
- 숫자와 상태는 색상만으로 구분하지 않고 텍스트 Label을 함께 표시한다.
- 버튼과 리스트에 실제 기능이 연결되어야 한다. 장식용 클릭 요소를 만들지 않는다.

## 5. Screen-by-Screen Visual Specification

### 5.1 Home — All Pets Dashboard

목표: 등록된 모든 Pet의 오늘과 가까운 일정을 한눈에 보여준다. 특정 `selectedPetId`에 따라 Home 전체가 바뀌지 않는다.

순서:

1. 짧은 Greeting
2. 우리 아이들
3. 다가오는 일정
4. 오늘의 복약
5. 이번 달 병원비
6. 최근 기록

#### Greeting

- `오늘도 아이들의 건강을 챙겨볼까요?`를 보조 문구로 사용한다.
- 상단에 큰 별도 Screen Title을 반복하지 않는다.
- Greeting과 첫 Section 사이 간격은 20~24pt.

#### 우리 아이들

- Section Header: `우리 아이들` + Text Action `+ 추가`
- Pet Card는 가로 스크롤 목록.
- Pet Avatar는 현재 40pt에서 **56~64pt**로 키워 사진/프로필을 더 잘 인식하게 한다.
- 이름은 16pt Semibold, 종/나이는 14pt Secondary.
- 다음 Action이 있으면 한 줄의 작은 Coral Text로 표현한다.
- 한 마리만 있어도 카드가 왼쪽에 자연스럽게 보이고, 빈 화면을 채우기 위한 가짜 카드나 추가 영역은 만들지 않는다.
- 사진이 없으면 공통 Pet Placeholder를 사용한다.

#### 다가오는 일정

- Section Header와 `전체보기`는 한 줄.
- 다음 일정은 최대 3개를 우선 보여주고, 가까운 순으로 정렬한다.
- 한 일정은 White Surface의 List Row를 기본으로 하고, 꼭 필요한 Highlight만 Primary Light를 사용한다.
- Title은 `[보리] 종합백신`, Subtitle은 예정일, Trailing은 D-day.
- 예정 일정이 없으면 작은 중립 Empty State + `일정 추가하기` Action을 제공한다. 큰 중앙 Empty State로 Home 전체를 밀어내지 않는다.

#### 오늘의 복약

- 오늘 복용할 Medication만 표시한다.
- 각 항목에 Pet 이름, 약/영양제 이름, 시간 표시.
- 항목이 없으면 `오늘 복용할 약이 없어요.`를 짧게 표시한다.

#### 이번 달 병원비

- Label과 금액을 같은 요약 그룹으로 배치한다.
- 전체 금액은 24~28pt Bold.
- Pet이 여러 마리면 Pet별 금액을 보조 정보로 표시한다. 한 마리면 Breakdown을 숨긴다.
- Chart를 추가하지 않는다.

#### 최근 기록

- 최근 3~5개.
- Pet 이름을 전체 기록에서 항상 식별 가능하게 표시.
- 날짜/보조 정보는 Secondary Text.
- 카드가 반복되는 형태가 아니라 구분선이 있는 Simple List를 사용한다.

### 5.2 Records — Completed History

목표: 실제 발생한 기록을 빠르게 검색하고 확인한다.

- 상단 제목 `기록`은 22pt Bold. 현재보다 과도하게 크게 보이지 않도록 한다.
- 우측 Action은 접근성 Label을 유지하면서 시각적으로 명확한 `기록 추가` Text Action을 우선한다. Header Add와 FAB를 동시에 두지 않는다.
- Pet Filter와 Type Filter가 둘 다 필요한 경우 두 줄의 수평 Chip으로 분리한다.
- Chip 높이는 약 36pt, 간격은 8pt.
- 목록은 최신순 월별 Group.
- Row 구조: 날짜/핵심 내용/보조 정보/Pet 식별/상세 Chevron.
- 전체 보기에서 Pet이 여러 마리면 각 Row에 Pet 이름 또는 작은 Avatar를 표시한다.
- 데이터는 단순 List로 표시하고 각 Row를 Card로 감싸지 않는다.
- Empty State는 작은 Ionicons 아이콘, 짧은 설명, `첫 기록 남기기` CTA로 구성한다.
- 실제 발생한 건강 기록, 완료 접종/검진, 체중, 병원비만 노출한다. 예정 접종/검진을 Records에 추가하지 않는다.

### 5.3 Schedule — Upcoming and Past-due

목표: 앞으로 해야 할 일과 완료하지 못한 지난 일정을 명확히 구분한다.

- Header `일정`은 22pt Bold, 명확한 `일정 추가` Action.
- Filter: Pet Filter(전체/Pet별) + Type Filter(전체/접종/검진/복약).
- `오늘의 복약`, `다가오는 일정`, `지난 일정`을 구분한다.
- 다가오는 일정은 날짜 오름차순.
- D-day는 예정일 기준으로 계산한다. 지난 일정은 `3일 지남`처럼 표현하고 `D+3` 같은 혼란스러운 표기를 피한다.
- 전체 보기에서는 모든 Row에 Pet 이름/Avatar를 표시한다.
- Upcoming은 Highlight Card를 남용하지 않고 List Row를 기본으로 한다.
- 지난 일정은 Warning Semantic Token과 `지난 일정` Label로 구분하되, 전체 Row를 강한 주황색으로 채우지 않는다.
- 빈 화면에서는 중앙 Empty State를 사용하되 Safe Area와 Tab Bar를 고려해 수직 중앙에 적절히 위치시킨다.
- 일정 생성/완료 로직은 `pawlog-product-plan.md`와 `screen-layout.md`를 따른다. 디자인 작업 중 별도 로직을 만들지 않는다.

### 5.4 Pets — Multi-pet Hub

목표: 여러 반려동물을 탐색하고 각 Pet 상세로 이동한다.

- Header `내 반려동물` + `추가`.
- Pet마다 하나의 White Card. Card는 전체 폭, Avatar 56~64pt, 이름 18pt Semibold.
- 보조 정보: 나이/종류/성별은 14pt Secondary.
- 다음 일정이 있으면 한 줄로 표시하되, 없으면 빈 placeholder를 만들지 않는다.
- Chevron을 넣어 상세 이동 가능함을 분명히 한다.
- 카드 전체가 눌리는 영역이며 최소 터치 영역을 확보한다.
- 등록된 Pet이 없으면 Empty State + `반려동물 등록하기`.

### 5.5 Pet Detail

- 큰 Pet Photo 104~120pt.
- 이름 24~28pt Bold, 그 아래 나이/종류/성별.
- `프로필 수정`은 Secondary Button 또는 명확한 Text Action.
- `건강 관리` 아래 건강 기록, 예방접종, 건강검진, 복약, 체중, 병원비를 일관된 56pt 전후 List Row로 제공.
- 각 Row는 neutral Ionicon + Label + Chevron.
- 건강 관리 항목은 단순 텍스트처럼 보이지 않게 전체 Row를 터치 가능하게 한다.
- `반려동물 삭제`는 다른 주요 Action과 시각적으로 분리하고 Destructive Token을 사용한다.

### 5.6 Forms and Detail Screens

- 기존 데이터 흐름과 Validation을 보존한다.
- Single Column Form, Label은 Placeholder로 대체하지 않는다.
- Field 간격 16~20pt, Input 최소 높이 48pt.
- Header Title은 한 번만 표시.
- Pet Context를 알 수 있도록 대상 Pet 이름/Avatar를 Form 상단에 명확히 표시한다.
- 기록 날짜는 실제 수행일, 일정 날짜는 예정일로 구분한다.
- Save는 화면 하단 Full-width Primary Button. Keyboard와 Safe Area를 고려한다.
- 삭제는 Destructive Action으로 분리한다.

### 5.7 Bottom Sheets

- White Surface, 상단 Radius 24.
- Title과 옵션 리스트의 위계가 분명해야 한다.
- 각 Row 52~56pt, 터치 가능한 전체 Row.
- 기록 추가 옵션은 `예방접종 기록`, 일정 추가 옵션은 `예방접종 일정`처럼 Context가 드러나는 명칭을 사용한다.
- Pet 선택이 필요한 경우 사진/이름/종류를 보여준다.
- Emoji를 기능 아이콘 대신 사용하지 않는다.

### 5.8 Bottom Tab Bar

- 탭: 홈 / 기록 / 일정 / 내 반려동물.
- Ionicons outline/inactive, filled/active.
- Active는 Primary Coral, Inactive는 Text Secondary.
- White Background, Divider Top Border.
- Label 항상 표시, Safe Area 고려.
- Tab 높이/아이콘/Label을 임의로 과장하지 않는다.

## 6. Interaction and State Requirements

각 화면은 아래 상태를 점검한다.

- 정상 데이터가 있는 상태
- 데이터가 없는 상태
- Pet이 1마리인 상태
- Pet이 2마리 이상인 상태
- 로딩 중 / 오류 상태(기존 처리 범위 내)
- 긴 이름/긴 제목이 있는 상태
- 작은 기기 화면에서의 줄바꿈/스크롤
- Keyboard 표시 중 Form

디자인 수정이 데이터 조회를 바꾸지 않았는지 확인한다. UI에서 실제 데이터가 있는 데도 Empty State가 표시되면 스타일로 가리지 말고 원인을 찾아 별도로 보고한다.

## 7. Implementation Sequence

### Phase 1 — Inspect and Plan

1. 현재 변경사항과 파일 구조를 확인한다.
2. 주요 화면과 공통 Component를 확인한다.
3. 화면별 기존 동작/데이터 연결을 기록한다.
4. 기능 버그와 디자인 이슈를 분리한다.
5. 변경할 파일 목록을 먼저 제시한다.

### Phase 2 — Shared Design Foundation

1. 기존 Theme Token을 재사용한다.
2. 하드코딩된 색상(특히 Record Type Tabs)을 Token으로 교체한다.
3. 공통 Header Action, Chip, List Row, Pet Summary, Empty State의 일관성을 맞춘다.
4. 공통 Component를 필요 이상으로 추상화하지 않는다.

### Phase 3 — Main Tabs

권장 순서:
1. Home
2. Records
3. Schedule
4. Pets Hub

각 화면을 하나씩 수정하고 화면 확인 후 다음으로 넘어간다.

### Phase 4 — Detail and Form Polish

Pet Detail, Record Detail, Add/Edit Form, Option Sheet를 같은 규칙으로 맞춘다.

### Phase 5 — Verification

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- 변경된 화면의 정상/Empty/Multi-pet 상태 확인
- 기능 동작이 바뀐 경우 관련 테스트 추가
- 최종 수정 파일 및 미해결 항목 요약

## 8. Non-goals

- 새로운 기능/탭/도메인 추가
- Backend, Login, Cloud Sync, AI
- Sage/Lavender 테마 선택 기능 추가
- 새로운 UI Library/아이콘 라이브러리 설치
- 데이터 모델의 대규모 재작성
- 임의의 테스트 데이터로 실제 데이터 문제 숨기기
- 디자인을 이유로 기존 동작 제거
- 화면 전체를 Card로 감싸기
- 장식용 Gradient, Shadow, Emoji, Shortcut Grid 추가

## 9. Claude Code Prompt

이 문서를 읽은 뒤 다음 프롬프트로 작업한다.

```text
현재 Pawlog GitHub 코드의 UI를 아래 문서 기준으로 리디자인해줘.

- plan/pawlog-product-plan.md
- plan/screen-layout.md
- plan/design-guide.md
- plan/ui-redesign-plan.md

먼저 현재 코드와 Git 변경사항을 분석하고 화면별 수정 계획을 제시해줘. 바로 대규모 수정부터 하지 마.

현재 앱은 React Native + Expo Router + TypeScript이며, 기존 Theme Token, ThemedText/ThemedView, Card, ListItem, PetAvatar, EmptyState, OptionSheet, Ionicons를 최대한 재사용해.

목표는 단순히 색상만 바꾸는 것이 아니라, 이전에 검토했던 Coral/Sage/Lavender 시안 수준의 완성도처럼 화면별 정보 위계, 여백, 이미지 비중, 컴포넌트 크기, 시각적 밀도, Empty State, 리스트 구조를 세밀하게 다듬는 거야.

단, 최종 브랜드는 Warm Coral 하나야. Sage/Lavender 테마를 추가하지 말고 design-guide.md의 색상과 토큰을 사용해.

작업 원칙:
- 기존 기능과 데이터 흐름을 보존한다.
- Product Plan의 Records/Schedule 생명주기를 위반하지 않는다.
- Home은 모든 Pet을 요약한다.
- Records/Schedule은 전체/Pet별 Filter를 유지한다.
- Pet Detail은 해당 Pet의 정보로 Scope한다.
- 실제 데이터가 존재하는데 Empty State가 나오면 UI로 감추지 말고 원인을 조사한다.
- 하드코딩된 색상과 임의 spacing을 줄인다.
- 화면마다 새 디자인을 발명하지 않고 공통 Component와 Token을 사용한다.
- 현재 화면에 없는 기능, Gear, FAB, Shortcut Grid를 임의 추가하지 않는다.
- UI 변경과 기능 변경을 분리하고, 기능 변경이 필요하면 먼저 이유를 설명한다.

진행 순서:
1. Home 화면을 먼저 구현하고 확인한다.
2. Records
3. Schedule
4. Pets Hub
5. Pet Detail / Forms / Sheets
6. typecheck, lint, test 실행

각 단계 후 수정 파일과 확인 결과를 간단히 보고해줘. 작업을 끝내기 전에 실제 데이터 상태, Empty State, 한 마리/여러 마리 상태, 작은 화면 레이아웃을 확인해줘.
```
