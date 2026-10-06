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
  createVaccinationRepository,
  type Vaccination,
} from '@/db/repositories/vaccination.repository';
import { isValidDateString } from '@/utils/date';

export default function VaccinationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const router = useRouter();

  const [record, setRecord] = useState<Vaccination | null>(null);
  const [editing, setEditing] = useState(false);
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
      setVaccinatedAt(found.vaccinatedAt);
      setNextDueAt(found.nextDueAt ?? '');
      setHospitalName(found.hospitalName ?? '');
      setMemo(found.memo ?? '');
    }
  }, [db, id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SQLite(외부 시스템) 동기화용 마운트 시 fetch
    void load();
  }, [load]);

  async function handleSave() {
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
    const repository = createVaccinationRepository(db);
    await repository.update(id, {
      vaccineName,
      vaccinatedAt: vaccinatedAt.trim(),
      nextDueAt: nextDueAt.trim() || null,
      hospitalName: hospitalName.trim() || null,
      memo: memo.trim() || null,
    });
    setEditing(false);
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
          title: '예방접종',
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
          </>
        )}
        {record && !editing && (
          <>
            <ThemedText type="heading">{record.vaccineName}</ThemedText>
            <ThemedText type="default">접종일 {record.vaccinatedAt}</ThemedText>
            {record.nextDueAt ? (
              <ThemedText type="default">다음 예정일 {record.nextDueAt}</ThemedText>
            ) : null}
            {record.hospitalName ? (
              <ThemedText type="default">{record.hospitalName}</ThemedText>
            ) : null}
            {record.memo ? <ThemedText type="default">{record.memo}</ThemedText> : null}
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
