import { Stack, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { createPetRepository, type CreatePetInput } from '@/db/repositories/pet.repository';
import { PetForm } from '@/features/pets/pet-form';

export default function NewPetScreen() {
  const db = useSQLiteContext();
  const repository = useMemo(() => createPetRepository(db), [db]);
  const router = useRouter();

  async function handleSubmit(input: CreatePetInput) {
    await repository.createPet(input);
    router.back();
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: '반려동물 등록' }} />
      <SafeAreaView style={styles.safeArea}>
        <PetForm onSubmit={handleSubmit} />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, padding: Spacing.lg, gap: Spacing.md },
});
