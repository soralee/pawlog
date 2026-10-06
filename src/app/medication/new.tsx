import { Stack, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { createMedicationRepository } from '@/db/repositories/medication.repository';
import { useAppStore } from '@/stores/app.store';
import { isValidDateString, todayDateString } from '@/utils/date';

export default function NewMedicationScreen() {
  const db = useSQLiteContext();
  const repository = useMemo(() => createMedicationRepository(db), [db]);
  const petId = useAppStore((state) => state.selectedPetId);
  const router = useRouter();

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [startDate, setStartDate] = useState(todayDateString());
  const [startDateError, setStartDateError] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endDateError, setEndDateError] = useState('');
  const [time, setTime] = useState('');
  const [timeError, setTimeError] = useState('');
  const [frequency, setFrequency] = useState('');
  const [frequencyError, setFrequencyError] = useState('');
  const [memo, setMemo] = useState('');

  async function handleSave() {
    if (!petId) return;
    if (!name.trim()) {
      setNameError('이름을 입력해주세요');
      return;
    }
    if (!isValidDateString(startDate.trim())) {
      setStartDateError('YYYY-MM-DD 형식의 실제 날짜를 입력해주세요');
      return;
    }
    if (endDate.trim() && !isValidDateString(endDate.trim())) {
      setEndDateError('YYYY-MM-DD 형식의 실제 날짜를 입력해주세요');
      return;
    }
    if (!time.trim()) {
      setTimeError('복용 시간을 입력해주세요');
      return;
    }
    if (!frequency.trim()) {
      setFrequencyError('복용 주기를 입력해주세요');
      return;
    }
    await repository.create({
      petId,
      name: name.trim(),
      startDate: startDate.trim(),
      endDate: endDate.trim() || null,
      time: time.trim(),
      frequency: frequency.trim(),
      memo: memo.trim() || null,
    });
    router.back();
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: '복약 등록' }} />
      <SafeAreaView style={styles.safeArea}>
        <Input
          label="이름"
          value={name}
          onChangeText={(text) => {
            setName(text);
            setNameError('');
          }}
          error={nameError}
        />
        <Input
          label="복용 시작일"
          value={startDate}
          onChangeText={(text) => {
            setStartDate(text);
            setStartDateError('');
          }}
          error={startDateError}
        />
        <Input
          label="복용 종료일"
          optional
          value={endDate}
          onChangeText={(text) => {
            setEndDate(text);
            setEndDateError('');
          }}
          error={endDateError}
        />
        <Input
          label="복용 시간"
          value={time}
          onChangeText={(text) => {
            setTime(text);
            setTimeError('');
          }}
          error={timeError}
          placeholder="예: 21:00"
        />
        <Input
          label="복용 주기"
          value={frequency}
          onChangeText={(text) => {
            setFrequency(text);
            setFrequencyError('');
          }}
          error={frequencyError}
          placeholder="예: 매일"
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
