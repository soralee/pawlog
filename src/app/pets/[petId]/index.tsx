import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { ListItem } from '@/components/list-item';
import { PetAvatar } from '@/components/pet-avatar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { createCheckupRepository } from '@/db/repositories/checkup.repository';
import { createHealthRecordRepository } from '@/db/repositories/health-record.repository';
import { createHospitalExpenseRepository } from '@/db/repositories/hospital-expense.repository';
import { createMedicationRepository } from '@/db/repositories/medication.repository';
import {
  createPetRepository,
  type CreatePetInput,
  type Pet,
} from '@/db/repositories/pet.repository';
import { createVaccinationRepository } from '@/db/repositories/vaccination.repository';
import { createWeightRecordRepository } from '@/db/repositories/weight-record.repository';
import { PetForm } from '@/features/pets/pet-form';
import { formatAge } from '@/utils/date';

export default function PetDetailScreen() {
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const db = useSQLiteContext();
  const router = useRouter();

  const [pet, setPet] = useState<Pet | null>(null);
  const [editing, setEditing] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const load = useCallback(async () => {
    setPet(await createPetRepository(db).getPet(petId));
  }, [db, petId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SQLite(외부 시스템) 동기화용 마운트 시 fetch
    void load();
  }, [load]);

  async function handleUpdate(input: CreatePetInput) {
    await createPetRepository(db).updatePet(petId, input);
    setEditing(false);
    await load();
  }

  async function handleDelete() {
    await Promise.all([
      createHealthRecordRepository(db).removeByPet(petId),
      createVaccinationRepository(db).removeByPet(petId),
      createCheckupRepository(db).removeByPet(petId),
      createWeightRecordRepository(db).removeByPet(petId),
      createMedicationRepository(db).removeByPet(petId),
      createHospitalExpenseRepository(db).removeByPet(petId),
    ]);
    await createPetRepository(db).remove(petId);
    setConfirmVisible(false);
    router.back();
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: '반려동물 프로필',
          headerRight: () =>
            pet && !editing ? (
              <Pressable accessibilityLabel="수정" onPress={() => setEditing(true)}>
                <ThemedText type="default" themeColor="primary">
                  수정
                </ThemedText>
              </Pressable>
            ) : null,
        }}
      />
      <SafeAreaView style={styles.safeArea}>
        {pet && editing && (
          <PetForm
            initialValues={{
              name: pet.name,
              birthDate: pet.birthDate,
              species: pet.species,
              gender: pet.gender,
            }}
            initialPhotoUri={pet.photoUri}
            submitLabel="저장하기"
            onSubmit={handleUpdate}
          />
        )}
        {pet && !editing && (
          <>
            <ThemedView style={styles.profile}>
              <PetAvatar photoUri={pet.photoUri} size={96} />
              <ThemedText type="display">{pet.name}</ThemedText>
              <ThemedText type="default" themeColor="textSecondary">
                {formatAge(new Date(pet.birthDate))} · {pet.species === 'dog' ? '강아지' : '고양이'}{' '}
                · {pet.gender === 'male' ? '남아' : '여아'}
              </ThemedText>
            </ThemedView>

            <ThemedText type="heading">건강 관리</ThemedText>
            <ListItem
              title="건강 기록"
              onPress={() => router.push(`/pets/${petId}/health-record`)}
            />
            <ListItem title="예방접종" onPress={() => router.push(`/pets/${petId}/vaccination`)} />
            <ListItem title="건강검진" onPress={() => router.push(`/pets/${petId}/checkup`)} />
            <ListItem title="체중" onPress={() => router.push(`/pets/${petId}/weight`)} />
            <ListItem title="복약" onPress={() => router.push(`/pets/${petId}/medication`)} />
            <ListItem
              title="병원비"
              onPress={() => router.push(`/pets/${petId}/hospital-expense`)}
            />

            <Button variant="destructive" onPress={() => setConfirmVisible(true)}>
              반려동물 삭제
            </Button>
          </>
        )}
      </SafeAreaView>
      <ConfirmDialog
        visible={confirmVisible}
        title={`${pet?.name ?? ''}을(를) 삭제할까요?`}
        description="연결된 모든 건강 기록·일정·병원비 기록이 함께 삭제되며 복구할 수 없어요."
        onConfirm={handleDelete}
        onCancel={() => setConfirmVisible(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, padding: Spacing.lg, gap: Spacing.sm },
  profile: { alignItems: 'center', gap: Spacing.xxs, marginBottom: Spacing.sm },
});
