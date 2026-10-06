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
  createWeightRecordRepository,
  type WeightRecord,
} from '@/db/repositories/weight-record.repository';
import { isValidDateString } from '@/utils/date';

export default function WeightRecordDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const router = useRouter();

  const [record, setRecord] = useState<WeightRecord | null>(null);
  const [editing, setEditing] = useState(false);
  const [measuredAt, setMeasuredAt] = useState('');
  const [measuredAtError, setMeasuredAtError] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [weightKgError, setWeightKgError] = useState('');
  const [memo, setMemo] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);

  const load = useCallback(async () => {
    const repository = createWeightRecordRepository(db);
    const found = await repository.get(id);
    setRecord(found);
    if (found) {
      setMeasuredAt(found.measuredAt);
      setWeightKg(String(found.weightKg));
      setMemo(found.memo ?? '');
    }
  }, [db, id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SQLite(외부 시스템) 동기화용 마운트 시 fetch
    void load();
  }, [load]);

  async function handleSave() {
    const parsed = Number(weightKg);
    if (!weightKg.trim() || Number.isNaN(parsed)) {
      setWeightKgError('체중을 숫자로 입력해주세요');
      return;
    }
    if (!isValidDateString(measuredAt.trim())) {
      setMeasuredAtError('YYYY-MM-DD 형식의 실제 날짜를 입력해주세요');
      return;
    }
    const repository = createWeightRecordRepository(db);
    await repository.update(id, {
      measuredAt: measuredAt.trim(),
      weightKg: parsed,
      memo: memo.trim() || null,
    });
    setEditing(false);
    await load();
  }

  async function handleDelete() {
    const repository = createWeightRecordRepository(db);
    await repository.remove(id);
    setConfirmVisible(false);
    router.back();
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: '체중',
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
              label="측정일"
              value={measuredAt}
              onChangeText={(text) => {
                setMeasuredAt(text);
                setMeasuredAtError('');
              }}
              error={measuredAtError}
            />
            <Input
              label="체중(kg)"
              value={weightKg}
              onChangeText={(text) => {
                setWeightKg(text);
                setWeightKgError('');
              }}
              error={weightKgError}
              keyboardType="decimal-pad"
            />
            <Input label="메모" optional value={memo} onChangeText={setMemo} multiline />
            <Button onPress={handleSave}>저장하기</Button>
          </>
        )}
        {record && !editing && (
          <>
            <ThemedText type="heading">{record.weightKg}kg</ThemedText>
            <ThemedText type="default">{record.measuredAt}</ThemedText>
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
