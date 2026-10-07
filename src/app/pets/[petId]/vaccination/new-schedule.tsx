import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { createVaccinationRepository } from '@/db/repositories/vaccination.repository';
import { isValidDateString } from '@/utils/date';

/** "일정" 탭에서 추가하는 예방접종 — 아직 수행하지 않은 예정 일정이다(screen-layout.md §26.1). */
export default function NewVaccinationScheduleScreen() {
  const db = useSQLiteContext();
  const repository = useMemo(() => createVaccinationRepository(db), [db]);
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const router = useRouter();

  const [vaccineName, setVaccineName] = useState('');
  const [vaccineNameError, setVaccineNameError] = useState('');
  const [nextDueAt, setNextDueAt] = useState('');
  const [nextDueAtError, setNextDueAtError] = useState('');

  async function handleSave() {
    if (!vaccineName.trim()) {
      setVaccineNameError('백신 이름을 입력해주세요');
      return;
    }
    if (!isValidDateString(nextDueAt.trim())) {
      setNextDueAtError('YYYY-MM-DD 형식의 실제 날짜를 입력해주세요');
      return;
    }
    await repository.create({
      petId,
      vaccineName,
      nextDueAt: nextDueAt.trim(),
    });
    router.back();
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: '예방접종 일정' }} />
      <SafeAreaView style={styles.safeArea}>
        <Input
          label="백신 이름"
          value={vaccineName}
          onChangeText={(text) => {
            setVaccineName(text);
            setVaccineNameError('');
          }}
          error={vaccineNameError}
        />
        <Input
          label="예정일"
          value={nextDueAt}
          onChangeText={(text) => {
            setNextDueAt(text);
            setNextDueAtError('');
          }}
          error={nextDueAtError}
        />
        <Button onPress={handleSave}>저장하기</Button>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, padding: Spacing.lg, gap: Spacing.md },
});
