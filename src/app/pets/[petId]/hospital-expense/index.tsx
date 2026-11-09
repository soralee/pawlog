import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomActionBar } from '@/components/bottom-action-bar';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { EmptyState } from '@/components/empty-state';
import { ListItem } from '@/components/list-item';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import {
  createHospitalExpenseRepository,
  type HospitalExpense,
} from '@/db/repositories/hospital-expense.repository';
import { sumCurrentMonth } from '@/features/hospital-expense/monthly-total';
import { formatDateForDisplay, todayDateString } from '@/utils/date';

export default function HospitalExpenseScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { petId } = useLocalSearchParams<{ petId: string }>();

  const [expenses, setExpenses] = useState<HospitalExpense[]>([]);

  const load = useCallback(async () => {
    setExpenses(await createHospitalExpenseRepository(db).listByPet(petId));
  }, [db, petId]);

  useFocusEffect(
    useCallback(() => {
      // 등록/수정/삭제 후 돌아왔을 때 최신 목록과 합계를 반영해야 한다.
      void load();
    }, [load]),
  );

  const monthlyTotal = useMemo(() => sumCurrentMonth(expenses), [expenses]);
  const currentMonthLabel = `${Number(todayDateString().split('-')[1])}월`;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: '병원비' }} />
      <SafeAreaView style={styles.safeArea}>
        {expenses.length === 0 ? (
          <EmptyState
            icon="wallet-outline"
            title="등록된 병원비가 없어요."
            description="병원 방문 비용을 기록해 보세요."
            ctaLabel="병원비 추가하기"
            onPressCta={() => router.push(`/pets/${petId}/hospital-expense/new`)}
          />
        ) : (
          <>
            <Card style={styles.summaryCard}>
              <ThemedText type="small" themeColor="textSecondary">
                이번 달 병원비
              </ThemedText>
              <ThemedText type="display">{monthlyTotal.toLocaleString('ko-KR')}원</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {currentMonthLabel}
              </ThemedText>
            </Card>

            <ScrollView contentContainerStyle={styles.scrollContent}>
              {expenses.map((expense, i) => (
                <ListItem
                  key={expense.id}
                  leadingText={formatDateForDisplay(expense.spentAt, 'list')}
                  title={expense.hospitalName || expense.description || '병원비'}
                  subtitle={
                    expense.hospitalName && expense.description ? expense.description : undefined
                  }
                  trailingText={`${expense.amount.toLocaleString('ko-KR')}원`}
                  trailing={
                    <Ionicons name="chevron-forward" size={20} color={Colors.light.textMuted} />
                  }
                  onPress={() => router.push(`/pets/${petId}/hospital-expense/${expense.id}`)}
                  showDivider={i < expenses.length - 1}
                />
              ))}
            </ScrollView>
          </>
        )}
      </SafeAreaView>
      <BottomActionBar>
        <Button
          accessibilityLabel="병원비 추가"
          onPress={() => router.push(`/pets/${petId}/hospital-expense/new`)}
        >
          병원비 기록
        </Button>
      </BottomActionBar>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.screen, gap: Spacing.md },
  scrollContent: {
    paddingBottom: Spacing.lg,
  },
  summaryCard: {
    gap: Spacing.xxs,
  },
});
