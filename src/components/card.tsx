import { StyleSheet, type ViewProps } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

import { ThemedView } from './themed-view';

/** design-guide.md §9.2 — Surface + Border로 계층을 표현한다(Shadow는 최소화). */
export function Card({ style, ...rest }: ViewProps) {
  return <ThemedView type="surface" style={[styles.card, style]} {...rest} />;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: Spacing.md,
  },
});
