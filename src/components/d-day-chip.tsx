import { StyleSheet } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

/**
 * design-guide-v2.md §15 — 색상만으로 상태를 전달하지 않고 항상 텍스트(D-14/오늘/완료 등)를
 * 함께 표시한다. 다가오는 일정→Primary(Coral), 임박→Warning, 완료→Success.
 * "임박"의 정확한 기준일은 가이드에 없어 3일 이하로 잠정 설정했다.
 */
type DDayChipProps = {
  /** 남은 일수. 0=오늘, 음수=지남, `'done'`=완료. */
  daysUntil: number | 'done';
};

function label(daysUntil: number | 'done'): string {
  if (daysUntil === 'done') return '완료';
  if (daysUntil === 0) return '오늘';
  if (daysUntil < 0) return `D+${Math.abs(daysUntil)}`;
  return `D-${daysUntil}`;
}

function tone(daysUntil: number | 'done'): { background: string; text: string } {
  if (daysUntil === 'done') return { background: '#EAF6F0', text: Colors.light.success };
  if (typeof daysUntil === 'number' && daysUntil <= 3) {
    return { background: '#FDF1E1', text: Colors.light.warning };
  }
  return { background: Colors.light.primaryLight, text: Colors.light.primary };
}

export function DDayChip({ daysUntil }: DDayChipProps) {
  const { background, text } = tone(daysUntil);

  return (
    <ThemedView style={[styles.chip, { backgroundColor: background }]}>
      <ThemedText type="smallBold" style={{ color: text }}>
        {label(daysUntil)}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: Spacing.xxs,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.full,
  },
});
