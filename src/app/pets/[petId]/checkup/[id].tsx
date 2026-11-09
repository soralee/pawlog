import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Button } from '@/components/button';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { DDayChip } from '@/components/d-day-chip';
import { EmptyState } from '@/components/empty-state';
import { FormScrollContainer } from '@/components/form-scroll-container';
import { Input } from '@/components/input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { createCheckupRepository, type Checkup } from '@/db/repositories/checkup.repository';
import {
  completeSchedule,
  SCHEDULE_COMPLETION_ERROR_MESSAGES,
} from '@/features/schedule/complete-schedule';
import { daysUntil, formatDateForDisplay, isValidDateString, todayDateString } from '@/utils/date';

type Mode = 'view' | 'editing' | 'completing';

export default function CheckupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const router = useRouter();

  const [record, setRecord] = useState<Checkup | null | undefined>(undefined);
  const [mode, setMode] = useState<Mode>('view');

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
      const today = todayDateString();
      const defaultCompletionDate =
        found.nextDueAt && found.nextDueAt > today ? today : (found.nextDueAt ?? '');
      // 완료하기 폼의 실제 검진일은 예정일이 오늘 이후면 오늘, 아니면 예정일을 기본값으로 보여준다.
      setCheckedAt(found.checkedAt ?? defaultCompletionDate);
      setNextDueAt(found.nextDueAt ?? '');
      setHospitalName(found.hospitalName ?? '');
      setMemo(found.memo ?? '');
    }
  }, [db, id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SQLite(외부 시스템) 동기화용 마운트 시 fetch
    void load();
  }, [load]);

  const isScheduleOnly = !!record && !record.checkedAt;

  async function handleSaveSchedule() {
    if (!checkupType.trim()) {
      setCheckupTypeError('검진 종류를 입력해주세요');
      return;
    }
    if (!isValidDateString(nextDueAt.trim())) {
      setNextDueAtError('YYYY-MM-DD 형식의 실제 날짜를 입력해주세요');
      return;
    }
    const repository = createCheckupRepository(db);
    await repository.update(id, { checkupType, nextDueAt: nextDueAt.trim() });
    setMode('view');
    await load();
  }

  async function handleComplete() {
    const trimmedDate = checkedAt.trim();
    const completion = completeSchedule(Boolean(record?.checkedAt), trimmedDate);
    if (!completion.canComplete || !completion.completionDate) {
      setCheckedAtError(SCHEDULE_COMPLETION_ERROR_MESSAGES[completion.reason ?? 'invalid-date']);
      return;
    }
    const repository = createCheckupRepository(db);
    await repository.update(id, {
      checkedAt: completion.completionDate,
      hospitalName: hospitalName.trim() || null,
      memo: memo.trim() || null,
    });
    setMode('view');
    await load();
  }

  async function handleSaveCompleted() {
    if (!checkupType.trim()) {
      setCheckupTypeError('검진 종류를 입력해주세요');
      return;
    }
    const trimmedDate = checkedAt.trim();
    if (!isValidDateString(trimmedDate)) {
      setCheckedAtError('YYYY-MM-DD 형식의 실제 날짜를 입력해주세요');
      return;
    }
    const repository = createCheckupRepository(db);
    await repository.update(id, {
      checkupType,
      checkedAt: trimmedDate,
      hospitalName: hospitalName.trim() || null,
      memo: memo.trim() || null,
    });
    setMode('view');
    await load();
  }

  async function handleDelete() {
    const repository = createCheckupRepository(db);
    await repository.remove(id);
    setConfirmVisible(false);
    router.back();
  }

  const deleteLabel = isScheduleOnly ? '일정 삭제' : '기록 삭제';
  const remainingDays = record?.nextDueAt ? daysUntil(record.nextDueAt) : null;
  const formattedNextDue = record?.nextDueAt
    ? formatDateForDisplay(record.nextDueAt, 'schedule')
    : '';
  const formattedCheckedAt = record?.checkedAt
    ? formatDateForDisplay(record.checkedAt, 'schedule')
    : '';

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: isScheduleOnly ? '건강검진 일정' : '건강검진 기록',
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
      <FormScrollContainer>
        {record === null ? <EmptyState title="기록을 찾을 수 없어요" /> : null}
        {record && isScheduleOnly && mode === 'view' && (
          <>
            <ThemedText type="small" themeColor="textSecondary">
              {formattedNextDue || '날짜를 설정해 주세요.'}
            </ThemedText>
            <ThemedView style={styles.row}>
              <ThemedText type="title">{record.checkupType}</ThemedText>
              {remainingDays !== null ? <DDayChip daysUntil={remainingDays} /> : null}
            </ThemedView>
            <Button onPress={() => setMode('completing')}>완료하기</Button>
          </>
        )}

        {record && isScheduleOnly && mode === 'editing' && (
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
            <ThemedText type="heading">검진을 완료했나요?</ThemedText>
            <Input
              label="실제 검진일"
              value={checkedAt}
              onChangeText={(text) => {
                setCheckedAt(text);
                setCheckedAtError('');
              }}
              error={checkedAtError}
            />
            <Input label="병원명" optional value={hospitalName} onChangeText={setHospitalName} />
            <Input label="메모" optional value={memo} onChangeText={setMemo} multiline />
            <Button onPress={handleComplete}>완료하고 기록하기</Button>
          </>
        )}

        {record && !isScheduleOnly && mode === 'view' && (
          <>
            <ThemedText type="small" themeColor="textSecondary">
              {formattedCheckedAt || '날짜를 설정해 주세요.'}
            </ThemedText>
            <ThemedText type="title">{record.checkupType}</ThemedText>
            {record.hospitalName ? (
              <ThemedView style={styles.fieldGroup}>
                <ThemedText type="small" themeColor="textSecondary">
                  병원
                </ThemedText>
                <ThemedText type="default">{record.hospitalName}</ThemedText>
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

        {record && !isScheduleOnly && mode === 'editing' && (
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
              label="실제 검진일"
              value={checkedAt}
              onChangeText={(text) => {
                setCheckedAt(text);
                setCheckedAtError('');
              }}
              error={checkedAtError}
            />
            <Input label="병원명" optional value={hospitalName} onChangeText={setHospitalName} />
            <Input label="메모" optional value={memo} onChangeText={setMemo} multiline />
            <Button onPress={handleSaveCompleted}>저장하기</Button>
          </>
        )}

        {record ? (
          <ThemedView style={styles.deleteSection}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={deleteLabel}
              onPress={() => setConfirmVisible(true)}
              style={styles.deleteButton}
            >
              <ThemedText type="smallBold" themeColor="danger">
                {deleteLabel}
              </ThemedText>
            </Pressable>
          </ThemedView>
        ) : null}
      </FormScrollContainer>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
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
