import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { DDayChip } from '@/components/d-day-chip';
import { Input } from '@/components/input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import {
  createVaccinationRepository,
  type Vaccination,
} from '@/db/repositories/vaccination.repository';
import { daysUntil, isValidDateString } from '@/utils/date';

type Mode = 'view' | 'editing' | 'completing';

export default function VaccinationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const router = useRouter();

  const [record, setRecord] = useState<Vaccination | null>(null);
  const [mode, setMode] = useState<Mode>('view');

  const [vaccineName, setVaccineName] = useState('');
  const [vaccineNameError, setVaccineNameError] = useState('');
  const [vaccinatedAt, setVaccinatedAt] = useState('');
  const [vaccinatedAtError, setVaccinatedAtError] = useState('');
  const [nextDueAt, setNextDueAt] = useState('');
  const [nextDueAtError, setNextDueAtError] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [memo, setMemo] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);

  const load = useCallback(async () => {
    const repository = createVaccinationRepository(db);
    const found = await repository.get(id);
    setRecord(found);
    if (found) {
      setVaccineName(found.vaccineName);
      setVaccinatedAt(found.vaccinatedAt ?? '');
      setNextDueAt(found.nextDueAt ?? '');
      setHospitalName(found.hospitalName ?? '');
      setMemo(found.memo ?? '');
    }
  }, [db, id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SQLite(외부 시스템) 동기화용 마운트 시 fetch
    void load();
  }, [load]);

  const isScheduleOnly = !!record && !record.vaccinatedAt;

  async function handleSaveSchedule() {
    if (!vaccineName.trim()) {
      setVaccineNameError('백신 이름을 입력해주세요');
      return;
    }
    if (!isValidDateString(nextDueAt.trim())) {
      setNextDueAtError('YYYY-MM-DD 형식의 실제 날짜를 입력해주세요');
      return;
    }
    const repository = createVaccinationRepository(db);
    await repository.update(id, { vaccineName, nextDueAt: nextDueAt.trim() });
    setMode('view');
    await load();
  }

  async function handleComplete() {
    const trimmedDate = vaccinatedAt.trim();
    if (!isValidDateString(trimmedDate)) {
      setVaccinatedAtError('YYYY-MM-DD 형식의 실제 날짜를 입력해주세요');
      return;
    }
    const repository = createVaccinationRepository(db);
    await repository.update(id, {
      vaccinatedAt: trimmedDate,
      hospitalName: hospitalName.trim() || null,
      memo: memo.trim() || null,
    });
    setMode('view');
    await load();
  }

  async function handleSaveCompleted() {
    if (!vaccineName.trim()) {
      setVaccineNameError('백신 이름을 입력해주세요');
      return;
    }
    const trimmedDate = vaccinatedAt.trim();
    if (!isValidDateString(trimmedDate)) {
      setVaccinatedAtError('YYYY-MM-DD 형식의 실제 날짜를 입력해주세요');
      return;
    }
    const repository = createVaccinationRepository(db);
    await repository.update(id, {
      vaccineName,
      vaccinatedAt: trimmedDate,
      hospitalName: hospitalName.trim() || null,
      memo: memo.trim() || null,
    });
    setMode('view');
    await load();
  }

  async function handleDelete() {
    const repository = createVaccinationRepository(db);
    await repository.remove(id);
    setConfirmVisible(false);
    router.back();
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: isScheduleOnly ? '예방접종 일정' : '예방접종 기록',
          headerRight: () =>
            record && mode === 'view' ? (
              <Pressable accessibilityLabel="수정" onPress={() => setMode('editing')}>
                <ThemedText type="default" themeColor="primary">
                  수정
                </ThemedText>
              </Pressable>
            ) : null,
        }}
      />
      <SafeAreaView style={styles.safeArea}>
        {record && isScheduleOnly && mode === 'view' && (
          <>
            <ThemedText type="heading">{record.vaccineName}</ThemedText>
            <ThemedView style={styles.row}>
              <ThemedText type="default">예정일 {record.nextDueAt}</ThemedText>
              {record.nextDueAt ? <DDayChip daysUntil={daysUntil(record.nextDueAt)} /> : null}
            </ThemedView>
            <Button onPress={() => setMode('completing')}>완료하기</Button>
          </>
        )}

        {record && isScheduleOnly && mode === 'editing' && (
          <>
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
            <Button onPress={handleSaveSchedule}>저장하기</Button>
          </>
        )}

        {record && isScheduleOnly && mode === 'completing' && (
          <>
            <ThemedText type="heading">접종을 완료했나요?</ThemedText>
            <Input
              label="실제 접종일"
              value={vaccinatedAt}
              onChangeText={(text) => {
                setVaccinatedAt(text);
                setVaccinatedAtError('');
              }}
              error={vaccinatedAtError}
            />
            <Input label="병원명" optional value={hospitalName} onChangeText={setHospitalName} />
            <Input label="메모" optional value={memo} onChangeText={setMemo} multiline />
            <Button onPress={handleComplete}>완료하고 기록하기</Button>
          </>
        )}

        {record && !isScheduleOnly && mode === 'view' && (
          <>
            <ThemedText type="heading">{record.vaccineName}</ThemedText>
            <ThemedText type="default">접종일 {record.vaccinatedAt}</ThemedText>
            {record.hospitalName ? (
              <ThemedText type="default">{record.hospitalName}</ThemedText>
            ) : null}
            {record.memo ? <ThemedText type="default">{record.memo}</ThemedText> : null}
          </>
        )}

        {record && !isScheduleOnly && mode === 'editing' && (
          <>
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
              label="실제 접종일"
              value={vaccinatedAt}
              onChangeText={(text) => {
                setVaccinatedAt(text);
                setVaccinatedAtError('');
              }}
              error={vaccinatedAtError}
            />
            <Input label="병원명" optional value={hospitalName} onChangeText={setHospitalName} />
            <Input label="메모" optional value={memo} onChangeText={setMemo} multiline />
            <Button onPress={handleSaveCompleted}>저장하기</Button>
          </>
        )}

        <Button variant="destructive" onPress={() => setConfirmVisible(true)}>
          {isScheduleOnly ? '일정 삭제' : '기록 삭제'}
        </Button>
      </SafeAreaView>
      <ConfirmDialog
        visible={confirmVisible}
        title={isScheduleOnly ? '이 일정을 삭제할까요?' : '이 기록을 삭제할까요?'}
        description="삭제한 내용은 복구할 수 없어요."
        onConfirm={handleDelete}
        onCancel={() => setConfirmVisible(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, padding: Spacing.lg, gap: Spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
