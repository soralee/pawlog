---
author: soralee
decided: 2026-09-15 14:18
---
# Repository는 DB를 의존성 주입으로 받아 인메모리 페이크로 테스트한다

`expo-sqlite`는 네이티브 모듈이라 Jest(Node 환경)에서 직접 실행할 수 없고 `jest-expo`도 이를 모킹해주지 않는다. 그래서 Repository를 `getDatabase()`를 내부에서 직접 호출하는 구조로 만들면 단위 테스트가 불가능해진다. 이를 해결하기 위해 모든 Repository는 팩토리 함수로 만들고, 실제 사용에 필요한 `execAsync`/`runAsync`/`getAllAsync`/`getFirstAsync` 중 필요한 메서드만 담은 좁은 타입(`Pick<SQLiteDatabase, ...>`)을 인자로 주입받는다. 프로덕션에서는 `getDatabase()`가 반환하는 실제 `SQLiteDatabase`를 넘기고, 테스트에서는 같은 인터페이스를 구현한 간단한 인메모리 페이크를 넘긴다. 이 패턴은 Pet Repository뿐 아니라 앞으로 만들 모든 Repository(Phase 2의 health_records/vaccinations/checkups/weight_records 등)에 동일하게 적용한다.
