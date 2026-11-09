import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

import { ThemedText } from './themed-text';

/**
 * design-guide.md §10 & coral-design-spec.md §2.6–2.7 —
 * Primary(Coral) / Secondary(Primary Light+Coral Border+Coral Text) /
 * Text(Coral Text) / Destructive(삭제 전용, Danger).
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
  primary: Colors.light.onPrimary,
  secondary: Colors.light.primary,
  text: Colors.light.primary,
  destructive: Colors.light.onPrimary,
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
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && !isDisabled && variant === 'primary' && styles.primaryPressed,
        isDisabled && styles.disabled,
      ]}
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
    minHeight: 48,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: Colors.light.primary,
  },
  primaryPressed: {
    backgroundColor: Colors.light.primaryPressed,
  },
  secondary: {
    backgroundColor: Colors.light.primaryLight,
    borderWidth: 1,
    borderColor: Colors.light.primary,
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
