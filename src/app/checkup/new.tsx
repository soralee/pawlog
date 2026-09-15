import { Stack, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { createCheckupRepository } from '@/db/repositories/checkup.repository';
import { useAppStore } from '@/stores/app.store';
import { isValidDateString, todayDateString } from '@/utils/date';

export default function NewCheckupScreen() {
  const db = useSQLiteContext();
  const repository = useMemo(() => createCheckupRepository(db), [db]);
  const petId = useAppStore((state) => state.selectedPetId);
  const router = useRouter();

  const [checkupType, setCheckupType] = useState('');
  const [checkupTypeError, setCheckupTypeError] = useState('');
  const [checkedAt, setCheckedAt] = useState(todayDateString());
  const [checkedAtError, setCheckedAtError] = useState('');
  const [nextDueAt, setNextDueAt] = useState('');
  const [nextDueAtError, setNextDueAtError] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [memo, setMemo] = useState('');

  async function handleSave() {
    if (!petId) return;
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
    await repository.create({
      petId,
      checkupType,
      checkedAt: checkedAt.trim(),
      nextDueAt: nextDueAt.trim() || null,
      hospitalName: hospitalName.trim() || null,
      memo: memo.trim() || null,
    });
    router.back();
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: '건강검진' }} />
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
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, padding: Spacing.lg, gap: Spacing.md },
});
