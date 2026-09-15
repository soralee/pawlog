import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

import { ThemedText } from './themed-text';

/**
 * design-guide.md §9.1 — Primary(기본 Sage) / Secondary(White+Border) / Text(보조 행동) /
 * Destructive(삭제 전용, Danger).
 */
export type ButtonVariant = 'primary' | 'secondary' | 'text' | 'destructive';

type ButtonProps = {
  variant?: ButtonVariant;
  onPress: () => void;
  children: string;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
};

const TEXT_COLOR: Record<ButtonVariant, string> = {
  primary: '#FFFFFF',
  secondary: Colors.light.textPrimary,
  text: Colors.light.textSecondary,
  destructive: '#FFFFFF',
};

export function Button({
  variant = 'primary',
  onPress,
  children,
  disabled,
  loading,
  accessibilityLabel,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? children}
      accessibilityState={{ disabled: isDisabled }}
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.base, styles[variant], isDisabled && styles.disabled]}
    >
      {loading ? (
        <ActivityIndicator color={TEXT_COLOR[variant]} size="small" />
      ) : (
        <ThemedText type="smallBold" style={{ color: TEXT_COLOR[variant] }}>
          {children}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: Colors.light.primary,
  },
  secondary: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  text: {
    backgroundColor: 'transparent',
  },
  destructive: {
    backgroundColor: Colors.light.danger,
  },
  disabled: {
    opacity: 0.5,
  },
});
