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
- 여러 반려동물 등록 및 개별 관리
- 각 건강 기록/일정/비용/체중 데이터는 반드시 하나의 Pet에 귀속
- 전체 보기와 Pet별 보기 지원

생년월일을 모르는 경우 입력을 강제하지 않는다.

### Health Records

일반적인 건강 사건을 기록한다.

예:

- 증상
- 진단/치료 내용
- 건강 메모

예방접종, 건강검진, 복약, 체중, 병원비처럼 구조화할 가치가 있는 데이터는 별도 도메인으로 관리한다.

### Vaccinations

예방접종은 `완료 기록`과 `예정 일정`의 의미를 구분한다.

완료 기록:
- 예방접종 이름
- 실제 접종일
- 병원(선택)
- 메모

예정 일정:
- 예방접종 이름
- 예정일
- 알림
- 상태(예정/지난 일정)

미래 예정일은 완료 기록으로 취급하지 않는다.

### Checkups

건강검진도 `완료 기록`과 `예정 일정`의 의미를 구분한다.

완료 기록:
- 건강검진 종류
- 실제 검진일
- 병원
- 메모

예정 일정:
- 건강검진 종류
- 예정일
- 알림
- 상태(예정/지난 일정)

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

등록된 모든 반려동물의 현재 상태와 가까운 일정을 한눈에 요약한다. 한 마리만 등록된 경우 불필요한 전체/개별 구분은 숨긴다.

### Records

모든 반려동물의 과거 기록을 통합해서 보거나 특정 Pet으로 필터링해 확인한다. 전체 보기에서는 각 Row에 Pet 이름/사진을 표시해 누구의 기록인지 명확히 한다.

### Schedule

모든 반려동물의 앞으로의 일정을 통합해서 보거나 특정 Pet으로 필터링한다. 전체 보기에서는 일정마다 대상 Pet을 명확히 표시한다.

### Pets

등록된 반려동물 전체를 관리하는 Profile Hub다. 여러 Pet을 등록/추가할 수 있고 각 Pet을 선택하면 해당 Pet의 예방접종, 건강검진, 복약, 체중, 병원비와 건강 기록을 개별적으로 추적한다.

> **Home은 모든 아이의 현재를 요약하고, Records는 전체 또는 아이별 과거를 찾고, Schedule은 전체 또는 아이별 미래를 확인하며, Pets는 각 아이의 건강 이력을 개별 관리한다.**

---

## 5. Multi-pet Experience & Home Dashboard

Pawlog의 Multi-pet 지원은 부가 기능이 아니라 MVP의 기본 동작이다.

### Multi-pet Rules

- 사용자는 Pet을 여러 마리 등록할 수 있다.
- 모든 건강 데이터는 반드시 `petId`를 가진다.
- Home은 특정 `selectedPetId`에 종속되지 않고 등록된 모든 Pet을 Aggregate한다.
- Records/Schedule은 기본 `전체` 보기와 Pet별 Filter를 제공한다.
- Pet Detail에서 진입한 Domain 화면은 해당 Pet으로 Scope한다.
- 새 기록/일정 생성 시 대상 Pet이 반드시 명확해야 한다.
- Pet이 1마리뿐이면 불필요한 Pet Filter와 중복 Breakdown을 숨긴다.

### Home 표시 순서

1. My Pets Summary
2. Upcoming Schedule
3. Today Medication
4. Monthly Expense
5. Recent Records

### My Pets Summary

등록된 Pet을 가로 목록 또는 компакт한 Summary Card로 보여준다.

각 Pet:

- 사진
- 이름
- 나이/종류
- 가장 가까운 중요 일정 또는 오늘 할 일

Pet을 누르면 해당 Pet Detail로 이동한다.

### Upcoming Schedule

모든 Pet의 미완료 일정을 합쳐 가까운 순으로 보여준다.

각 항목에 Pet 사진 또는 이름을 반드시 표시한다.

### Today Medication

모든 Pet의 오늘 복약 일정을 합쳐 보여준다. 각 항목의 대상 Pet을 표시한다.

### Monthly Expense

이번 달 전체 병원비 총액을 우선 보여준다.

Pet이 여러 마리일 경우 Pet별 금액 Breakdown을 함께 보여줄 수 있다. 한 마리일 경우 동일한 Breakdown을 반복하지 않는다.

MVP에서는 Chart를 사용하지 않는다.

### Recent Records

모든 Pet의 최근 기록 3~5개를 통합 Timeline/List로 보여준다.

각 Row에 Pet 이름 또는 작은 Photo를 표시한다.

Home에 Shortcut Grid를 추가하지 않는다.

---

## 6. Records & Schedule Domain Rules

Pawlog에서 **기록과 일정은 날짜가 아니라 실제 수행 여부로 구분한다.**

> **Records = 실제로 일어난 일**  
> **Schedule = 아직 해야 하는 일**

이 규칙은 예방접종과 건강검진에서 특히 중요하다.

### 6.1 Vaccination

#### 일정에서 추가

사용자가 일정 탭에서 미래 예방접종을 등록하면 아직 수행하지 않은 일이므로 **Schedule에만 표시**한다.

예:

```text
보리 · 종합백신
예정일 2026.10.20
상태: 예정
```

이 데이터는 접종을 완료하기 전까지 Records의 완료 기록으로 노출하지 않는다.

#### 기록에서 추가

Records의 예방접종 추가는 **이미 실제로 접종한 사실을 기록하는 기능**이다.

- 접종일은 실제 수행일
- 미래 날짜를 완료 기록으로 저장하지 않는다.
- 미래 접종을 입력하려는 경우 일정 탭에서 등록하도록 안내한다.

