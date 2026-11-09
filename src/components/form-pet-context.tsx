import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { Spacing } from '@/constants/theme';
import { createPetRepository, type Pet } from '@/db/repositories/pet.repository';

import { PetAvatar } from './pet-avatar';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

type FormPetContextProps = { petId: string };

/** Form 상단에서 대상 Pet을 명확히 보여준다(ui-redesign-plan.md §5.6). */
export function FormPetContext({ petId }: FormPetContextProps) {
  const db = useSQLiteContext();
  const [pet, setPet] = useState<Pet | null>(null);

  const load = useCallback(async () => {
    setPet(await createPetRepository(db).getPet(petId));
  }, [db, petId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SQLite(외부 시스템) 동기화용 마운트 시 fetch
    void load();
  }, [load]);

  if (!pet) return null;

  return (
    <ThemedView style={styles.row}>
      <PetAvatar photoUri={pet.photoUri} size={32} />
      <ThemedText type="small" themeColor="textSecondary">
        {pet.name}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
