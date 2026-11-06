# Pawlog 개발 및 iOS 빌드 환경

## 현재 프로젝트 기준

- Expo SDK 57 / React Native 0.86 / React 19
- Node.js 22, pnpm 11.11.0
- Expo Router, expo-dev-client, expo-sqlite
- iOS 우선 개발 및 검증
- 로컬 데이터베이스(SQLite)를 사용하는 오프라인 우선 앱

## 로컬 개발

```bash
pnpm install --frozen-lockfile
pnpm start
```

Expo Go가 아닌 Development Build를 우선 사용한다. SQLite 및 알림 등 네이티브 모듈 동작을 확인하려면 앱의 네이티브 구성이 포함된 개발 클라이언트가 필요하다.

### iOS Simulator 빌드

```bash
pnpm exec eas build --platform ios --profile development-simulator
```

EAS가 만든 iOS Simulator용 빌드를 내려받아 Simulator에 설치한다. 로컬 네이티브 빌드가 필요한 경우 macOS와 Xcode가 설치된 환경에서 다음을 사용한다.

```bash
pnpm ios
```

저장소에는 현재 `ios/` 네이티브 프로젝트를 커밋하지 않는다. Expo Prebuild / CNG를 사용한다.

## EAS 프로필

| 프로필 | 목적 | 배포 대상 |
|---|---|---|
| development-simulator | 개발 클라이언트 및 UI/네이티브 기능 확인 | iOS Simulator |
| preview | 내부 테스트용 설치 빌드 | 등록된 iOS 기기 |
| production | App Store 배포 준비 | App Store |

`preview` 및 `production` 실기기 배포에는 Apple Developer 계정과 EAS 자격 증명이 필요하다. Simulator 프로필은 iOS Simulator용이므로 실기기에 설치할 수 없다.

## GitHub Actions

### CI

`.github/workflows/ci.yml`은 main 대상 Pull Request 및 main push에서 다음을 실행한다.

1. pnpm lockfile 기반 의존성 설치
2. Expo Doctor
3. TypeScript 타입 검사
4. ESLint
5. Jest 테스트 및 coverage 수집

### EAS iOS Build

`.github/workflows/eas-ios-build.yml`은 수동 실행(workflow_dispatch)으로 동작한다. GitHub Actions의 Actions 탭에서 실행하고 다음 프로필 중 하나를 선택한다.

- `development-simulator`: iOS Simulator용 Development Build
- `preview`: 내부 배포용 iOS 실기기 빌드

저장소의 GitHub Actions Secrets에 `EXPO_TOKEN`을 등록해야 한다. Expo 계정에서 발급한 Access Token을 사용한다. 토큰을 코드나 설정 파일에 커밋하지 않는다.

EAS 프로젝트를 연결한 뒤 Expo 프로젝트 ID를 `app.json`의 `expo.extra.eas.projectId`에 설정해야 할 수 있다. 최초 연결은 프로젝트 소유자와 Expo 계정을 확인한 뒤 `eas init`으로 수행한다.

## 현재 확인이 필요한 외부 설정

- Expo 계정 및 EAS 프로젝트 생성/연결
- `EXPO_TOKEN` GitHub Secret 등록
- Preview 실기기 테스트를 위한 Apple Developer 자격 증명 및 기기 등록
- EAS Build 실행 후 실제 Simulator 설치 및 앱 동작 확인

## 로컬 검증 명령

```bash
pnpm install --frozen-lockfile
pnpm exec expo-doctor
pnpm typecheck
pnpm lint
pnpm test -- --runInBand
```

GitHub Actions가 통과하는 것은 정적 검사 및 자동화 테스트의 성공을 의미하며, iOS Simulator 또는 실제 기기에서의 수동 검증을 대체하지 않는다.
