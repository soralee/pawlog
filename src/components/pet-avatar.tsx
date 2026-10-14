import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import { Colors } from '@/constants/theme';

import { ThemedView } from './themed-view';

type PetAvatarProps = {
  photoUri: string | null;
  size?: number;
};

/** 반려동물 사진이 없으면 발바닥 아이콘 Placeholder를 보여준다. */
export function PetAvatar({ photoUri, size = 48 }: PetAvatarProps) {
  const circle = { width: size, height: size, borderRadius: size / 2 };

  if (photoUri) {
    return <Image source={{ uri: photoUri }} style={circle} contentFit="cover" />;
  }

  return (
    <ThemedView style={[styles.placeholder, circle]}>
      <Ionicons name="paw" size={size * 0.5} color={Colors.light.textMuted} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: Colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
