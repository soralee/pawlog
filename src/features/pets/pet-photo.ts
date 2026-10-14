import { Directory, File, Paths } from 'expo-file-system';

const petPhotosDir = new Directory(Paths.document, 'pet-photos');

function generatePhotoFilename(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}.jpg`;
}

/** 이미지 선택기가 반환한 임시 URI를 앱 문서 디렉터리로 복사해 영구 보관한다. */
export async function savePetPhoto(sourceUri: string): Promise<string> {
  if (!petPhotosDir.exists) {
    petPhotosDir.create({ intermediates: true, idempotent: true });
  }
  const destination = new File(petPhotosDir, generatePhotoFilename());
  await new File(sourceUri).copy(destination);
  return destination.uri;
}
