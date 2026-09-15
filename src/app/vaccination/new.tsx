import { Stack, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { createVaccinationRepository } from '@/db/repositories/vaccination.repository';
import { useAppStore } from '@/stores/app.store';
import { isValidDateString, todayDateString } from '@/utils/date';

export default function NewVaccinationScreen() {
  const db = useSQLiteContext();
  const repository = useMemo(() => createVaccinationRepository(db), [db]);
  const petId = useAppStore((state) => state.selectedPetId);
  const router = useRouter();

  const [vaccineName, setVaccineName] = useState('');
  const [vaccineNameError, setVaccineNameError] = useState('');
  const [vaccinatedAt, setVaccinatedAt] = useState(todayDateString());
  const [vaccinatedAtError, setVaccinatedAtError] = useState('');
  const [nextDueAt, setNextDueAt] = useState('');
  const [nextDueAtError, setNextDueAtError] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [memo, setMemo] = useState('');

  async function handleSave() {
    if (!petId) return;
    if (!vaccineName.trim()) {
      setVaccineNameError('백신 이름을 입력해주세요');
      return;
    }
    if (!isValidDateString(vaccinatedAt.trim())) {
      setVaccinatedAtError('YYYY-MM-DD 형식의 실제 날짜를 입력해주세요');
      return;
    }
    if (nextDueAt.trim() && !isValidDateString(nextDueAt.trim())) {
      setNextDueAtError('YYYY-MM-DD 형식의 실제 날짜를 입력해주세요');
      return;
    }
    await repository.create({
      petId,
      vaccineName,
      vaccinatedAt: vaccinatedAt.trim(),
      nextDueAt: nextDueAt.trim() || null,
      hospitalName: hospitalName.trim() || null,
      memo: memo.trim() || null,
    });
    router.back();
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: '예방접종' }} />
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
          label="접종일"
          value={vaccinatedAt}
          onChangeText={(text) => {
            setVaccinatedAt(text);
            setVaccinatedAtError('');
          }}
          error={vaccinatedAtError}
        />
        <Input
          label="다음 접종 예정일"
          optional
          value={nextDueAt}
          onChangeText={(text) => {
            setNextDueAt(text);
            setNextDueAtError('');
          }}
          error={nextDueAtError}
        />
        <Input label="병원명" optional value={hospitalName} onChangeText={setHospitalName} />
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