#### 일정 완료

예방접종 일정에서 `완료`를 선택하면:

1. 실제 접종일을 확인한다.
2. 필요하면 병원/메모 등 실제 수행 정보를 입력한다.
3. 완료된 예방접종 기록으로 저장한다.
4. 해당 항목은 Upcoming Schedule에서 제거된다.
5. Records의 예방접종 기록에 노출된다.

예정일이 지났다는 이유만으로 자동 완료하지 않는다.

### 6.2 Checkup

건강검진도 예방접종과 동일한 원칙을 적용한다.

- 예정된 검진 → Schedule
- 실제 완료한 검진 → Records
- 일정 완료 → 실제 검진일 확인 → Records에 반영
- 예정일 경과만으로 자동 완료하지 않음
- 지난 미완료 일정은 Schedule에서 `지난 일정` 상태로 유지

### 6.3 Medication

복약은 예방접종/검진처럼 매 회차를 Records로 전환하지 않는다.

Medication 자체가 기간과 반복 규칙을 가진 **복약 계획**이다.

- 활성 Medication → Schedule/Home의 오늘의 복약에 필요한 Instance 표시
- 반복 일정은 날짜별 DB Row를 대량 생성하지 않음
- 종료된 Medication → 복약 관리의 종료 목록에서 확인
- MVP에서는 매 복용 회차별 `복용 완료 기록`을 건강 기록 Timeline에 생성하지 않음

### 6.4 Health / Weight / Expense

다음은 기본적으로 **이미 발생한 사실을 기록**하는 도메인이다.

- Health Record
- Weight Record
- Hospital Expense

따라서 Records/Pet Detail에서 관리하며 Schedule 대상이 아니다.

### 6.5 Past-due Schedule

예정일이 지났지만 완료하지 않은 예방접종/검진은 기록으로 자동 이동하지 않는다.

```text
예정 → 날짜 경과 → 지난 일정
                 ↓
             사용자가 완료
                 ↓
               기록
```

Schedule에서는 지난 일정을 사용자가 놓치지 않도록 구분해 보여준다.

### 6.6 Creation Entry Points

```text
Records > 기록 추가
  건강 기록
  예방접종 기록
  건강검진 기록
  체중 기록
  병원비 기록

Schedule > 일정 추가
  예방접종 일정
  건강검진 일정
  복약 일정
```

동일한 `예방접종 추가`라는 모호한 문구 대신 Context에 따라 `예방접종 기록` / `예방접종 일정`처럼 의미를 구분한다.

### 6.7 Visibility Matrix

| Domain | Records | Schedule | Home Upcoming | Home Recent |
| --- | --- | --- | --- | --- |
| 건강 기록 | 완료/발생 기록 | - | - | O |
| 예방접종 | 완료한 접종 | 미완료/지난 일정 | O | 완료 후 O |
| 건강검진 | 완료한 검진 | 미완료/지난 일정 | O | 완료 후 O |
| 복약 | 매 회차 기록하지 않음 | 활성 복약 계획 | 오늘 일정 O | 기본 제외 |
| 체중 | 측정 기록 | - | - | O |
| 병원비 | 발생 비용 | - | - | 필요 시 O |

---

## 7. Data Domains

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

## 8. Technical Direction

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

- selectedPetId (Pet Detail/기록 생성 등 명시적인 개별 Pet Context에만 사용)
- recordsPetFilter / schedulePetFilter 같은 일시적 UI Filter가 필요한 경우
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

## 9. Project Structure

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

## 10. Development Phases

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
- Multi-pet registration
- Pet profile/detail
- Pet-scoped health navigation

### Phase 2 — Records

- General health record
- Vaccination
- Checkup
- Weight
- Unified Records list
- All/Pet-specific Records filtering

### Phase 3 — Medication & Reminder

- Medication
- Schedule
- All/Pet-specific Schedule filtering
- Local Notification
- Notification edit/delete synchronization

### Phase 4 — Expense & Home

- Hospital expense
- Monthly expense summary
- Multi-pet Home dashboard
- Aggregated upcoming schedule / medication / expenses
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

## 11. Notification Permission

앱 최초 실행 시 Notification Permission을 바로 요청하지 않는다.

사용자가 처음으로 알림이 필요한 일정을 등록하는 시점에:

1. Pawlog 안에서 알림이 필요한 이유를 설명
2. 사용자가 계속 진행
3. OS Permission Dialog 표시

Contextual Permission Request를 기본으로 한다.

---

## 12. Future Scope

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

## 13. Monetization Direction

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

## 14. Product Identity

```text
Technical name: pawlog
App name: Pawlog
Slug: pawlog
Scheme: pawlog
iOS Bundle ID: com.soralee.pawlog
Android Package: com.soralee.pawlog
```

---

## 15. MVP Success Criteria

Pawlog MVP는 다음 흐름이 안정적으로 동작하면 성공으로 본다.

- Pet을 여러 마리 등록하고 각각 개별 관리할 수 있다.
- 건강 관련 기록을 남길 수 있다.
- 예방접종/검진/복약 일정을 등록할 수 있다.
- 모든 Pet의 앞으로 해야 할 일을 Home에서 통합 확인하고 Schedule에서 전체/Pet별로 확인할 수 있다.
- 필요한 일정에 Local Notification을 받을 수 있다.
- 과거 기록을 Records에서 전체/Pet별로 찾을 수 있다.
- 병원비와 체중을 기록할 수 있다.
- 앱을 종료하고 다시 실행해도 SQLite 데이터가 유지된다.
- 서버/로그인 없이 핵심 경험이 완결된다.

출시를 막지 않는 부가 기능은 MVP 이후로 미룬다.
