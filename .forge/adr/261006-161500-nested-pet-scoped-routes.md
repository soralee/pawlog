---
author: soralee
decided: 2026-10-06 16:15
---
# 펫 Scope 도메인 화면은 라우트 중첩(`/pets/[petId]/...`)으로 표현한다

멀티펫을 MVP 핵심 플로우로 바꾸면서(`pawlog-product-plan.md` §5, `screen-layout.md` §25), "다른 Pet으로 바꾸기 위해 앱 전체 Context를 암묵적으로 변경하지 않는다"는 제약이 생겼다. 기존처럼 전역 `selectedPetId`(Zustand) 하나로 Home/Records/Schedule/복약/병원비 화면이 동시에 바뀌는 구조는 이제 쓸 수 없다. 대안으로 (a) `/pets/[petId]/medication`처럼 라우트 세그먼트에 펫을 중첩하는 방식과 (b) 기존 평탄 라우트를 유지하고 `?petId=` 쿼리 파라미터로 전달하는 방식을 저울질했고, (a)를 택했다 — Expo Router의 동적 세그먼트와 자연스럽게 맞고, 뒤로가기/딥링크가 정확히 동작하며, URL만 봐도 "누구의 기록인지"가 명확해 쿼리 파라미터보다 일관성이 높다. 기존 평탄 라우트(`/medication`, `/hospital-expense`, `/health-record`, `/vaccination`, `/checkup`, `/weight`)는 전부 `/pets/[petId]/<domain>/...`로 이동한다. "전체"(Records/Schedule) 화면은 펫에 종속되지 않는 최상위 라우트로 남고, 그 안에서 "+"로 새 기록을 만들 때만 대상 펫을 명시적으로 고른 뒤 해당 중첩 라우트로 이동한다.
