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
  createHospitalExpenseRepository,
  type HospitalExpense,
} from '@/db/repositories/hospital-expense.repository';
import { isValidDateString } from '@/utils/date';

export default function HospitalExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const router = useRouter();

  const [record, setRecord] = useState<HospitalExpense | null>(null);
  const [editing, setEditing] = useState(false);
  const [spentAt, setSpentAt] = useState('');
  const [spentAtError, setSpentAtError] = useState('');
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [description, setDescription] = useState('');
  const [memo, setMemo] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);

  const load = useCallback(async () => {
    const repository = createHospitalExpenseRepository(db);
    const found = await repository.get(id);
    setRecord(found);
    if (found) {
      setSpentAt(found.spentAt);
      setAmount(String(found.amount));
      setHospitalName(found.hospitalName ?? '');
      setDescription(found.description ?? '');
      setMemo(found.memo ?? '');
    }
  }, [db, id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SQLite(외부 시스템) 동기화용 마운트 시 fetch
    void load();
  }, [load]);

  async function handleSave() {
    if (!isValidDateString(spentAt.trim())) {
      setSpentAtError('YYYY-MM-DD 형식의 실제 날짜를 입력해주세요');
      return;
    }
    const parsed = Number(amount);
    if (!amount.trim() || Number.isNaN(parsed)) {
      setAmountError('금액을 숫자로 입력해주세요');
      return;
    }
    const repository = createHospitalExpenseRepository(db);
    await repository.update(id, {
      spentAt: spentAt.trim(),
      amount: parsed,
      hospitalName: hospitalName.trim() || null,
      description: description.trim() || null,
      memo: memo.trim() || null,
    });
    setEditing(false);
    await load();
  }

  async function handleDelete() {
    const repository = createHospitalExpenseRepository(db);
    await repository.remove(id);
    setConfirmVisible(false);
    router.back();
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: '병원비',
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
              label="날짜"
              value={spentAt}
              onChangeText={(text) => {
                setSpentAt(text);
                setSpentAtError('');
              }}
              error={spentAtError}
            />
            <Input
              label="금액"
              value={amount}
              onChangeText={(text) => {
                setAmount(text);
                setAmountError('');
              }}
              error={amountError}
              keyboardType="numeric"
            />
            <Input label="병원명" optional value={hospitalName} onChangeText={setHospitalName} />
            <Input
              label="진료/지출 내용"
              optional
              value={description}
              onChangeText={setDescription}
            />
            <Input label="메모" optional value={memo} onChangeText={setMemo} multiline />
            <Button onPress={handleSave}>저장하기</Button>
          </>
        )}
        {record && !editing && (
          <>
            <ThemedText type="heading">{record.amount.toLocaleString('ko-KR')}원</ThemedText>
            <ThemedText type="default">{record.spentAt}</ThemedText>
            {record.hospitalName ? (
              <ThemedText type="default">{record.hospitalName}</ThemedText>
            ) : null}
            {record.description ? (
              <ThemedText type="default">{record.description}</ThemedText>
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
