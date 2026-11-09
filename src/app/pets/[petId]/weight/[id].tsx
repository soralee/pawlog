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
  createWeightRecordRepository,
  type WeightRecord,
} from '@/db/repositories/weight-record.repository';
import { formatDateForDisplay, isValidDateString } from '@/utils/date';

export default function WeightRecordDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const router = useRouter();

  const [record, setRecord] = useState<WeightRecord | null | undefined>(undefined);
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
      <FormScrollContainer>
        {record === null ? <EmptyState title="기록을 찾을 수 없어요" /> : null}
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
            <ThemedText type="small" themeColor="textSecondary">
              {formatDateForDisplay(record.measuredAt, 'schedule') || '날짜를 설정해 주세요.'}
            </ThemedText>
            <ThemedText type="title">{record.weightKg}kg</ThemedText>
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
