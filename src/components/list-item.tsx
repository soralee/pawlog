import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Spacing } from '@/constants/theme';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

/**
 * design-guide.md §9.6 — 정보 우선순위: 1.제목 2.날짜 3.부가정보 4.상세 진입 Indicator.
 * `trailing`에 DDayChip이나 `>` 같은 요소를 넣는다.
 */
type ListItemProps = {
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
};

export function ListItem({
  title,
  subtitle,
  trailing,
  onPress,
  accessibilityLabel,
}: ListItemProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={styles.row}
    >
      <ThemedView style={styles.textGroup}>
        <ThemedText type="default">{title}</ThemedText>
        {subtitle ? (
          <ThemedText type="small" themeColor="textSecondary">
            {subtitle}
          </ThemedText>
        ) : null}
      </ThemedView>
      {trailing}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  textGroup: {
    flex: 1,
    gap: Spacing.xxs,
  },
});
