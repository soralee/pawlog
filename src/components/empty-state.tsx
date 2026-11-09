import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

import { Button } from './button';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

/**
 * design-guide.md §20 — Small Illustration + 짧은 제목 + 한 문장 설명 + (선택) CTA.
 * 새 이미지 Asset 대신 Ionicons + 토큰으로 Illustration을 표현한다.
 */
type EmptyStateProps = {
  title: string;
  description?: string;
  ctaLabel?: string;
  onPressCta?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
};

export function EmptyState({
  title,
  description,
  ctaLabel,
  onPressCta,
  icon = 'file-tray-outline',
}: EmptyStateProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.iconCircle}>
        <Ionicons name={icon} size={28} color={Colors.light.primary} />
      </ThemedView>
      <ThemedText type="heading" style={styles.centerText}>
        {title}
      </ThemedText>
      {description ? (
        <ThemedText type="default" themeColor="textSecondary" style={styles.centerText}>
          {description}
        </ThemedText>
      ) : null}
      {ctaLabel && onPressCta ? <Button onPress={onPressCta}>{ctaLabel}</Button> : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
});
