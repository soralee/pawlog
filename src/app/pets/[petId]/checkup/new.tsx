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
import { isValidDateString, todayDateString } from '@/utils/date';

/** "기록" 탭에서 추가하는 건강검진 — 이미 검진을 완료한 기록이다(screen-layout.md §26.2). */
export default function NewCheckupScreen() {
  const db = useSQLiteContext();
  const repository = useMemo(() => createCheckupRepository(db), [db]);
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const router = useRouter();

  const [checkupType, setCheckupType] = useState('');
  const [checkupTypeError, setCheckupTypeError] = useState('');
  const [checkedAt, setCheckedAt] = useState(todayDateString());
  const [checkedAtError, setCheckedAtError] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [memo, setMemo] = useState('');

  async function handleSave() {
    if (!checkupType.trim()) {
      setCheckupTypeError('검진 종류를 입력해주세요');
      return;
    }
    const trimmedDate = checkedAt.trim();
    if (!isValidDateString(trimmedDate)) {
      setCheckedAtError('YYYY-MM-DD 형식의 실제 날짜를 입력해주세요');
      return;
    }
    if (trimmedDate > todayDateString()) {
      setCheckedAtError(
        '미래 날짜는 기록으로 저장할 수 없어요. 예정이라면 "일정" 탭에서 등록해주세요.',
      );
      return;
    }
    await repository.create({
      petId,
      checkupType,
      checkedAt: trimmedDate,
      hospitalName: hospitalName.trim() || null,
      memo: memo.trim() || null,
    });
    router.back();
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: '건강검진 기록' }} />
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
        <Button onPress={handleSave}>저장하기</Button>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, padding: Spacing.lg, gap: Spacing.md },
});
