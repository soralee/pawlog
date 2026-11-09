import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomActionBar } from '@/components/bottom-action-bar';
import { Button } from '@/components/button';
import { DDayChip } from '@/components/d-day-chip';
import { EmptyState } from '@/components/empty-state';
import { ListItem } from '@/components/list-item';
import { OptionSheet } from '@/components/option-sheet';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, DomainIconTone, Radius, Spacing } from '@/constants/theme';
import { createCheckupRepository, type Checkup } from '@/db/repositories/checkup.repository';
import { aggregateSchedule, getNextUpcomingSchedule } from '@/features/schedule/aggregate-schedule';
import { daysUntil, formatDateForDisplay } from '@/utils/date';

export default function CheckupScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { petId } = useLocalSearchParams<{ petId: string }>();

  const [checkups, setCheckups] = useState<Checkup[]>([]);
  const [sheetVisible, setSheetVisible] = useState(false);

  const load = useCallback(async () => {
    setCheckups(await createCheckupRepository(db).listByPet(petId));
  }, [db, petId]);

  useFocusEffect(
    useCallback(() => {
      // 등록/수정/삭제, 완료 처리 후 돌아왔을 때 최신 목록을 반영해야 한다.
      void load();
    }, [load]),
  );

  const completed = checkups.filter((c) => c.checkedAt);
  const allSchedules = aggregateSchedule([], checkups);
  const nextSchedule = getNextUpcomingSchedule([], checkups);
  const nextRemaining = nextSchedule ? daysUntil(nextSchedule.date) : null;
  const hasOverdueSchedule = !nextSchedule && allSchedules.length > 0;
  const hasAnyCheckup = checkups.length > 0;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: '건강검진' }} />
      <SafeAreaView style={styles.safeArea}>
        {!hasAnyCheckup ? (
          <EmptyState
            icon="heart-outline"
            title="등록된 건강검진이 없어요."
            description="검진 기록이나 다음 검진 일정을 등록해 보세요."
            ctaLabel="건강검진 추가하기"
            onPressCta={() => setSheetVisible(true)}
          />
        ) : (
          <>
            <ThemedView style={styles.summaryCard}>
              <ThemedText type="small" themeColor="textSecondary">
                다음 건강검진
              </ThemedText>
              {nextSchedule ? (
                <>
                  <ThemedView style={styles.summaryRow}>
                    <ThemedText type="heading">{nextSchedule.title}</ThemedText>
                    {nextRemaining !== null ? (
                      <DDayChip daysUntil={nextRemaining} surfaceTone="primaryLight" />
                    ) : null}
                  </ThemedView>
                  <ThemedText type="small" themeColor="textSecondary">
                    {formatDateForDisplay(nextSchedule.date, 'schedule') || '날짜를 설정해 주세요.'}
                  </ThemedText>
                </>
              ) : (
                <>
                  <ThemedText type="default" themeColor="textSecondary">
                    예정된 건강검진이 없어요.
                  </ThemedText>
                  {hasOverdueSchedule ? (
                    <ThemedText type="small" themeColor="textSecondary">
                      지난 일정은 일정 탭에서 확인해 주세요.
                    </ThemedText>
                  ) : null}
                </>
              )}
            </ThemedView>

            <ScrollView contentContainerStyle={styles.scrollContent}>
              {completed.length > 0 && (
                <ThemedText type="small" themeColor="textSecondary" style={styles.listLabel}>
                  검진 기록
                </ThemedText>
              )}
              {completed.map((checkup, i) => (
                <ListItem
                  key={checkup.id}
                  leadingText={formatDateForDisplay(checkup.checkedAt!, 'list')}
                  title={checkup.checkupType}
                  subtitle={checkup.hospitalName ?? undefined}
                  trailing={
                    <Ionicons name="chevron-forward" size={20} color={Colors.light.textMuted} />
                  }
                  onPress={() => router.push(`/pets/${petId}/checkup/${checkup.id}`)}
                  showDivider={i < completed.length - 1}
                />
              ))}
            </ScrollView>
          </>
        )}
      </SafeAreaView>

      <BottomActionBar>
        <Button onPress={() => setSheetVisible(true)}>건강검진 추가</Button>
      </BottomActionBar>

      <OptionSheet
        visible={sheetVisible}
        title="건강검진을 어떻게 추가할까요?"
        onClose={() => setSheetVisible(false)}
        options={[
          {
            label: '건강검진 기록',
            icon: 'heart-outline',
            iconTone: DomainIconTone.checkup,
            onPress: () => router.push(`/pets/${petId}/checkup/new`),
          },
          {
            label: '건강검진 일정',
            icon: 'heart-outline',
            iconTone: DomainIconTone.checkup,
            onPress: () => router.push(`/pets/${petId}/checkup/new-schedule`),
          },
        ]}
      />
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
    backgroundColor: Colors.light.primaryLight,
    borderRadius: Radius.largeCard,
    padding: Spacing.md,
    gap: Spacing.xxs,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  listLabel: {
    marginBottom: Spacing.xxs,
  },
});
