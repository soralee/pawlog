import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { ChipTokens, Colors, Radius, Spacing, Typography } from '@/constants/theme';

import { ThemedText } from './themed-text';

export type ChipVariant = 'filter' | 'status';
export type ChipTone = 'neutral' | 'primary' | 'success' | 'warning' | 'info' | 'danger';
export type ChipSize = 'sm' | 'md';

type ChipProps = {
  label: string;
  variant?: ChipVariant;
  selected?: boolean;
  tone?: ChipTone;
  size?: ChipSize;
  leadingIcon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityState?: { selected?: boolean };
};

const HIT_SLOP = { top: 6, bottom: 6, left: 6, right: 6 } as const;

const STATUS_STYLE: Record<ChipTone, { backgroundColor: string; color: string }> = {
  neutral: { backgroundColor: Colors.light.divider, color: Colors.light.textSecondary },
  primary: { backgroundColor: Colors.light.primaryLight, color: Colors.light.primary },
  success: { backgroundColor: Colors.light.successBg, color: Colors.light.success },
  warning: { backgroundColor: Colors.light.warningBg, color: Colors.light.warningText },
  info: { backgroundColor: Colors.light.infoBg, color: Colors.light.info },
  danger: { backgroundColor: Colors.light.dangerBg, color: Colors.light.danger },
};

/**
 * coral-design-spec.md §2.2 — Filter/Status Chip 공용 컴포넌트.
 * Filter는 버튼 역할과 selected 접근성 상태를 함께 제공한다.
 */
export function Chip({
  label,
  variant = 'filter',
  selected = false,
  tone = 'neutral',
  size = 'md',
  leadingIcon,
  onPress,
  accessibilityLabel,
  accessibilityState,
}: ChipProps) {
  const isFilter = variant === 'filter';
  const resolvedSelected = accessibilityState?.selected ?? selected;

  const containerColors = isFilter
    ? resolvedSelected
      ? {
          backgroundColor: ChipTokens.filterSelected.backgroundColor,
          borderWidth: 0,
          borderColor: 'transparent',
        }
      : {
          backgroundColor: ChipTokens.filterUnselected.backgroundColor,
          borderWidth: ChipTokens.filterUnselected.borderWidth,
          borderColor: ChipTokens.filterUnselected.borderColor,
        }
    : {
        backgroundColor: STATUS_STYLE[tone].backgroundColor,
        borderWidth: 0,
        borderColor: 'transparent',
      };

  const textColor = isFilter
    ? resolvedSelected
      ? ChipTokens.filterSelected.color
      : ChipTokens.filterUnselected.color
    : STATUS_STYLE[tone].color;

  return (
    <Pressable
      accessibilityRole={onPress || isFilter ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={isFilter ? { selected: resolvedSelected } : accessibilityState}
      hitSlop={HIT_SLOP}
      onPress={onPress}
      disabled={!onPress}
      style={[styles.base, size === 'sm' ? styles.sm : styles.md, containerColors]}
    >
      {leadingIcon ? <Ionicons name={leadingIcon} size={14} color={textColor} /> : null}
      <ThemedText
        type="small"
        style={[size === 'sm' ? styles.captionText : styles.bodySmallText, { color: textColor }]}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    gap: Spacing.xxs,
  },
  sm: {
    minHeight: 24,
    paddingHorizontal: Spacing.xs,
  },
  md: {
    minHeight: 36,
    paddingHorizontal: Spacing.sm,
  },
  captionText: {
    fontSize: Typography.caption.fontSize,
  },
  bodySmallText: {
    fontSize: Typography.bodySmall.fontSize,
  },
});
