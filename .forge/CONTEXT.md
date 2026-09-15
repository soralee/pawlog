# Pawlog

반려동물(현재는 강아지/고양이 1마리 이상)의 건강 기록과 앞으로 해야 할 일을 한곳에서 보여주는 로컬-온리 앱. 서버·로그인·AI 없이 기기 내 SQLite만으로 가치가 성립한다.

## Language

**Pet**:
앱에 등록된 반려동물 한 마리. 이름/생일/종/성별/사진을 가지며, 아래 모든 기록·일정 테이블은 `petId`로 이 엔티티에 매달린다.

**Health Record**:
예방접종/건강검진/복약/체중처럼 구조화된 전용 테이블에 속하지 않는 **범용 건강 기록**(증상, 질병/진단, 치료, 기타 메모). 다른 도메인 기록들의 부모 테이블이 아니라 독립적인 테이블이다.
_Avoid_: 모든 건강 데이터를 아우르는 상위 개념으로 쓰지 말 것 — Vaccination/Checkup/Medication/Weight Record와는 별개의 병렬 테이블이다.

**Vaccination**:
예방접종 1회 기록. 접종일과 다음 예정일(D-day 계산용)을 가진다. Checkup과는 별도 테이블.

**Checkup**:
건강검진 1회 기록. 검진일과 다음 예정일을 가진다. Vaccination과 성격이 달라(주기·항목 상이) 별도 테이블로 둔다.
_Avoid_: Vaccination과 통합해서 `health_records.type`으로 구분하는 방식 — 종류별 필드(백신명, 검진 항목 등)가 늘면서 nullable 컬럼/JSON 의존이 커져 채택하지 않는다.

**Medication**:
복약 일정 및 기록(예: 영양제 매일 21:00). Reminder를 통해 로컬 알림과 연결된다.

**Hospital Expense**:
병원 방문 1회당 발생한 비용 기록. 홈 화면의 "이번 달 병원비" 합계 계산에 쓰인다.

**Weight Record**:
체중 측정 1회 기록. 그래프 및 "최근 N개월 변화량" 계산에 쓰인다.

**Reminder**:
Vaccination/Checkup/Medication 등 다른 테이블의 일정을 OS 로컬 알림(`expo-notifications`)과 연결하는 테이블. `sourceType`/`sourceId`로 원본 레코드를 가리키고 `notificationId`로 예약된 OS 알림을 추적한다 — 화면에서 알림 API를 직접 호출하지 않고 항상 이 테이블을 거친다.
_Avoid_: 화면 컴포넌트에서 `scheduleNotificationAsync()` 직접 호출.
