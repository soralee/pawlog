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
import { createCheckupRepository, type Checkup } from '@/db/repositories/checkup.repository';
import { isValidDateString } from '@/utils/date';

export default function CheckupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const router = useRouter();

  const [record, setRecord] = useState<Checkup | null>(null);
  const [editing, setEditing] = useState(false);
  const [checkupType, setCheckupType] = useState('');
  const [checkupTypeError, setCheckupTypeError] = useState('');
  const [checkedAt, setCheckedAt] = useState('');
  const [checkedAtError, setCheckedAtError] = useState('');
  const [nextDueAt, setNextDueAt] = useState('');
  const [nextDueAtError, setNextDueAtError] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [memo, setMemo] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);

  const load = useCallback(async () => {
    const repository = createCheckupRepository(db);
    const found = await repository.get(id);
    setRecord(found);
    if (found) {
      setCheckupType(found.checkupType);
      setCheckedAt(found.checkedAt);
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
    if (!checkupType.trim()) {
      setCheckupTypeError('검진 종류를 입력해주세요');
      return;
    }
    if (!isValidDateString(checkedAt.trim())) {
      setCheckedAtError('YYYY-MM-DD 형식의 실제 날짜를 입력해주세요');
      return;
    }
    if (nextDueAt.trim() && !isValidDateString(nextDueAt.trim())) {
      setNextDueAtError('YYYY-MM-DD 형식의 실제 날짜를 입력해주세요');
      return;
    }
    const repository = createCheckupRepository(db);
    await repository.update(id, {
      checkupType,
      checkedAt: checkedAt.trim(),
      nextDueAt: nextDueAt.trim() || null,
      hospitalName: hospitalName.trim() || null,
      memo: memo.trim() || null,
    });
    setEditing(false);
    await load();
  }

  async function handleDelete() {
    const repository = createCheckupRepository(db);
    await repository.remove(id);
    setConfirmVisible(false);
    router.back();
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: '건강검진' }} />
      <SafeAreaView style={styles.safeArea}>
        {record && editing && (
          <>
            <Input
              label="검진 종류"
              value={checkupType}
              onChangeText={(text) => {
                setCheckupType(text);
                setCheckupTypeError('');
              }}
              error={checkupTypeError}
            />
            <Input
              label="검진일"
              value={checkedAt}
              onChangeText={(text) => {
                setCheckedAt(text);
                setCheckedAtError('');
              }}
              error={checkedAtError}
            />
            <Input
              label="다음 검진 예정일"
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
            <ThemedText type="heading">{record.checkupType}</ThemedText>
            <ThemedText type="default">검진일 {record.checkedAt}</ThemedText>
            {record.nextDueAt ? (
              <ThemedText type="default">다음 예정일 {record.nextDueAt}</ThemedText>
            ) : null}
            {record.hospitalName ? (
              <ThemedText type="default">{record.hospitalName}</ThemedText>
            ) : null}
            {record.memo ? <ThemedText type="default">{record.memo}</ThemedText> : null}
            <Button variant="secondary" onPress={() => setEditing(true)}>
              수정
            </Button>
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
