# QA 시안 대조 보고서 (qa-visual-compare)

- 작성일: 2026-11-09 (2차 갱신 — Maestro로 전 화면 캡처 완료)
- 대상: 미커밋 코랄 시안 구현 (`plan/coral-gap-work-plan.md` Phase 1~4)
- 시안: `plan/reference/pawlog-design-v1-abc.png` 중 **A. 따뜻한 코랄** 열 (이미지를 직접 열어 캡처와 대조)
- 환경: iOS 시뮬레이터 iPhone 16e (7FA15BAF-…, iOS 26.0), dev client `com.soralee.pawlog`, 기존 Metro(`expo run:ios`) 사용, 오늘 = 2026-11-09 13시대(KST)
- 코드/기존 문서는 수정하지 않았다. 산출물은 이 문서와 `plan/reference/captures/*.png`뿐이다.
- 1차 보고의 블로커(`openurl` 시스템 확인창)는 Maestro로 확인창을 닫고, 이후 화면 이동은 탭바/목록 탭으로 해결했다. 이전의 가려진 캡처(`home-single`, `home-multi`)는 교체했다. `_evidence-openurl-dialog.png`만 증빙으로 남겼다.

## 0. 결론 요약

| 구분 | 개수 |
|---|---:|
| 체크리스트 통과 | **18** |
| 체크리스트 실패 | **0** |
| 체크리스트 판단 불가 | **0** |
| 체크리스트 외 확정 결함 | 4 (D1~D4) |
| 확인 필요(정책/의도) | 4 (N1~N4) |

1차의 "판단 불가" 10건은 전부 통과로 확정했다. 시안 대비 눈에 띄는 실패는 없다. 다만 **로직·정책 불일치**가 있다. 주요한 것은 아래 3건이다.

1. **D1 복약 시간 표기 불일치**: 홈 Pet Hero "오늘 복약 06:00"(이미 지난 시각)과 복약 화면 "다음 복약은 오후 7:00"이 서로 다르다.
2. **D2 복약 목록 정렬**: 홈, 일정, 복약 화면의 목록이 시간순이 아니다(저녁 7시 → 아침 6시 → 밤 9시).
3. **N1 지난 일정이 "다음 일정"으로 노출**: 홈 다음 일정(3개 한도), 내 반려동물 카드("다음 일정 · … 5일 지남"), 접종 index 상단 카드("다음 예방접종")에서 미완료 지난 일정이 다음 일정 자리를 차지한다.

## 1. 샘플 데이터와 DB 복원

- 앱 DB: `<data container>/Documents/SQLite/pawlog.db` (WAL/SHM 없음). 작업 전 앱 `terminate` 후 백업: `/tmp/pawlog-qa-backup/pawlog.db` (SHA1 `149d73f1bf6242d00e73374783a59f2030f39f1f`).
- 시드: `/tmp/pawlog-qa-seed/{single,multi}.db`.
  - **single**: 보리(고양이, 2018-07-30). 접종 D-5·D-20·D-60과 지난 일정 5일 지남(코로나 장염). 검진 D-6·D-41. 완료 접종·검진 기록. 복약 4종(오늘 3, 종료 1). 체중 2건. 병원비(이번 달 125,000원, 지난달 54,000원). 건강 기록 1건.
  - **multi**: single + 두리(강아지, 접종 D-3, 복약 1) + 나비(생년월일·성별 미입력).
  - **empty**: DB 삭제 후 앱이 마이그레이션으로 재생성(1차에 캡처).
- **복원 완료**: 앱 종료 후 원본으로 교체. `shasum` 일치(`149d73f1bf6242d00e73374783a59f2030f39f1f`). 행 수는 pets 1, checkups 1, medications 2, 나머지 테이블 0으로 원본과 같다. 앱은 종료 상태.
- Maestro flow, 시드, 스크립트는 `/tmp/pawlog-qa-seed`에 있다(레포 미포함).

## 2. 체크리스트 대조 (`coral-gap-work-plan.md` Phase 5)

범례: ✅ 통과 / ❌ 실패 / ⏸ 판단 불가

### Home — 인사·Pet

