import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import {
  createHealthRecordRepository,
  type HealthRecord,
  type HealthRecordDb,
} from '@/db/repositories/health-record.repository';
import { isValidDateString, todayDateString } from '@/utils/date';

type HealthRecordSectionProps = {
  db: HealthRecordDb;
  petId: string;
};

export function HealthRecordSection({ db, petId }: HealthRecordSectionProps) {
  const repository = useMemo(() => createHealthRecordRepository(db), [db]);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [note, setNote] = useState('');
  const [recordedAt, setRecordedAt] = useState(todayDateString());
  const [recordedAtError, setRecordedAtError] = useState('');

  const refresh = useCallback(async () => {
    setRecords(await repository.listByPet(petId));
  }, [petId, repository]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SQLite(외부 시스템) 동기화용 마운트 시 fetch
    void refresh();
  }, [refresh]);

  async function handleAdd() {
    if (!note.trim()) return;
    if (!isValidDateString(recordedAt.trim())) {
      setRecordedAtError('YYYY-MM-DD 형식의 실제 날짜를 입력해주세요');
      return;
    }
    setRecordedAtError('');
    await repository.create({ petId, recordedAt: recordedAt.trim(), note });
    setNote('');
    setRecordedAt(todayDateString());
    await refresh();
  }

  async function handleDelete(id: string) {
    await repository.remove(id);
    await refresh();
  }

  return (
    <ThemedView style={styles.container}>
      {records.length === 0 && <ThemedText type="default">건강 기록이 없어요.</ThemedText>}
      {records.map((record) => (
        <ThemedView key={record.id} type="surface" style={styles.row}>
          <ThemedView style={styles.rowText}>
            <ThemedText type="small" themeColor="textSecondary">
              {record.recordedAt}
            </ThemedText>
            <ThemedText type="default">{record.note}</ThemedText>
          </ThemedView>
          <Pressable
            accessibilityLabel={`${record.note} 삭제`}
            onPress={() => handleDelete(record.id)}
          >
            <ThemedText type="small" themeColor="textSecondary">
              삭제
            </ThemedText>
          </Pressable>
        </ThemedView>
      ))}

      <TextInput
        accessibilityLabel="건강 기록 메모"
        placeholder="오늘 있었던 일을 적어주세요"
        value={note}
        onChangeText={setNote}
        style={styles.input}
      />
      <TextInput
        accessibilityLabel="기록 날짜"
        placeholder="기록 날짜 (YYYY-MM-DD)"
        value={recordedAt}
        onChangeText={(text) => {
          setRecordedAt(text);
          setRecordedAtError('');
        }}
        style={styles.input}
      />
      {recordedAtError !== '' && (
        <ThemedText type="small" themeColor="textSecondary">
          {recordedAtError}
        </ThemedText>
      )}
      <Pressable accessibilityLabel="건강 기록 추가" onPress={handleAdd} style={styles.addButton}>
        <ThemedText type="smallBold">추가</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xs,
    borderRadius: Spacing.xs,
    gap: Spacing.xxs,
  },
  rowText: {
    flex: 1,
    gap: Spacing.xxs,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: Spacing.xxs,
    padding: Spacing.xs,
  },
  addButton: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.xs,
    backgroundColor: '#3c87f7',
  },
});
