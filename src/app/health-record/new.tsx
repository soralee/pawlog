import { Stack, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { createHealthRecordRepository } from '@/db/repositories/health-record.repository';
import { useAppStore } from '@/stores/app.store';
import { isValidDateString, todayDateString } from '@/utils/date';

export default function NewHealthRecordScreen() {
  const db = useSQLiteContext();
  const repository = useMemo(() => createHealthRecordRepository(db), [db]);
  const petId = useAppStore((state) => state.selectedPetId);
  const router = useRouter();

  const [recordedAt, setRecordedAt] = useState(todayDateString());
  const [recordedAtError, setRecordedAtError] = useState('');
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState('');

  async function handleSave() {
    if (!petId) return;
    if (!note.trim()) {
      setNoteError('메모를 입력해주세요');
      return;
    }
    if (!isValidDateString(recordedAt.trim())) {
      setRecordedAtError('YYYY-MM-DD 형식의 실제 날짜를 입력해주세요');
      return;
    }
    await repository.create({ petId, recordedAt: recordedAt.trim(), note });
    router.back();
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: '건강 기록' }} />
      <SafeAreaView style={styles.safeArea}>
        <Input
          label="기록 날짜"
          value={recordedAt}
          onChangeText={(text) => {
            setRecordedAt(text);
            setRecordedAtError('');
          }}
          error={recordedAtError}
        />
        <Input
          label="메모"
          value={note}
          onChangeText={(text) => {
            setNote(text);
            setNoteError('');
          }}
          error={noteError}
          multiline
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