| # | 항목 | 결과 | 근거 | 비고 |
|---|---|---|---|---|
| H1 | 인사 두 줄 + 종 아이콘 | ✅ | `home-single.png`, `home-multi.png` | "안녕하세요, 보리 보호자님 / 오늘도 좋은 하루예요! 🧡"와 우측 bell. 시안과 같은 구성. 다중은 `두리·나비·보리 보호자님`(시안에 없는 다중 확장) |
| H2 | 단일 Pet Hero (Primary Light 배경, 이름 Bold, `나이 · 품종 >`) | ✅ | `home-single.png` | 연한 코랄 밴드, "보리", "8살 3개월 · 고양이 >". 시안과 동일한 위계 |
| H3 | Hero 사진 96pt 원형 | ✅ (placeholder 기준) | `home-single.png` | 사진 파일은 주입하지 않아 paw placeholder만 확인. `AvatarSize.hero = 96`이고 Hero 밴드 높이 128pt(= 96 + 패딩 32)로 일치(Maestro hierarchy). 실제 사진 crop은 미검증 |
| H4 | 다중 Pet 가로 카드 | ✅ | `home-multi.png`, `pets-multi.png` | "우리 아이들 / + 추가", 가로 스크롤 카드(아바타 64pt). 나비(나이 미입력)는 "고양이"만 표기되어 나이 미표기 분기 정상 |
| H5 | 빈 상태 + 등록 CTA | ✅ | `home-empty.png` | 스펙 문구와 코랄 `반려동물 등록하기` 버튼 일치 |

### Home — 일정·복약·병원비·기록

| # | 항목 | 결과 | 근거 | 비고 |
|---|---|---|---|---|
| H6 | 다음 일정 카드 (아이콘 타일/날짜/D-day) | ✅ | `home-single.png`, `home-multi.png` | 40pt 타일(접종 info `medkit`, 검진 success `heart`), `2026년 11월 14일 (토)` 포맷, 우측 칩. 3개 한도 유지(결정 8) |
| H7 | D-day 의미색 (0~7 Warning / 8~30 Coral / 31+ Info) | ✅ | `schedule.png`, `schedule-scroll.png` | D-5·D-6 Warning, D-20 Coral, D-41·D-60 Info, 지난 일정 Warning. 스펙 §2.14 색과 일치 |
| H8 | 오늘 복약 아이콘·시간 | ✅ | `home-single-mid.png` | warning 타일의 `medical-outline`, `[보리] 저녁 약 / 오후 7:00` 형식. 정렬은 D2 참고 |
| H9 | 이번 달 병원비 큰 숫자 + 막대 아이콘 | ✅ | `home-single-mid.png`, `home-single-bottom.png` | "이번 달 병원비 / 125,000원"(28 Bold), 우측 코랄 막대 아이콘 타일. 다중에서는 펫별 내역이 추가됨(`home-multi-bottom.png`) |
| H10 | 최근 기록 날짜/제목/보조 정보 | ✅ | `home-single-bottom.png` | 좌측 `11.07`, 제목 `[보리] 약 처방`, 보조 `해맑은동물병원`. 병원비 포함(§6.7), 5건 |

### Schedule

| # | 항목 | 결과 | 근거 | 비고 |
|---|---|---|---|---|
| S1 | 제목 + 코랄 원형 `+` | ✅ | `schedule.png` | 코랄 채움 원형 + 흰색 `+`, 약 44pt |
| S2 | 필터 선택 상태 | ✅ | `schedule-filter-vaccination.png`, `schedule-filter-medication.png` | 선택: 코랄 채움·흰 글씨. 비선택: 흰 배경·회색 테두리. 선택에 맞춰 목록이 바뀜 |
| S3 | 카드형 행·색 아이콘 타일·날짜/반복 문구·D-day 칩 | ✅ | `schedule.png`, `schedule-scroll.png` | 접종·검진은 `날짜 + D-day 칩`, 복약은 `매일 · 오후 7:00` + chevron. 시안과 같은 구성 |
| S4 | D-day 의미색, 미완료 지난 일정 Warning `N일 지남` | ✅ | `schedule-scroll.png` | `지난 일정`(Warning 제목)에 `2026년 11월 4일 (수) · 5일 지남`(Warning)과 `완료하기` Secondary 버튼 |
| S5 | 완료 일정 행 미표시 (결정 9, 의도된 차이) | ✅ | `schedule*.png` | 시드의 완료 접종·검진은 일정 탭에 없음. 완료 접종·검진은 기록 탭에서 확인(`records-scroll.png`) |

### 공통

