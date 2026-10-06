---
author: soralee
decided: 2026-09-18 11:31
---
# Primary 브랜드 색상을 Sage에서 Warm Coral로 전환 (Design Guide v2)

`design-guide.md`(v1)는 Sage(#65A986)를 Primary, Coral(#F47C6C)을 별도의 accent로 뒀지만, `pawlog-design-guide-v2.md`가 이를 대체하며 Coral을 Primary로, Green/Sage는 success 같은 semantic 용도로만 제한한다. v1의 "병원 시스템처럼 차갑게 보이지 않는 따뜻한 개인 건강수첩"이라는 목표를 Coral/Lavender 중심 팔레트로 더 강하게 표현하기 위한 재브랜딩 결정이며, 이미 구현된 Phase A(토큰/공용 컴포넌트)·B(기록 탭)·C(일정 탭)를 v2 팔레트로 소급 적용한다. `accent`/`accentLight` 토큰은 Coral이 Primary로 흡수되며 제거되고, `DDayChip`의 3단계(여유/가까움/임박) 색상 구분은 v2 문서에 맞춰 2단계(다가옴=Coral, 임박(≤3일)=Warning, 완료=Success)로 단순화한다. `design-guide.md`(v1) 파일은 삭제하지 않고 남겨두되, 이후 모든 계획의 source of truth는 `pawlog-design-guide-v2.md`로 전환한다.
