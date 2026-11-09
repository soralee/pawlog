import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { AvatarSize, Colors, type AvatarSizeKey } from '@/constants/theme';

import { ThemedView } from './themed-view';

type PetAvatarProps = {
  photoUri?: string | null;
  size?: number | AvatarSizeKey;
  accessibilityLabel?: string;
};

/**
 * coral-design-spec.md §2.3 — 반려동물 사진이 없거나 로드에 실패하면
 * Primary Light 바탕 + Primary 발바닥 아이콘 Placeholder를 보여준다.
 */
export function PetAvatar({ photoUri = null, size = 'md', accessibilityLabel }: PetAvatarProps) {
  const [hasError, setHasError] = useState(false);
  const diameter = typeof size === 'number' ? size : AvatarSize[size];
  const circle = { width: diameter, height: diameter, borderRadius: diameter / 2 };

  if (photoUri && !hasError) {
    return (
      <Image
        source={{ uri: photoUri }}
        style={circle}
        contentFit="cover"
        accessibilityLabel={accessibilityLabel}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <ThemedView style={[styles.placeholder, circle]} accessibilityLabel={accessibilityLabel}>
      <Ionicons name="paw" size={diameter * 0.5} color={Colors.light.primary} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
