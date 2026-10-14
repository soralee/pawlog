import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ListItem } from '@/components/list-item';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Spacing } from '@/constants/theme';
import {
  createWeightRecordRepository,
  type WeightRecord,
} from '@/db/repositories/weight-record.repository';
import { computeWeightChange } from '@/features/weight/weight-change';

const CHART_MIN_POINTS = 2;

export default function WeightScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { petId } = useLocalSearchParams<{ petId: string }>();

  const [records, setRecords] = useState<WeightRecord[]>([]);

  const load = useCallback(async () => {
    setRecords(await createWeightRecordRepository(db).listByPet(petId));
  }, [db, petId]);

  useFocusEffect(
    useCallback(() => {
      // 등록/수정/삭제 후 돌아왔을 때 최신 기록과 그래프를 반영해야 한다.
      void load();
    }, [load]),
  );

  const change = computeWeightChange(records);
  // records는 최신순(DESC)이라 그래프용으로는 날짜 오름차순으로 뒤집어야 한다.
  const chartData = [...records]
    .sort((a, b) => (a.measuredAt < b.measuredAt ? -1 : 1))
    .map((record) => ({ value: record.weightKg, label: record.measuredAt.slice(5) }));

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: '체중',
          headerRight: () => (
            <Pressable
              accessibilityLabel="체중 추가"
              onPress={() => router.push(`/pets/${petId}/weight/new`)}
            >
              <Ionicons name="add" size={24} color={Colors.light.primary} />
            </Pressable>
          ),
        }}
      />
      <SafeAreaView style={styles.safeArea}>
        {records.length === 0 ? (
          <EmptyState
            title="등록된 체중 기록이 없어요."
            description="체중을 기록해 변화를 추적해 보세요."
            ctaLabel="체중 추가하기"
            onPressCta={() => router.push(`/pets/${petId}/weight/new`)}
          />
        ) : (
          <>
            <ThemedView style={styles.summaryCard}>
              <ThemedText type="small" themeColor="textSecondary">
                현재
              </ThemedText>
              <ThemedText type="heading">{records[0].weightKg}kg</ThemedText>
              {change && (
                <ThemedText type="small" themeColor={change.deltaKg > 0 ? 'warning' : 'primary'}>
                  최근 6개월 {change.deltaKg > 0 ? '+' : ''}
                  {change.deltaKg.toFixed(1)}kg
                </ThemedText>
              )}
            </ThemedView>

            {/* Chart는 데이터가 충분할 때만 보여준다(screen-layout.md §11). */}
            {chartData.length >= CHART_MIN_POINTS && (
              <LineChart
                data={chartData}
                color={Colors.light.primary}
                thickness={2}
                hideRules
                yAxisTextStyle={{ color: Colors.light.textMuted }}
                xAxisLabelTextStyle={{ color: Colors.light.textMuted }}
              />
            )}

            <ScrollView>
              {records.map((record) => (
                <ListItem
                  key={record.id}
                  title={`${record.weightKg}kg`}
                  subtitle={[record.measuredAt, record.memo].filter(Boolean).join(' · ')}
                  trailing={
                    <Ionicons name="chevron-forward" size={20} color={Colors.light.textMuted} />
                  }
                  onPress={() => router.push(`/pets/${petId}/weight/${record.id}`)}
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
  summaryCard: {
    backgroundColor: Colors.light.primaryLight,
    borderRadius: Radius.largeCard,
    padding: Spacing.md,
    gap: Spacing.xxs,
  },
});
