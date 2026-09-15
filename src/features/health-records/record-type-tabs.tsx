import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export type RecordType = 'health' | 'vaccination' | 'checkup' | 'weight';

const OPTIONS: { value: RecordType; label: string }[] = [
  { value: 'health', label: '건강기록' },
  { value: 'vaccination', label: '예방접종' },
  { value: 'checkup', label: '건강검진' },
  { value: 'weight', label: '체중' },
];

type RecordTypeTabsProps = {
  value: RecordType;
  onChange: (value: RecordType) => void;
};

export function RecordTypeTabs({ value, onChange }: RecordTypeTabsProps) {
  return (
    <ThemedView style={styles.row}>
      {OPTIONS.map((option) => (
        <Pressable
          key={option.value}
          accessibilityLabel={option.label}
          onPress={() => onChange(option.value)}
          style={[styles.button, value === option.value && styles.buttonSelected]}
        >
          <ThemedText type="small">{option.label}</ThemedText>
        </Pressable>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.xxs,
  },
  button: {
    paddingVertical: Spacing.xxs,
    paddingHorizontal: Spacing.xs,
    borderRadius: Spacing.md,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  buttonSelected: {
    borderColor: '#3c87f7',
  },
});
