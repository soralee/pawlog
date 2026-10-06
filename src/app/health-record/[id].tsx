import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Input } from '@/components/input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import {
  createHealthRecordRepository,
  type HealthRecord,
} from '@/db/repositories/health-record.repository';
import { isValidDateString } from '@/utils/date';

export default function HealthRecordDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const router = useRouter();

  const [record, setRecord] = useState<HealthRecord | null>(null);
  const [editing, setEditing] = useState(false);
  const [recordedAt, setRecordedAt] = useState('');
  const [recordedAtError, setRecordedAtError] = useState('');
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);

  const load = useCallback(async () => {
    const repository = createHealthRecordRepository(db);
    const found = await repository.get(id);
    setRecord(found);
    if (found) {
      setRecordedAt(found.recordedAt);
      setNote(found.note);
    }
  }, [db, id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SQLite(외부 시스템) 동기화용 마운트 시 fetch
    void load();
  }, [load]);

  async function handleSave() {
    if (!note.trim()) {
      setNoteError('메모를 입력해주세요');
      return;
    }
    if (!isValidDateString(recordedAt.trim())) {
      setRecordedAtError('YYYY-MM-DD 형식의 실제 날짜를 입력해주세요');
      return;
    }
    const repository = createHealthRecordRepository(db);
    await repository.update(id, { recordedAt: recordedAt.trim(), note });
    setEditing(false);
    await load();
  }

  async function handleDelete() {
    const repository = createHealthRecordRepository(db);
    await repository.remove(id);
    setConfirmVisible(false);
    router.back();
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: '건강 기록',
          headerRight: () =>
            record && !editing ? (
              <Pressable accessibilityLabel="수정" onPress={() => setEditing(true)}>
                <ThemedText type="default" themeColor="primary">
                  수정
                </ThemedText>
              </Pressable>
            ) : null,
        }}
      />
      <SafeAreaView style={styles.safeArea}>
        {record && editing && (
          <>
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
          </>
        )}
        {record && !editing && (
          <>
            <ThemedText type="heading">{record.recordedAt}</ThemedText>
            <ThemedText type="default">{record.note}</ThemedText>
          </>
        )}
        <Button variant="destructive" onPress={() => setConfirmVisible(true)}>
          기록 삭제
        </Button>
      </SafeAreaView>
      <ConfirmDialog
        visible={confirmVisible}
        title="이 기록을 삭제할까요?"
        description="삭제한 기록은 복구할 수 없어요."
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
