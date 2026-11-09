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
  createHealthRecordRepository,
  type HealthRecord,
} from '@/db/repositories/health-record.repository';
import { formatDateForDisplay, isValidDateString } from '@/utils/date';

export default function HealthRecordDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const router = useRouter();

  const [record, setRecord] = useState<HealthRecord | null | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [recordedAt, setRecordedAt] = useState('');
  const [recordedAtError, setRecordedAtError] = useState('');
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);

  const load = useCallback(async () => {
    const repository = createHealthRecordRepository(db);
    const found = await repository.get(id);
    setRecord(found);
    if (found) {
      setRecordedAt(found.recordedAt);
      setNote(found.note);
    }
  }, [db, id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SQLite(외부 시스템) 동기화용 마운트 시 fetch
    void load();
  }, [load]);

  async function handleSave() {
    if (!note.trim()) {
      setNoteError('메모를 입력해주세요');
      return;
    }
    if (!isValidDateString(recordedAt.trim())) {
      setRecordedAtError('YYYY-MM-DD 형식의 실제 날짜를 입력해주세요');
      return;
    }
    const repository = createHealthRecordRepository(db);
    await repository.update(id, { recordedAt: recordedAt.trim(), note });
    setEditing(false);
    await load();
  }

  async function handleDelete() {
    const repository = createHealthRecordRepository(db);
    await repository.remove(id);
    setConfirmVisible(false);
    router.back();
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: '건강 기록',
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
              label="기록 날짜"
              value={recordedAt}
              onChangeText={(text) => {
                setRecordedAt(text);
                setRecordedAtError('');
              }}
              error={recordedAtError}
            />
            <Input
              label="메모"
              value={note}
              onChangeText={(text) => {
                setNote(text);
                setNoteError('');
              }}
              error={noteError}
              multiline
            />
            <Button onPress={handleSave}>저장하기</Button>
          </>
        )}
        {record && !editing && (
          <>
            <ThemedText type="small" themeColor="textSecondary">
              {formatDateForDisplay(record.recordedAt, 'schedule') || '날짜를 설정해 주세요.'}
            </ThemedText>
            <ThemedText type="title">건강 기록</ThemedText>
            <ThemedView style={styles.fieldGroup}>
              <ThemedText type="small" themeColor="textSecondary">
                메모
              </ThemedText>
              <ThemedText type="default">{record.note}</ThemedText>
            </ThemedView>
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
