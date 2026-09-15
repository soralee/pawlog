import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import {
  createWeightRecordRepository,
  type WeightRecord,
  type WeightRecordDb,
} from '@/db/repositories/weight-record.repository';

type WeightRecordSectionProps = {
  db: WeightRecordDb;
  petId: string;
};

export function WeightRecordSection({ db, petId }: WeightRecordSectionProps) {
  const repository = useMemo(() => createWeightRecordRepository(db), [db]);
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [weightKg, setWeightKg] = useState('');

  const refresh = useCallback(async () => {
    setRecords(await repository.listByPet(petId));
  }, [petId, repository]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SQLite(외부 시스템) 동기화용 마운트 시 fetch
    refresh();
  }, [refresh]);

  async function handleAdd() {
    const parsed = Number(weightKg);
    if (!weightKg.trim() || Number.isNaN(parsed)) return;
    await repository.create({
      petId,
      measuredAt: new Date().toISOString().slice(0, 10),
      weightKg: parsed,
    });
    setWeightKg('');
    await refresh();
  }

  return (
    <ThemedView style={styles.container}>
      {records.length === 0 && <ThemedText type="default">체중 기록이 없어요.</ThemedText>}
      {records.map((record) => (
        <ThemedView key={record.id} type="backgroundElement" style={styles.row}>
          <ThemedText type="default">{record.weightKg}kg</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {record.measuredAt}
          </ThemedText>
        </ThemedView>
      ))}

      <TextInput
        accessibilityLabel="체중(kg)"
        placeholder="체중 (kg)"
        value={weightKg}
        onChangeText={setWeightKg}
        keyboardType="decimal-pad"
        style={styles.input}
      />
      <Pressable accessibilityLabel="체중 추가" onPress={handleAdd} style={styles.addButton}>
        <ThemedText type="smallBold">추가</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  row: {
    padding: Spacing.two,
    borderRadius: Spacing.two,
    gap: Spacing.half,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: Spacing.one,
    padding: Spacing.two,
  },
  addButton: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    backgroundColor: '#3c87f7',
  },
});
