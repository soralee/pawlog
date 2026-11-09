import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet } from 'react-native';

import { AvatarSize, Colors, Radius, Spacing } from '@/constants/theme';
import type { Pet } from '@/db/repositories/pet.repository';

import { PetAvatar } from './pet-avatar';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

type PetSwitchSheetProps = {
  visible: boolean;
  pets: Pick<Pet, 'id' | 'name' | 'photoUri'>[];
  selectedPetId?: string | null;
  onSelectPet: (petId: string) => void;
  onAddPet?: () => void;
  onClose: () => void;
};

/**
 * Phase 3.4 — Pet Switch Sheet 전용 컴포넌트.
 * 제목 '반려동물 선택', 사진 48pt(AvatarSize.md), 선택 ✓(코랄), '+ 반려동물 추가' 행.
 */
export function PetSwitchSheet({
  visible,
  pets,
  selectedPetId,
  onSelectPet,
  onAddPet,
  onClose,
}: PetSwitchSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="닫기">
        <ThemedView type="surface" style={styles.sheet}>
          <ThemedView style={styles.grabber} testID="pet-switch-sheet-grabber" />
          <ThemedText type="heading" style={styles.title}>
            반려동물 선택
          </ThemedText>
          {pets.map((pet) => {
            const isSelected = pet.id === selectedPetId;
            return (
              <Pressable
                key={pet.id}
                accessibilityLabel={pet.name}
                accessibilityState={{ selected: isSelected }}
                onPress={() => {
                  onClose();
                  onSelectPet(pet.id);
                }}
                style={styles.row}
              >
                <ThemedView type="surface" style={styles.rowLeft}>
                  <PetAvatar photoUri={pet.photoUri} size={AvatarSize.md} />
                  <ThemedText type="default">{pet.name}</ThemedText>
                </ThemedView>
                {isSelected ? (
                  <Ionicons
                    name="checkmark"
                    size={22}
                    color={Colors.light.primary}
                    testID={`pet-selected-${pet.id}`}
                  />
                ) : null}
              </Pressable>
            );
          })}
          {onAddPet ? (
            <Pressable
              accessibilityLabel="반려동물 추가"
              onPress={() => {
                onClose();
                onAddPet();
              }}
              style={[styles.row, styles.addRow]}
            >
              <ThemedText type="smallBold" themeColor="primary">
                + 반려동물 추가
              </ThemedText>
            </Pressable>
          ) : null}
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
  row: {
    minHeight: 56,
    paddingHorizontal: Spacing.screen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  addRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.divider,
    marginTop: Spacing.xxs,
  },
});
