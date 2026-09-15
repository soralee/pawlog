---
author: soralee
decided: 2026-09-15 10:30
---
# 건강 기록 테이블 분리 기준

Vaccination(예방접종)과 Checkup(건강검진)은 성격이 달라(주기·항목·다음 예정일 계산 방식이 다름) 하나의 `health_records` 테이블에 `type` 컬럼으로 묶지 않고 **각각 전용 테이블**(`vaccinations`, `checkups`)로 분리한다. `type` 통합 방식은 처음엔 단순해 보이지만 종류별 필드(백신명, 검진 항목, 복용량 등)가 늘면서 nullable 컬럼이나 JSON 의존이 커져 기각했다. `health_records`는 이 전용 테이블들의 상위 개념이 아니라 증상/진단/치료/기타 메모를 담는 **독립적인 범용 건강 기록 테이블**로 둔다. 홈 화면의 "최근 건강 기록" 타임라인은 여러 테이블을 Repository/service 레이어에서 조합해 보여준다.
