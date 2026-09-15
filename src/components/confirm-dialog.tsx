import { Modal, StyleSheet } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

import { Button } from './button';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

/** design-guide.md §20 — 삭제 등 되돌릴 수 없는 행동 전에 확인을 받는다. */
type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  description,
  confirmLabel = '삭제',
  cancelLabel = '취소',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <ThemedView style={styles.backdrop}>
        <ThemedView type="surface" style={styles.card}>
          <ThemedText type="heading">{title}</ThemedText>
          {description ? (
            <ThemedText type="default" themeColor="textSecondary">
              {description}
            </ThemedText>
          ) : null}
          <ThemedView style={styles.actions}>
            <ThemedView style={styles.actionButton}>
              <Button variant="secondary" onPress={onCancel}>
                {cancelLabel}
              </Button>
            </ThemedView>
            <ThemedView style={styles.actionButton}>
              <Button variant="destructive" onPress={onConfirm}>
                {confirmLabel}
              </Button>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(41, 37, 36, 0.4)',
    padding: Spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: Radius.sheet,
    padding: Spacing.lg,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  actionButton: {
    flex: 1,
  },
});
