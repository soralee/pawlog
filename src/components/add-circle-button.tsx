import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { Colors, Radius } from '@/constants/theme';

type AddCircleButtonProps = {
  accessibilityLabel: string;
  onPress: () => void;
};

const HIT_SLOP = { top: 6, bottom: 6, left: 6, right: 6 } as const;

/**
 * coral-design-spec.md §2.11 & 결정 6 — 일정·기록·내 반려동물 탭 헤더의
 * 코랄 채움 원형 `+` 버튼(44×44pt).
 */
export function AddCircleButton({ accessibilityLabel, onPress }: AddCircleButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={HIT_SLOP}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Ionicons name="add" size={24} color={Colors.light.onPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: Colors.light.primaryPressed,
  },
});