| # | 항목 | 결과 | 근거 | 비고 |
|---|---|---|---|---|
| C1 | Secondary 버튼 (연한 코랄 배경·코랄 글씨·테두리) | ✅ | `schedule-scroll.png`, `confirm-dialog-delete.png` | `완료하기`, 확인창 `취소`가 스펙 §2.7 그대로 |
| C2 | 카드 은은한 그림자 | ✅ | `home-single.png`, `weight-index.png` | 흰 카드에 1pt 테두리와 옅은 그림자. 시안과 유사 |
| C3 | 탭 Active Coral | ✅ | 모든 탭 캡처 | 활성 탭 코랄, 비활성 회색 |

## 3. 체크리스트 외 화면 대조 (Phase 4 블루프린트)

| 화면 | 결과 | 근거 | 비고 |
|---|---|---|---|
| 기록 탭 | ✅ | `records.png`, `records-scroll.png` | 코랄 `+`, 필터 칩, 월 구분, 제목·`날짜 · 병원 · 설명`·chevron. 병원비 포함 |
| 기록 타입 시트 | ✅ | `records-add-sheet.png` | grabber, 제목, 복약 포함 6항목, 도메인별 아이콘 6종, chevron(4.7, 3.3) |
| 내 반려동물 탭 | ✅ | `pets.png`, `pets-multi.png` | 64pt 아바타 카드, 이름·나이·품종, 코랄 `+`. 나이 미입력은 생략 |
| 펫 상세 | ✅ | `pet-detail.png`, `pet-detail-scroll.png` | 아바타 112pt(결정 8), 건강 관리 6개 메뉴의 아이콘이 서로 다름(4.11), 하단 삭제 |
| 복약 index | ✅ | `medication-index.png` | 오늘 Summary 카드, `복용 중 3`, 흰 카드, 종료 기간 `09.01 - 09.07`, 하단 CTA. 목록 정렬은 D2 |
| 체중 index | ✅ | `weight-index.png` | `현재 체중 4.3kg`(28 Bold), 날짜 포맷, 좌 날짜·우 값 정렬, 하단 CTA. 차트 축은 D3 |
| 병원비 index | ✅ | `hospital-expense-index.png` | `이번 달 병원비 125,000원`과 `11월`, 좌 날짜·병원/내용·우 금액 정렬, 하단 CTA |
| 접종·검진·건강기록 index | ✅ | `vaccination-index.png`, `checkup-index.png`, `health-record-index.png` | 하단 Full-width CTA, 접종·검진은 시트로 연결(`vaccination-add-sheet.png`) |
| 기록 상세 3종 | ✅ | `weight-record-detail.png`, `hospital-expense-record-detail.png`, `vaccination-record-detail.png` | 날짜 → 제목 → Label/Value(병원·메모) → 구분선 → 하단 Danger 텍스트 삭제(4.6) |
| 일정 상세(지난 일정) | ✅ | `vaccination-detail-overdue.png` | 날짜 → 제목 + `5일 지남` 칩 → `완료하기`, 하단 `일정 삭제` |
| 펫 등록 폼 | ✅ | `pet-new-form.png` | `종류`·`성별` 라벨, `생년월일 (선택)`·`성별 (선택)`, 사진 96pt, `등록하기` |
| Pet Switch Sheet | ✅ (선택 ✓ 미확인) | `schedule-pet-switch-sheet.png` | `반려동물 선택`, 48pt 아바타, `+ 반려동물 추가`. 선택 중인 펫이 없는 흐름이라 ✓ 표시는 확인할 수 없음 |
| 일정 탭(다중 펫) | ✅ | `schedule-multi.png` | 펫 필터 칩 + 유형 필터 칩 2줄 |

## 4. 체크리스트 외 확정 결함

