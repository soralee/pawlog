import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet } from 'react-native';

import { Colors, IconTileTone, Radius, Spacing, type IconTileToneKey } from '@/constants/theme';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export type SheetOption = {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconTone?: IconTileToneKey;
  iconColor?: string;
  onPress: () => void;
};

/**
 * coral-design-spec.md §2.11–2.12 — 기록/일정 종류 선택 등 짧은 옵션 선택에 쓰는 Bottom Sheet.
 * 상단 grabber(36×4, #D6D3D1), 행 높이 52pt 이상, Ionicons icon prop(22pt), 우측 chevron-forward(16pt).
 */
type OptionSheetProps = {
  visible: boolean;
  title?: string;
  options: SheetOption[];
  loading?: boolean;
  onClose: () => void;
};

export function OptionSheet({
  visible,
  title,
  options,
  loading = false,
  onClose,
}: OptionSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="닫기">
        <ThemedView type="surface" style={styles.sheet}>
          <ThemedView style={styles.grabber} testID="option-sheet-grabber" />
          {title ? (
            <ThemedText type="heading" style={styles.title}>
              {title}
            </ThemedText>
          ) : null}
          {loading ? (
            <ThemedText type="default" themeColor="textSecondary" style={styles.statusText}>
              옵션을 불러오는 중이에요.
            </ThemedText>
          ) : options.length === 0 ? (
            <ThemedText type="default" themeColor="textSecondary" style={styles.statusText}>
              선택할 항목이 없어요.
            </ThemedText>
          ) : (
            options.map((option) => (
              <Pressable
                key={option.label}
                accessibilityLabel={option.label}
                onPress={() => {
                  onClose();
                  option.onPress();
                }}
                style={styles.option}
              >
                <ThemedView type="surface" style={styles.optionLeft}>
                  {option.icon ? (
                    <Ionicons
                      name={option.icon}
                      size={22}
                      color={
                        option.iconColor ??
                        (option.iconTone
                          ? IconTileTone[option.iconTone].color
                          : Colors.light.primary)
                      }
                      testID={`option-icon-${option.icon}`}
                    />
                  ) : null}
                  <ThemedText type="default">{option.label}</ThemedText>
                </ThemedView>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={Colors.light.textMuted}
                  testID={`option-chevron-${option.label}`}
                />
              </Pressable>
            ))
          )}
        </ThemedView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: Colors.light.overlay,
  },
  sheet: {
    borderTopLeftRadius: Radius.sheet,
    borderTopRightRadius: Radius.sheet,
    paddingBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.grabber,
    alignSelf: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  title: {
    paddingHorizontal: Spacing.screen,
    marginBottom: Spacing.xs,
  },
  statusText: {
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.md,
  },
  option: {
    minHeight: 52,
    paddingHorizontal: Spacing.screen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
