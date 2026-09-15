import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import {
  createCheckupRepository,
  type Checkup,
  type CheckupDb,
} from '@/db/repositories/checkup.repository';
import { isValidDateString } from '@/utils/date';

type CheckupSectionProps = {
  db: CheckupDb;
  petId: string;
};

export function CheckupSection({ db, petId }: CheckupSectionProps) {
  const repository = useMemo(() => createCheckupRepository(db), [db]);
  const [records, setRecords] = useState<Checkup[]>([]);
  const [checkupType, setCheckupType] = useState('');
  const [nextDueAt, setNextDueAt] = useState('');
  const [nextDueAtError, setNextDueAtError] = useState('');

  const refresh = useCallback(async () => {
    setRecords(await repository.listByPet(petId));
  }, [petId, repository]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SQLite(외부 시스템) 동기화용 마운트 시 fetch
    refresh();
  }, [refresh]);

  async function handleAdd() {
    if (!checkupType.trim()) return;
    if (nextDueAt.trim() && !isValidDateString(nextDueAt.trim())) {
      setNextDueAtError('YYYY-MM-DD 형식의 실제 날짜를 입력해주세요');
      return;
    }
    setNextDueAtError('');
    await repository.create({
      petId,
      checkupType,
      checkedAt: new Date().toISOString().slice(0, 10),
      nextDueAt: nextDueAt.trim() || null,
    });
    setCheckupType('');
    setNextDueAt('');
    await refresh();
  }

  async function handleDelete(id: string) {
    await repository.remove(id);
    await refresh();
  }

  return (
    <ThemedView style={styles.container}>
      {records.length === 0 && <ThemedText type="default">건강검진 기록이 없어요.</ThemedText>}
      {records.map((record) => (
        <ThemedView key={record.id} type="backgroundElement" style={styles.row}>
          <ThemedView style={styles.rowText}>
            <ThemedText type="default">{record.checkupType}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              검진일 {record.checkedAt}
              {record.nextDueAt ? ` · 다음 예정일 ${record.nextDueAt}` : ''}
            </ThemedText>
          </ThemedView>
          <Pressable
            accessibilityLabel={`${record.checkupType} 삭제`}
            onPress={() => handleDelete(record.id)}
          >
            <ThemedText type="small" themeColor="textSecondary">
              삭제
            </ThemedText>
          </Pressable>
        </ThemedView>
      ))}

      <TextInput
        accessibilityLabel="검진 종류"
        placeholder="검진 종류 (예: 종합검진, 심장사상충 검사)"
        value={checkupType}
        onChangeText={setCheckupType}
        style={styles.input}
      />
      <TextInput
        accessibilityLabel="다음 검진 예정일"
        placeholder="다음 검진 예정일 (YYYY-MM-DD, 선택)"
        value={nextDueAt}
        onChangeText={(text) => {
          setNextDueAt(text);
          setNextDueAtError('');
        }}
        style={styles.input}
      />
      {nextDueAtError !== '' && (
        <ThemedText type="small" themeColor="textSecondary">
          {nextDueAtError}
        </ThemedText>
      )}
      <Pressable accessibilityLabel="건강검진 추가" onPress={handleAdd} style={styles.addButton}>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.two,
    borderRadius: Spacing.two,
    gap: Spacing.half,
  },
  rowText: {
    flex: 1,
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
