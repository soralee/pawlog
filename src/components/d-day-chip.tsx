import { StyleSheet } from 'react-native';

import { Colors, DDayTone, Radius, Spacing } from '@/constants/theme';
import { formatDDay } from '@/utils/date';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

/**
 * coral-design-spec.md §2.14 & §2.23 — 색상만으로 상태를 전달하지 않고 항상 텍스트를 함께 표시한다.
 * 다가오는 일정: 0~7일 Warning(warningBg/warningText) / 8~30일 Coral / 31일 이상 Info,
 * 완료→Success('완료'), 지남→Warning('n일 지남').
 * Primary Light 표면(surfaceTone="primaryLight")에서 Warning 상태일 때는
 * Primary Light 배경 + 1pt warningText 테두리 + warningText 글자를 사용한다.
 */
export type DDayStatus = 'upcoming' | 'completed' | 'overdue';
export type DDaySurfaceTone = 'default' | 'primaryLight';

type DDayChipProps = {
  /** 남은 일수. 0=오늘, 음수=지남, `'done'`=완료. */
  daysUntil: number | 'done';
  status?: DDayStatus;
  surfaceTone?: DDaySurfaceTone;
  labelOverride?: string;
};

function label(daysUntil: number | 'done', status?: DDayStatus, labelOverride?: string): string {
  if (labelOverride) return labelOverride;
  if (daysUntil === 'done' || status === 'completed') return '완료';
  if (typeof daysUntil === 'number' && (daysUntil < 0 || status === 'overdue')) {
    return `${Math.abs(daysUntil)}일 지남`;
  }
  return formatDDay(daysUntil);
}

type ChipStyleTone = {
  backgroundColor: string;
  color: string;
  borderColor?: string;
  borderWidth?: number;
};

function tone(
  daysUntil: number | 'done',
  status?: DDayStatus,
  surfaceTone: DDaySurfaceTone = 'default',
): ChipStyleTone {
  if (daysUntil === 'done' || status === 'completed') return DDayTone.completed;
  if (typeof daysUntil === 'number') {
    const isWarningState = daysUntil < 0 || status === 'overdue' || daysUntil <= 7;
    if (isWarningState) {
      if (surfaceTone === 'primaryLight') {
        return {
          backgroundColor: Colors.light.primaryLight,
          color: Colors.light.warningText,
          borderColor: Colors.light.warningText,
          borderWidth: 1,
        };
      }
      return daysUntil < 0 || status === 'overdue' ? DDayTone.overdue : DDayTone.urgent;
    }
    if (daysUntil <= 30) return DDayTone.near;
    return DDayTone.far;
  }
  return DDayTone.near;
}

export function DDayChip({
  daysUntil,
  status,
  surfaceTone = 'default',
  labelOverride,
}: DDayChipProps) {
  const { backgroundColor, color, borderColor, borderWidth } = tone(daysUntil, status, surfaceTone);

  return (
    <ThemedView
      testID="d-day-chip"
      style={[styles.chip, { backgroundColor }, borderWidth ? { borderWidth, borderColor } : null]}
    >
      <ThemedText type="smallBold" style={{ color }}>
        {label(daysUntil, status, labelOverride)}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 24,
    justifyContent: 'center',
    paddingVertical: Spacing.xxs,
    paddingHorizontal: Spacing.xs,
    borderRadius: Radius.full,
  },
});
