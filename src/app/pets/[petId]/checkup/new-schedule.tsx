import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { createCheckupRepository } from '@/db/repositories/checkup.repository';
import { isValidDateString } from '@/utils/date';

/** "일정" 탭에서 추가하는 건강검진 — 아직 수행하지 않은 예정 일정이다(screen-layout.md §26.1). */
export default function NewCheckupScheduleScreen() {
  const db = useSQLiteContext();
  const repository = useMemo(() => createCheckupRepository(db), [db]);
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const router = useRouter();

  const [checkupType, setCheckupType] = useState('');
  const [checkupTypeError, setCheckupTypeError] = useState('');
  const [nextDueAt, setNextDueAt] = useState('');
  const [nextDueAtError, setNextDueAtError] = useState('');

  async function handleSave() {
    if (!checkupType.trim()) {
      setCheckupTypeError('검진 종류를 입력해주세요');
      return;
    }
    if (!isValidDateString(nextDueAt.trim())) {
      setNextDueAtError('YYYY-MM-DD 형식의 실제 날짜를 입력해주세요');
      return;
    }
    await repository.create({
      petId,
      checkupType,
      nextDueAt: nextDueAt.trim(),
    });
    router.back();
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: '건강검진 일정' }} />
      <SafeAreaView style={styles.safeArea}>
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
        <Button onPress={handleSave}>저장하기</Button>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, padding: Spacing.lg, gap: Spacing.md },
});
