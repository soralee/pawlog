import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

import { Button } from '@/components/button';
import { FormPetContext } from '@/components/form-pet-context';
import { FormScrollContainer } from '@/components/form-scroll-container';
import { Input } from '@/components/input';
import { ThemedView } from '@/components/themed-view';
import { createHealthRecordRepository } from '@/db/repositories/health-record.repository';
import { isValidDateString, todayDateString } from '@/utils/date';

export default function NewHealthRecordScreen() {
  const db = useSQLiteContext();
  const repository = useMemo(() => createHealthRecordRepository(db), [db]);
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const router = useRouter();

  const [recordedAt, setRecordedAt] = useState(todayDateString());
  const [recordedAtError, setRecordedAtError] = useState('');
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState('');

  async function handleSave() {
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
      <FormScrollContainer>
        <FormPetContext petId={petId} />
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
      </FormScrollContainer>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
