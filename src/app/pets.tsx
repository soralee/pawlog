import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import {
  createPetRepository,
  type CreatePetInput,
  type Pet,
} from '@/db/repositories/pet.repository';
import { PetForm } from '@/features/pets/pet-form';
import { formatAge } from '@/utils/date';

export default function PetsScreen() {
  const db = useSQLiteContext();
  const repository = useMemo(() => createPetRepository(db), [db]);
  const [pets, setPets] = useState<Pet[]>([]);

  const refresh = useCallback(async () => {
    setPets(await repository.listPets());
  }, [repository]);

  useEffect(() => {
    // SQLite(외부 시스템)에서 목록을 읽어와 동기화하는 마운트 시점 fetch다 — 이 규칙이
    // 막으려는 "props/상태를 복제하는 setState"가 아니므로 예외 처리한다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  async function handleCreate(input: CreatePetInput) {
    await repository.createPet(input);
    await refresh();
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">내 반려동물</ThemedText>

        <FlatList
          data={pets}
          keyExtractor={(pet) => pet.id}
          ListEmptyComponent={<ThemedText type="default">등록된 반려동물이 없어요.</ThemedText>}
          renderItem={({ item }) => (
            <ThemedView type="backgroundElement" style={styles.petRow}>
              <ThemedText type="default">{item.name}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {formatAge(new Date(item.birthDate))}
              </ThemedText>
            </ThemedView>
          )}
        />

        <PetForm onSubmit={handleCreate} />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  petRow: {
    padding: Spacing.two,
    borderRadius: Spacing.two,
    marginBottom: Spacing.two,
  },
});
