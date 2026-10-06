import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ListItem } from '@/components/list-item';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Spacing } from '@/constants/theme';
import {
  createHospitalExpenseRepository,
  type HospitalExpense,
} from '@/db/repositories/hospital-expense.repository';
import { sumCurrentMonth } from '@/features/hospital-expense/monthly-total';
import { useAppStore } from '@/stores/app.store';

export default function HospitalExpenseScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const selectedPetId = useAppStore((state) => state.selectedPetId);

  const [expenses, setExpenses] = useState<HospitalExpense[]>([]);

  const load = useCallback(async () => {
    if (!selectedPetId) return;
    setExpenses(await createHospitalExpenseRepository(db).listByPet(selectedPetId));
  }, [db, selectedPetId]);

  useFocusEffect(
    useCallback(() => {
      // 등록/수정/삭제 후 돌아왔을 때 최신 목록과 합계를 반영해야 한다.
      void load();
    }, [load]),
  );

  const monthlyTotal = useMemo(() => sumCurrentMonth(expenses), [expenses]);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: '병원비' }} />
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">병원비</ThemedText>
          <Pressable
            accessibilityLabel="병원비 추가"
            onPress={() => router.push('/hospital-expense/new')}
          >
            <Ionicons name="add" size={24} color={Colors.light.primary} />
          </Pressable>
        </ThemedView>

        {expenses.length === 0 ? (
          <EmptyState
            title="등록된 병원비가 없어요."
            description="병원 방문 비용을 기록해 보세요."
            ctaLabel="병원비 추가하기"
            onPressCta={() => router.push('/hospital-expense/new')}
          />
        ) : (
          <>
            <ThemedView style={styles.summaryCard}>
              <ThemedText type="small" themeColor="textSecondary">
                이번 달
              </ThemedText>
              <ThemedText type="heading">{monthlyTotal.toLocaleString('ko-KR')}원</ThemedText>
            </ThemedView>

            <ScrollView>
              {expenses.map((expense) => (
                <ListItem
                  key={expense.id}
                  title={`${expense.amount.toLocaleString('ko-KR')}원`}
                  subtitle={[expense.spentAt, expense.hospitalName, expense.description]
                    .filter(Boolean)
                    .join(' · ')}
                  trailing={
                    <Ionicons name="chevron-forward" size={20} color={Colors.light.textMuted} />
                  }
                  onPress={() => router.push(`/hospital-expense/${expense.id}`)}
                />
              ))}
            </ScrollView>
          </>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.lg, gap: Spacing.md },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryCard: {
    backgroundColor: Colors.light.primaryLight,
    borderRadius: Radius.largeCard,
    padding: Spacing.md,
    gap: Spacing.xxs,
  },
});
