import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

/**
 * design-guide.md §9.4 — Label은 Placeholder로 대체하지 않고 항상 유지, Error는 입력창
 * 아래, Optional 여부는 라벨에 "(선택)"으로 명시한다.
 */
type InputProps = Omit<TextInputProps, 'style'> & {
  label: string;
  optional?: boolean;
  error?: string;
};

export function Input({ label, optional, error, ...rest }: InputProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
        {optional ? ' (선택)' : ''}
      </ThemedText>
      <TextInput
        accessibilityLabel={label}
        style={[styles.input, error ? styles.inputError : null]}
        {...rest}
      />
      {error ? (
        <ThemedText type="small" themeColor="danger">
          {error}
        </ThemedText>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xxs,
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.input,
    paddingHorizontal: Spacing.sm,
    color: Colors.light.textPrimary,
  },
  inputError: {
    borderColor: Colors.light.danger,
  },
});
