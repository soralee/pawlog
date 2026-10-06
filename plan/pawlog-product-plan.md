# Pawlog Product Plan

## 1. Product Overview

**Pawlog**는 반려동물의 건강 기록과 앞으로 해야 할 건강 일정을 한곳에서 관리하는 개인 건강수첩 앱이다.

> **건강 기록과 앞으로 해야 할 일을 한곳에서 본다.**

반려동물 보호자가 예방접종, 건강검진, 복약, 병원비, 체중과 일반 건강 기록을 여러 메모나 앱에 흩어두지 않고 하나의 흐름으로 관리할 수 있도록 한다.

### Product Principles

1. 기록과 일정 관리가 가장 중요하다.
2. 서버 없이도 핵심 기능이 완결되어야 한다.
3. AI를 사용하기 위해 AI 기능을 추가하지 않는다.
4. 의료 진단 앱을 만들지 않는다.
5. 혼자서 유지보수할 수 있는 구조를 유지한다.
6. 기능 확장보다 출시를 우선한다.
7. Dependency는 실제 필요해질 때 추가한다.

---

## 2. Target User

### Primary

강아지 또는 고양이를 키우며 다음 정보를 체계적으로 관리하고 싶은 보호자.

- 예방접종 날짜를 기억하기 어렵다.
- 건강검진 시기를 놓치고 싶지 않다.
- 약이나 영양제 복용 일정을 관리하고 싶다.
- 병원 진료 기록을 한곳에 남기고 싶다.
- 체중 변화를 기록하고 싶다.
- 한 달에 병원비를 얼마나 사용했는지 보고 싶다.

### Core Scenario

1. 반려동물을 등록한다.
2. 예방접종 또는 건강검진 일정을 등록한다.
3. Home에서 다음 일정을 확인한다.
4. 알림을 받고 일정을 수행한다.
5. 건강 기록이나 비용을 남긴다.
6. Records에서 과거 기록을 다시 확인한다.

---

## 3. MVP Scope

### Pet

- 반려동물 등록
- 이름
- 종류(강아지/고양이)
- 생년월일
- 성별
- 사진
- 나이 자동 계산
- 프로필 수정
- 여러 반려동물 등록 및 전환

생년월일을 모르는 경우 입력을 강제하지 않는다.

### Health Records

일반적인 건강 사건을 기록한다.

예:

- 증상
- 진단/치료 내용
- 건강 메모

예방접종, 건강검진, 복약, 체중, 병원비처럼 구조화할 가치가 있는 데이터는 별도 도메인으로 관리한다.

### Vaccinations

- 예방접종 이름
- 접종일
- 다음 예정일
- 메모
- 완료 상태

### Checkups

- 건강검진 종류
- 검진일
- 다음 예정일
- 병원
- 메모
- 완료 상태

### Medications

- 약/영양제 이름
- 복용 시작일
- 종료일
- 복용 시간
- 반복 정보
- 메모
- 활성/종료 상태

반복 복약은 날짜별 Row를 대량 생성하지 않고 반복 규칙으로 관리한다.

### Hospital Expenses

- 날짜
- 병원
- 금액
- 메모

Home에서는 이번 달 병원비 총액을 간단하게 보여준다.

### Weight

- 측정일
- 체중
- 메모

데이터가 충분해지면 간단한 추이 Chart를 제공한다.

### Schedule & Reminder

일정 대상:

- 예방접종
- 건강검진
- 복약

사용자가 알림이 필요한 일정을 만들 때 Local Notification을 예약한다.

Notification 수정:

1. 기존 OS Notification 취소
2. 새로운 Notification 예약
3. 새 Notification ID 저장

Notification 삭제 시에도 예약된 OS Notification을 함께 취소한다.

---

## 4. Navigation

Bottom Tabs:

- 홈
- 기록
- 일정
- 내 반려동물

등록/수정/상세 화면은 Bottom Tab이 아니라 Stack 또는 Modal로 연다.

### Home

지금 알아야 할 정보를 보여준다.

### Records

이미 일어난 일을 찾고 확인한다.

### Schedule

앞으로 해야 할 일을 확인한다.

### Pets

반려동물 자체의 프로필과 데이터를 관리한다.

> **Home에서는 지금 알아야 할 것을 보여주고, Records에서는 지나간 일을 찾고, Schedule에서는 앞으로 할 일을 확인하며, Pets에서는 우리 아이 자체를 관리한다.**

---

## 5. Home Dashboard

표시 순서:

1. Pet Hero
2. Next Schedule
3. Today Medication
4. Monthly Expense
5. Recent Records

### Pet Hero

- 사진
- 이름
- 나이
- 기본 프로필 정보

### Next Schedule

가장 가까운 미완료 일정 하나를 우선 보여준다.

필요한 경우 전체 일정으로 이동할 수 있다.

### Today Medication

오늘 복용해야 할 약/영양제를 보여준다.

### Monthly Expense

이번 달 병원비 총액을 보여준다.

MVP에서는 Chart를 사용하지 않는다.

### Recent Records

최근 기록 3~5개를 Timeline/List 형태로 보여준다.

Home에 Shortcut Grid를 추가하지 않는다.

---

## 6. Data Domains

SQLite Source of Truth:

