import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Input } from '@/components/input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import {
  createMedicationRepository,
  type Medication,
} from '@/db/repositories/medication.repository';
import { isValidDateString } from '@/utils/date';

export default function MedicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const router = useRouter();

  const [record, setRecord] = useState<Medication | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startDateError, setStartDateError] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endDateError, setEndDateError] = useState('');
  const [time, setTime] = useState('');
  const [timeError, setTimeError] = useState('');
  const [frequency, setFrequency] = useState('');
  const [frequencyError, setFrequencyError] = useState('');
  const [memo, setMemo] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);

  const load = useCallback(async () => {
    const repository = createMedicationRepository(db);
    const found = await repository.get(id);
    setRecord(found);
    if (found) {
      setName(found.name);
      setStartDate(found.startDate);
      setEndDate(found.endDate ?? '');
      setTime(found.time);
      setFrequency(found.frequency);
      setMemo(found.memo ?? '');
    }
  }, [db, id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SQLite(외부 시스템) 동기화용 마운트 시 fetch
    void load();
  }, [load]);

  async function handleSave() {
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
    const repository = createMedicationRepository(db);
    await repository.update(id, {
      name: name.trim(),
      startDate: startDate.trim(),
      endDate: endDate.trim() || null,
      time: time.trim(),
      frequency: frequency.trim(),
      memo: memo.trim() || null,
    });
    setEditing(false);
    await load();
  }

  async function handleDelete() {
    const repository = createMedicationRepository(db);
    await repository.remove(id);
    setConfirmVisible(false);
    router.back();
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: '복약' }} />
      <SafeAreaView style={styles.safeArea}>
        {record && editing && (
          <>
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
            />
            <Input
              label="복용 주기"
              value={frequency}
              onChangeText={(text) => {
                setFrequency(text);
                setFrequencyError('');
              }}
              error={frequencyError}
            />
            <Input label="메모" optional value={memo} onChangeText={setMemo} multiline />
            <Button onPress={handleSave}>저장하기</Button>
          </>
        )}
        {record && !editing && (
          <>
            <ThemedText type="heading">{record.name}</ThemedText>
            <ThemedText type="default">
              {record.frequency} {record.time}
            </ThemedText>
            <ThemedText type="default">
              {record.startDate} ~ {record.endDate ?? '종료일 미정'}
            </ThemedText>
            {record.memo ? <ThemedText type="default">{record.memo}</ThemedText> : null}
            <Button variant="secondary" onPress={() => setEditing(true)}>
              수정
            </Button>
          </>
        )}
        <Button variant="destructive" onPress={() => setConfirmVisible(true)}>
          복약 삭제
        </Button>
      </SafeAreaView>
      <ConfirmDialog
        visible={confirmVisible}
        title="이 복약을 삭제할까요?"
        description="삭제한 복약 정보는 복구할 수 없어요."
        onConfirm={handleDelete}
        onCancel={() => setConfirmVisible(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, padding: Spacing.lg, gap: Spacing.md },
});
