import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Button } from '@/components/button';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { EmptyState } from '@/components/empty-state';
import { FormScrollContainer } from '@/components/form-scroll-container';
import { Input } from '@/components/input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import {
  createHospitalExpenseRepository,
  type HospitalExpense,
} from '@/db/repositories/hospital-expense.repository';
import { formatDateForDisplay, isValidDateString } from '@/utils/date';

export default function HospitalExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const router = useRouter();

  const [record, setRecord] = useState<HospitalExpense | null | undefined>(undefined);
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
      <FormScrollContainer>
        {record === null ? <EmptyState title="기록을 찾을 수 없어요" /> : null}
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
            <ThemedText type="small" themeColor="textSecondary">
              {formatDateForDisplay(record.spentAt, 'schedule') || '날짜를 설정해 주세요.'}
            </ThemedText>
            <ThemedText type="title">{record.amount.toLocaleString('ko-KR')}원</ThemedText>
            {record.hospitalName ? (
              <ThemedView style={styles.fieldGroup}>
                <ThemedText type="small" themeColor="textSecondary">
                  병원
                </ThemedText>
                <ThemedText type="default">{record.hospitalName}</ThemedText>
              </ThemedView>
            ) : null}
            {record.description ? (
              <ThemedView style={styles.fieldGroup}>
                <ThemedText type="small" themeColor="textSecondary">
                  진료/지출 내용
                </ThemedText>
                <ThemedText type="default">{record.description}</ThemedText>
              </ThemedView>
            ) : null}
            {record.memo ? (
              <ThemedView style={styles.fieldGroup}>
                <ThemedText type="small" themeColor="textSecondary">
                  메모
                </ThemedText>
                <ThemedText type="default">{record.memo}</ThemedText>
              </ThemedView>
            ) : null}
          </>
        )}
        {record ? (
          <ThemedView style={styles.deleteSection}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="기록 삭제"
              onPress={() => setConfirmVisible(true)}
              style={styles.deleteButton}
            >
              <ThemedText type="smallBold" themeColor="danger">
                기록 삭제
              </ThemedText>
            </Pressable>
          </ThemedView>
        ) : null}
      </FormScrollContainer>
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
  fieldGroup: {
    gap: Spacing.xxs,
  },
  deleteSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.divider,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    alignItems: 'center',
  },
  deleteButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
});
