import { savePetPhoto } from './pet-photo';

jest.mock('expo-file-system', () => {
  function toUri(part: string | { uri: string }): string {
    return typeof part === 'string' ? part : part.uri;
  }

  class FakeFile {
    uri: string;
    constructor(...parts: (string | { uri: string })[]) {
      this.uri = parts.map(toUri).join('/');
    }
    copy(_destination: { uri: string }): Promise<void> {
      return Promise.resolve();
    }
  }

  class FakeDirectory {
    uri: string;
    exists = false;
    constructor(...parts: (string | { uri: string })[]) {
      this.uri = parts.map(toUri).join('/');
    }
    create(): void {
      this.exists = true;
    }
  }

  return {
    File: FakeFile,
    Directory: FakeDirectory,
    Paths: { document: 'file:///document' },
  };
});

test('임시 URI를 pet-photos 디렉터리 아래 새 파일 경로로 복사해 그 경로를 반환한다', async () => {
  const saved = await savePetPhoto('file:///cache/picker-temp.jpg');

  expect(saved).toMatch(/^file:\/\/\/document\/pet-photos\/.+\.jpg$/);
  expect(saved).not.toBe('file:///cache/picker-temp.jpg');
});

test('매번 다른 파일명으로 복사해 이전 사진과 충돌하지 않는다', async () => {
  const first = await savePetPhoto('file:///cache/a.jpg');
  const second = await savePetPhoto('file:///cache/b.jpg');

  expect(first).not.toBe(second);
});
