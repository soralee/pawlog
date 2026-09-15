import { StyleSheet } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

import { Button } from './button';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

/**
 * design-guide.md §12 — Illustration + 짧은 제목 + 한 문장 설명 + (선택) CTA.
 * 실제 일러스트 에셋은 아직 없어 자리표시자(원형)로 대체한다 — 나중에 교체.
 */
type EmptyStateProps = {
  title: string;
  description?: string;
  ctaLabel?: string;
  onPressCta?: () => void;
};

export function EmptyState({ title, description, ctaLabel, onPressCta }: EmptyStateProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.placeholder} />
      <ThemedText type="subtitle" style={styles.centerText}>
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
  placeholder: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    backgroundColor: Colors.light.lavenderLight,
  },
  centerText: {
    textAlign: 'center',
  },
});
