---
author: soralee
decided: 2026-09-15 10:30
---
# 로컬-온리 아키텍처 및 초기 스택 결정

Pawlog는 1인 부업 앱으로, 서버·로그인·AI 없이 기기 로컬 SQLite만으로 제품 가치가 성립해야 한다(운영 부담·유지비를 낮추는 것이 제품 전제). 이에 따라 저장소는 관계형 기록(펫 ↔ 여러 기록/일정 테이블)에 적합한 **expo-sqlite**를 채택하고(AsyncStorage는 관계형 구조에 부적합해 기각), **Zustand**는 DB 캐시가 아니라 `selectedPetId`/테마 등 순수 UI 상태만 담당해 TanStack Query/Redux 도입을 보류한다. Repository 인터페이스는 미리 만들지 않고 첫 기능(Pet 등록) 구현 시점에 연다 — 빈 추상화를 먼저 만들지 않기 위함이다. 네이티브 기능(SQLite/Notification) 구현 시작 전까지는 **Expo Go**로 화면만 확인하고, 그 시점에 **Development Build(expo-dev-client)**로 전환한다. 스타일링은 NativeWind 없이 StyleSheet + 디자인 토큰만 사용한다.