| # | 내용 | 기대 | 실제 | 근거 | 제안 담당 |
|---|---|---|---|---|---|
| D1 | 복약 "다음 시각" 표기 불일치 | 같은 시점의 "오늘 복약"은 화면마다 같은 기준을 써야 함 | 홈 Hero(및 다중 카드)는 오늘 가장 이른 시간 `오늘 복약 06:00`(13시 기준 이미 지남)인데, 복약 화면은 `다음 복약은 오후 7:00이에요.` | `home-single.png`, `medication-index.png`; `build-home-dashboard.ts` `actionLabelFor` | domain |
| D2 | 오늘 복약 목록 정렬 | 시간 오름차순(오전 6:00 → 오후 7:00 → 오후 9:00) 또는 최소한 화면 간 동일 | 홈·일정·복약 화면 모두 `저녁 약 19:00 → 아침 약 06:00 → 영양제 21:00`. 복약 repo가 `ORDER BY start_date DESC`로 가져오고 화면에서 시간 정렬이 없음 | `home-single-mid.png`, `schedule.png`, `medication-index.png`; `medication.repository.ts:102`, `build-home-dashboard.ts` `todayMedications` | domain |
| D3 | 체중 차트 가독성 | 축 라벨이 잘리지 않고 토큰 색을 따름 | y축 라벨이 소수 4자리(`3.3116…`)로 잘리고 0부터 시작해 점이 위쪽에 몰림. 점은 검정(기본값) | `weight-index.png` | screens / design |
| D4 | 삭제 확인 문구 조사 | `나비를 삭제할까요?` | `나비을(를) 삭제할까요?` | `confirm-dialog-delete.png`; `pets/[petId]/index.tsx:194` | screens |

## 5. 확인 필요 (정책/의도)

| # | 내용 | 비고 | 제안 담당 |
|---|---|---|---|
| N1 | **미완료 지난 일정이 "다음 일정"으로 노출됨.** 홈 다음 일정(3개 한도에서 다가오는 일정 1개를 밀어냄), 내 반려동물 카드 `다음 일정 · 코로나 장염 5일 지남`, 접종 index `다음 예방접종 · 5일 지남` | 스펙은 지난 일정을 일정 탭 `지난 일정`에만 정의. "다음"의 정의에 지난 일정을 포함할지 결정 필요 (`aggregateSchedule`이 날짜 필터 없이 정렬만 함) | design(정책) → domain |
| N2 | Hero에 `오늘 복약 06:00` 코랄 라인이 추가됨 | 스펙 §2.17 Hero와 시안에는 없음. 의도 여부 확인(D1과 함께 처리) | design |
| N3 | 일정 탭 `오늘` 구획이 `오늘` 제목 아래 `오늘의 복약` 소제목으로 이중 표기됨 (`schedule.png`) | 4.10 "오늘 구획"의 의도 확인 | design |
| N4 | 접종 index 상단 Highlight 카드(Primary Light) 위 Warning 칩(`5일 지남`, `D-6`)이 같은 계열 배경이라 대비가 약함 (`vaccination-index.png`, `checkup-index.png`). 기록 타입 시트 아이콘은 전부 코랄인데 스펙 §2.11은 도메인별 색(info/success/warning) | 시각 미세 조정 | design |

참고
- 빈 상태 보조 문구 `먼저 "내 반려동물" 탭에서 등록해주세요`가 같은 화면의 CTA와 맞지 않는 점은 1차 N4와 같다(`home-empty.png`).
- Hero 아바타 placeholder가 Primary Light 밴드와 같은 색이라 원 경계가 거의 안 보인다(`home-single.png`, 1차 N5).
- 일부 캡처 우상단의 "Tools" 톱니 버튼은 dev client 오버레이이며 앱 UI가 아니다.
- 펫 사진을 넣은 상태, 키보드 표시 상태, 폼 입력 오류 상태, 삭제 실제 실행은 이번 범위에서 대조하지 않았다.

## 6. 캡처 파일 (`plan/reference/captures/`)

홈: `home-empty`, `home-single`, `home-single-mid`, `home-single-bottom`, `home-multi`, `home-multi-mid`, `home-multi-bottom`
일정: `schedule`, `schedule-scroll`, `schedule-filter-vaccination`, `schedule-filter-medication`, `schedule-multi`, `schedule-pet-switch-sheet`
기록·반려동물: `records`, `records-scroll`, `records-add-sheet`, `pets`, `pets-multi`
펫 상세·폼: `pet-detail`, `pet-detail-scroll`, `pet-new-form`, `confirm-dialog-delete`
index: `medication-index`, `medication-index-scroll`, `weight-index`, `hospital-expense-index`, `vaccination-index`, `checkup-index`, `health-record-index`, `vaccination-add-sheet`
상세: `weight-record-detail`, `hospital-expense-record-detail`, `vaccination-record-detail`, `vaccination-detail-overdue`
증빙: `_evidence-openurl-dialog`
