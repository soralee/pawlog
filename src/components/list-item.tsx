import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

import { ThemedText } from './themed-text';

/**
 * design-guide.md §9.6 & coral-design-spec.md §2.26 —
 * 정보 우선순위: 1.제목 2.날짜 3.부가정보 4.상세 진입 Indicator.
 * 텍스트 그룹은 기본 Background를 칠하지 않고 투명하게 두어, Card 내부에서는 부모 Surface가,
 * 독립 리스트에서는 부모 화면 배경이 자연스럽게 비치도록 한다.
 */
type ListItemProps = {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  leadingText?: string;
  trailing?: ReactNode;
  trailingText?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
  /** Card 없이 연속으로 나열되는 Simple List에서 Row 구분선이 필요할 때만 켠다. */
  showDivider?: boolean;
};

export function ListItem({
  title,
  subtitle,
  leading,
  leadingText,
  trailing,
  trailingText,
  onPress,
  accessibilityLabel,
  showDivider,
}: ListItemProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={[styles.row, showDivider && styles.divider]}
    >
      {leading}
      {leadingText ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.leadingText}>
          {leadingText}
        </ThemedText>
      ) : null}
      <View testID="list-item-text-group" style={styles.textGroup}>
        <ThemedText type="default">{title}</ThemedText>
        {subtitle ? (
          <ThemedText type="small" themeColor="textSecondary">
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {trailingText ? <ThemedText type="smallBold">{trailingText}</ThemedText> : null}
      {trailing}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.divider,
  },
  leadingText: {
    minWidth: 44,
  },
  textGroup: {
    flex: 1,
    gap: Spacing.xxs,
  },
});
