import { Modal, Pressable, StyleSheet } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export type SheetOption = {
  label: string;
  onPress: () => void;
};

/**
 * design-guide.md §23 — 기록/일정 종류 선택 등 짧은 옵션 선택에 쓰는 Bottom Sheet.
 * 새 라이브러리 없이 Modal로 구현한다. 긴 Form은 이 안에 넣지 않는다.
 */
type OptionSheetProps = {
  visible: boolean;
  title?: string;
  options: SheetOption[];
  onClose: () => void;
};

export function OptionSheet({ visible, title, options, onClose }: OptionSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="닫기">
        <ThemedView type="surface" style={styles.sheet}>
          {title ? <ThemedText type="heading">{title}</ThemedText> : null}
          {options.map((option) => (
            <Pressable
              key={option.label}
              accessibilityLabel={option.label}
              onPress={() => {
                onClose();
                option.onPress();
              }}
              style={styles.option}
            >
              <ThemedText type="default">{option.label}</ThemedText>
            </Pressable>
          ))}
        </ThemedView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(41, 37, 36, 0.4)',
  },
  sheet: {
    borderTopLeftRadius: Radius.sheet,
    borderTopRightRadius: Radius.sheet,
    padding: Spacing.lg,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  option: {
    minHeight: 44,
    justifyContent: 'center',
  },
});
