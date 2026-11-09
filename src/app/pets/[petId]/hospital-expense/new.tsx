import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

import { Button } from '@/components/button';
import { FormPetContext } from '@/components/form-pet-context';
import { FormScrollContainer } from '@/components/form-scroll-container';
import { Input } from '@/components/input';
import { ThemedView } from '@/components/themed-view';
import { createHospitalExpenseRepository } from '@/db/repositories/hospital-expense.repository';
import { isValidDateString, todayDateString } from '@/utils/date';

export default function NewHospitalExpenseScreen() {
  const db = useSQLiteContext();
  const repository = useMemo(() => createHospitalExpenseRepository(db), [db]);
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const router = useRouter();

  const [spentAt, setSpentAt] = useState(todayDateString());
  const [spentAtError, setSpentAtError] = useState('');
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [description, setDescription] = useState('');
  const [memo, setMemo] = useState('');

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
    await repository.create({
      petId,
      spentAt: spentAt.trim(),
      amount: parsed,
      hospitalName: hospitalName.trim() || null,
      description: description.trim() || null,
      memo: memo.trim() || null,
    });
    router.back();
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: '병원비 등록' }} />
      <FormScrollContainer>
        <FormPetContext petId={petId} />
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
        <Input label="진료/지출 내용" optional value={description} onChangeText={setDescription} />
        <Input label="메모" optional value={memo} onChangeText={setMemo} multiline />
        <Button onPress={handleSave}>저장하기</Button>
      </FormScrollContainer>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