```text
pets
health_records
vaccinations
checkups
medications
hospital_expenses
weight_records
reminders
```

총 8개 도메인을 기본으로 한다.

### Domain Rule

`health_records`는 다른 건강 데이터의 Parent Table이 아니다.

예방접종, 건강검진, 복약, 병원비, 체중은 각각 독립된 구조화 데이터로 관리한다.

통합 Timeline이 필요할 경우 Repository/Service/UI 계층에서 각 데이터를 합성한다.

---

## 7. Technical Direction

### Core Stack

- React Native
- Expo SDK 57
- React Native 0.86
- React 19.2.3
- TypeScript strict
- Expo Router
- expo-sqlite
- Zustand
- React Hook Form
- Zod
- @hookform/resolvers
- date-fns
- expo-notifications
- StyleSheet
- Jest
- jest-expo
- React Native Testing Library
- ESLint Flat Config
- Prettier
- pnpm
- EAS

### State

SQLite가 Persistent Data의 Source of Truth다.

Zustand는 다음과 같은 UI/App State만 관리한다.

- selectedPetId
- onboarding 상태
- theme 등

SQLite 데이터를 Zustand에 다시 Cache하지 않는다.

### Add Only When Needed

- expo-image-picker
- expo-file-system
- react-native-gifted-charts
- DateTime Picker
- expo-dev-client

### Explicitly Excluded From MVP

- Backend
- Firebase
- Supabase
- Login
- AI
- Remote Push
- Redux
- TanStack Query
- GraphQL
- Drizzle
- NativeWind
- Web Target
- In-App Purchase
- PDF Export
- Advanced Statistics

---

## 8. Project Structure

초기 구조:

```text
app/
├── _layout.tsx
└── (tabs)/
    ├── _layout.tsx
    ├── index.tsx
    ├── records.tsx
    ├── schedule.tsx
    └── pets.tsx

src/
├── components/
├── db/
│   ├── database.ts
│   ├── migrations/
│   └── repositories/
├── features/
├── stores/
│   └── app.store.ts
├── theme/
│   └── tokens.ts
├── utils/
│   └── date.ts
├── constants/
└── types/
```

초기 단계에서 아직 사용하지 않는 Feature Directory를 모두 미리 만들지 않는다.

---

## 9. Development Phases

### Phase 0 — Setup

- Expo project
- Router
- TypeScript
- Lint/Format
- Test environment
- Theme tokens
- SQLiteProvider + onInit skeleton

### Phase 1 — Pet

- SQLite schema/migration 기반 마련
- Pet registration
- Pet profile
- Pet edit
- Pet selection

### Phase 2 — Records

- General health record
- Vaccination
- Checkup
- Weight
- Unified Records list

### Phase 3 — Medication & Reminder

- Medication
- Schedule
- Local Notification
- Notification edit/delete synchronization

### Phase 4 — Expense & Home

- Hospital expense
- Monthly expense summary
- Home dashboard
- Recent records

### Phase 5 — Photo & Weight Chart

실제 필요 시 관련 Dependency를 추가한다.

### Phase 6 — Release

- Empty/Error/Loading state 확인
- Notification permission flow 확인
- EAS build
- Store metadata
- Test build
- Release

---

## 10. Notification Permission

앱 최초 실행 시 Notification Permission을 바로 요청하지 않는다.

사용자가 처음으로 알림이 필요한 일정을 등록하는 시점에:

1. Pawlog 안에서 알림이 필요한 이유를 설명
2. 사용자가 계속 진행
3. OS Permission Dialog 표시

Contextual Permission Request를 기본으로 한다.

---

## 11. Future Scope

MVP 출시 이후 검토한다.

- 반려동물 생애주기 가이드
- 응급상황 체크리스트
- 사진 첨부 확장
- Backup/Restore
- CSV/PDF Export
- Advanced Statistics
- Pro 기능

MVP 구현 중에는 Future Scope를 선행 구현하지 않는다.

---

## 12. Monetization Direction

MVP에서는 수익화를 구현하지 않는다.

향후에는 Subscription보다 **One-time Pro Upgrade**를 우선 검토한다.

후보:

- 고급 Multi-pet 기능
- Export
- 사진 기능 확장
- 고급 통계
- Backup

가격과 구체적인 유료 범위는 출시 후 결정한다.

---

## 13. Product Identity

```text
Technical name: pawlog
App name: Pawlog
Slug: pawlog
Scheme: pawlog
iOS Bundle ID: com.soralee.pawlog
Android Package: com.soralee.pawlog
```

---

## 14. MVP Success Criteria

Pawlog MVP는 다음 흐름이 안정적으로 동작하면 성공으로 본다.

- Pet을 등록할 수 있다.
- 건강 관련 기록을 남길 수 있다.
- 예방접종/검진/복약 일정을 등록할 수 있다.
- 앞으로 해야 할 일을 Home과 Schedule에서 확인할 수 있다.
- 필요한 일정에 Local Notification을 받을 수 있다.
- 과거 기록을 Records에서 찾을 수 있다.
- 병원비와 체중을 기록할 수 있다.
- 앱을 종료하고 다시 실행해도 SQLite 데이터가 유지된다.
- 서버/로그인 없이 핵심 경험이 완결된다.

출시를 막지 않는 부가 기능은 MVP 이후로 미룬다.
