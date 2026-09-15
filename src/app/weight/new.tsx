import { Stack, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { createWeightRecordRepository } from '@/db/repositories/weight-record.repository';
import { useAppStore } from '@/stores/app.store';
import { isValidDateString, todayDateString } from '@/utils/date';

export default function NewWeightRecordScreen() {
  const db = useSQLiteContext();
  const repository = useMemo(() => createWeightRecordRepository(db), [db]);
  const petId = useAppStore((state) => state.selectedPetId);
  const router = useRouter();

  const [measuredAt, setMeasuredAt] = useState(todayDateString());
  const [measuredAtError, setMeasuredAtError] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [weightKgError, setWeightKgError] = useState('');
  const [memo, setMemo] = useState('');

  async function handleSave() {
    if (!petId) return;
    const parsed = Number(weightKg);
    if (!weightKg.trim() || Number.isNaN(parsed)) {
      setWeightKgError('체중을 숫자로 입력해주세요');
      return;
    }
    if (!isValidDateString(measuredAt.trim())) {
      setMeasuredAtError('YYYY-MM-DD 형식의 실제 날짜를 입력해주세요');
      return;
    }
    await repository.create({
      petId,
      measuredAt: measuredAt.trim(),
      weightKg: parsed,
      memo: memo.trim() || null,
    });
    router.back();
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: '체중' }} />
      <SafeAreaView style={styles.safeArea}>
        <Input
          label="측정일"
          value={measuredAt}
          onChangeText={(text) => {
            setMeasuredAt(text);
            setMeasuredAtError('');
          }}
          error={measuredAtError}
        />
        <Input
          label="체중(kg)"
          value={weightKg}
          onChangeText={(text) => {
            setWeightKg(text);
            setWeightKgError('');
          }}
          error={weightKgError}
          keyboardType="decimal-pad"
        />
        <Input label="메모" optional value={memo} onChangeText={setMemo} multiline />
        <Button onPress={handleSave}>저장하기</Button>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, padding: Spacing.lg, gap: Spacing.md },
});
