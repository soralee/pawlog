import { Stack, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { FormScrollContainer } from '@/components/form-scroll-container';
import { ThemedView } from '@/components/themed-view';
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
      <FormScrollContainer>
        <PetForm onSubmit={handleSubmit} />
      </FormScrollContainer>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
