import { StyleSheet, type ViewProps } from 'react-native';

import { Colors, Elevation, Radius, Spacing } from '@/constants/theme';

import { ThemedView } from './themed-view';

/** coral-design-spec.md §2.1 — Surface + Border + Elevation.card 그림자. */
export function Card({ style, ...rest }: ViewProps) {
  return <ThemedView type="surface" style={[styles.card, style]} {...rest} />;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: Spacing.md,
    ...Elevation.card,
  },
});
