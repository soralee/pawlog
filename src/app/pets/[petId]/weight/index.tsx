import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
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
  createWeightRecordRepository,
  type WeightRecord,
} from '@/db/repositories/weight-record.repository';
import { computeWeightChange } from '@/features/weight/weight-change';
import {
  computeWeightChartScale,
  computeWeightChartSpacing,
} from '@/features/weight/weight-chart-scale';
import { formatDateForDisplay } from '@/utils/date';

const CHART_MIN_POINTS = 2;
const Y_AXIS_LABEL_WIDTH = 44;

export default function WeightScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const { width: windowWidth } = useWindowDimensions();

  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [measuredContentWidth, setMeasuredContentWidth] = useState<number | null>(null);

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
  const chartData = useMemo(
    () =>
      [...records]
        .sort((a, b) => (a.measuredAt < b.measuredAt ? -1 : 1))
        .map((record) => ({ value: record.weightKg, label: record.measuredAt.slice(5) })),
    [records],
  );

  const chartScale = useMemo(
    () => computeWeightChartScale(chartData.map((d) => d.value)),
    [chartData],
  );

  const fallbackContentWidth = Math.max(240, windowWidth - Spacing.screen * 2);
  const effectiveContentWidth = measuredContentWidth ?? fallbackContentWidth;
  const chartSpacing = useMemo(
    () => computeWeightChartSpacing(effectiveContentWidth, chartData.length, Y_AXIS_LABEL_WIDTH),
    [effectiveContentWidth, chartData.length],
  );

  const latestDateFormatted =
    records.length > 0 ? formatDateForDisplay(records[0].measuredAt, 'schedule') : '';

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: '체중' }} />
      <SafeAreaView style={styles.safeArea}>
        {records.length === 0 ? (
          <EmptyState
            icon="scale-outline"
            title="등록된 체중 기록이 없어요."
            description="체중을 기록해 변화를 추적해 보세요."
            ctaLabel="체중 추가하기"
            onPressCta={() => router.push(`/pets/${petId}/weight/new`)}
          />
        ) : (
          <>
            <Card style={styles.summaryCard}>
              <ThemedText type="small" themeColor="textSecondary">
                현재 체중
              </ThemedText>
              <ThemedText type="display">{records[0].weightKg}kg</ThemedText>
              {latestDateFormatted ? (
                <ThemedText type="small" themeColor="textSecondary">
                  {`최근 측정 ${latestDateFormatted}`}
                </ThemedText>
              ) : null}
              {change && (
                <ThemedText
                  type="small"
                  themeColor={change.deltaKg > 0 ? 'warningText' : 'primary'}
                >
                  최근 6개월 {change.deltaKg > 0 ? '+' : ''}
                  {change.deltaKg.toFixed(1)}kg
                </ThemedText>
              )}
            </Card>

            {/* Chart는 데이터가 2개 이상일 때 표시하고, 1개일 때는 안내 문구를 보여준다(§2.25). */}
            <View
              style={styles.chartContainer}
              onLayout={(event) => {
                const layoutWidth = event.nativeEvent.layout.width;
                if (layoutWidth > 0 && layoutWidth !== measuredContentWidth) {
                  setMeasuredContentWidth(layoutWidth);
                }
              }}
            >
              {chartData.length >= CHART_MIN_POINTS ? (
                <LineChart
                  data={chartData}
                  width={chartSpacing.chartWidth}
                  initialSpacing={chartSpacing.initialSpacing}
                  endSpacing={chartSpacing.endSpacing}
                  spacing={chartSpacing.spacing}
                  yAxisOffset={chartScale.yAxisOffset}
                  maxValue={chartScale.maxValue}
                  stepValue={chartScale.stepValue}
                  noOfSections={chartScale.noOfSections}
                  yAxisLabelTexts={chartScale.yAxisLabelTexts}
                  color={Colors.light.primary}
                  dataPointsColor={Colors.light.primary}
                  thickness={2}
                  hideRules
                  yAxisColor={Colors.light.border}
                  xAxisColor={Colors.light.border}
                  showFractionalValues
                  roundToDigits={1}
                  yAxisLabelWidth={Y_AXIS_LABEL_WIDTH}
                  formatYLabel={(label) => {
                    const num = Number(label);
                    return Number.isNaN(num) ? label : num.toFixed(1);
                  }}
                  yAxisTextStyle={{ color: Colors.light.textMuted }}
                  xAxisLabelTextStyle={{ color: Colors.light.textMuted }}
                />
              ) : (
                <ThemedText
                  type="small"
                  themeColor="textSecondary"
                  style={styles.singlePointNotice}
                >
                  기록이 1개 더 쌓이면 변화 그래프를 볼 수 있어요.
                </ThemedText>
              )}
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
              {records.map((record, i) => (
                <ListItem
                  key={record.id}
                  accessibilityLabel={`${record.weightKg}kg`}
                  leadingText={formatDateForDisplay(record.measuredAt, 'list')}
                  title={record.memo ?? ''}
                  trailingText={`${record.weightKg}kg`}
                  trailing={
                    <Ionicons name="chevron-forward" size={20} color={Colors.light.textMuted} />
                  }
                  onPress={() => router.push(`/pets/${petId}/weight/${record.id}`)}
                  showDivider={i < records.length - 1}
                />
              ))}
            </ScrollView>
          </>
        )}
      </SafeAreaView>
      <BottomActionBar>
        <Button
          accessibilityLabel="체중 추가"
          onPress={() => router.push(`/pets/${petId}/weight/new`)}
        >
          체중 기록
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
  chartContainer: {
    width: '100%',
  },
  singlePointNotice: {
    paddingVertical: Spacing.sm,
  },
});
