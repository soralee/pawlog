import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import {
  createVaccinationRepository,
  type Vaccination,
  type VaccinationDb,
} from '@/db/repositories/vaccination.repository';
import { isValidDateString, todayDateString } from '@/utils/date';

type VaccinationSectionProps = {
  db: VaccinationDb;
  petId: string;
};

export function VaccinationSection({ db, petId }: VaccinationSectionProps) {
  const repository = useMemo(() => createVaccinationRepository(db), [db]);
  const [records, setRecords] = useState<Vaccination[]>([]);
  const [vaccineName, setVaccineName] = useState('');
  const [vaccinatedAt, setVaccinatedAt] = useState(todayDateString());
  const [vaccinatedAtError, setVaccinatedAtError] = useState('');
  const [nextDueAt, setNextDueAt] = useState('');
  const [nextDueAtError, setNextDueAtError] = useState('');

  const refresh = useCallback(async () => {
    setRecords(await repository.listByPet(petId));
  }, [petId, repository]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SQLite(외부 시스템) 동기화용 마운트 시 fetch
    void refresh();
  }, [refresh]);

  async function handleAdd() {
    if (!vaccineName.trim()) return;
    if (!isValidDateString(vaccinatedAt.trim())) {
      setVaccinatedAtError('YYYY-MM-DD 형식의 실제 날짜를 입력해주세요');
      return;
    }
    if (nextDueAt.trim() && !isValidDateString(nextDueAt.trim())) {
      setNextDueAtError('YYYY-MM-DD 형식의 실제 날짜를 입력해주세요');
      return;
    }
    setVaccinatedAtError('');
    setNextDueAtError('');
    await repository.create({
      petId,
      vaccineName,
      vaccinatedAt: vaccinatedAt.trim(),
      nextDueAt: nextDueAt.trim() || null,
    });
    setVaccineName('');
    setVaccinatedAt(todayDateString());
    setNextDueAt('');
    await refresh();
  }

  async function handleDelete(id: string) {
    await repository.remove(id);
    await refresh();
  }

  return (
    <ThemedView style={styles.container}>
      {records.length === 0 && <ThemedText type="default">예방접종 기록이 없어요.</ThemedText>}
      {records.map((record) => (
        <ThemedView key={record.id} type="backgroundElement" style={styles.row}>
          <ThemedView style={styles.rowText}>
            <ThemedText type="default">{record.vaccineName}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              접종일 {record.vaccinatedAt}
              {record.nextDueAt ? ` · 다음 예정일 ${record.nextDueAt}` : ''}
            </ThemedText>
          </ThemedView>
          <Pressable
            accessibilityLabel={`${record.vaccineName} 삭제`}
            onPress={() => handleDelete(record.id)}
          >
            <ThemedText type="small" themeColor="textSecondary">
              삭제
            </ThemedText>
          </Pressable>
        </ThemedView>
      ))}

      <TextInput
        accessibilityLabel="백신 이름"
        placeholder="백신 이름 (예: 종합백신)"
        value={vaccineName}
        onChangeText={setVaccineName}
        style={styles.input}
      />
      <TextInput
        accessibilityLabel="접종일"
        placeholder="접종일 (YYYY-MM-DD)"
        value={vaccinatedAt}
        onChangeText={(text) => {
          setVaccinatedAt(text);
          setVaccinatedAtError('');
        }}
        style={styles.input}
      />
      {vaccinatedAtError !== '' && (
        <ThemedText type="small" themeColor="textSecondary">
          {vaccinatedAtError}
        </ThemedText>
      )}
      <TextInput
        accessibilityLabel="다음 접종 예정일"
        placeholder="다음 접종 예정일 (YYYY-MM-DD, 선택)"
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
      <Pressable accessibilityLabel="예방접종 추가" onPress={handleAdd} style={styles.addButton}>
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
