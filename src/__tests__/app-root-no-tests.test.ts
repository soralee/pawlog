import { readdirSync, statSync } from 'fs';
import { join } from 'path';

// Expo Router는 `src/app/`(라우트 루트) 아래 모든 .ts(x) 파일을 예외 없이
// 라우트로 스캔한다(파일명 패턴 제외 규칙이 없음). 테스트 파일이 여기 섞이면
// 웹/네이티브 번들에 라우트로 포함되어 `expect is not defined` 크래시가 난다.
// (2026-09-15 UAT에서 실제로 재현된 문제 — src/__tests__/app/index.test.tsx로 이동해 해결)
function findTestFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const fullPath = join(dir, name);
    if (statSync(fullPath).isDirectory()) {
      return findTestFiles(fullPath);
    }
    return /\.(test|spec)\.[jt]sx?$/.test(name) ? [fullPath] : [];
  });
}

test('src/app/ 아래에는 테스트 파일이 없어야 한다', () => {
  const appRoot = join(__dirname, '..', 'app');
  expect(findTestFiles(appRoot)).toEqual([]);
});
