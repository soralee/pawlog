import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomActionBar } from '@/components/bottom-action-bar';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { EmptyState } from '@/components/empty-state';
import { ListItem } from '@/components/list-item';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Spacing } from '@/constants/theme';
import {
  createMedicationRepository,
  type Medication,
} from '@/db/repositories/medication.repository';
import {
  getNextMedicationTime,
  isMedicationDueToday,
  sortMedicationsByTime,
  splitMedications,
} from '@/features/medication/split-medications';
import { formatDateForDisplay, formatTimeForDisplay } from '@/utils/date';

function formatEndedPeriod(medication: Medication): string {
  const start = formatDateForDisplay(medication.startDate, 'list');
  if (!medication.endDate) return start;
  const end = formatDateForDisplay(medication.endDate, 'list');
  return [start || null, end || null].filter(Boolean).join(' - ');
}

export default function MedicationScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { petId } = useLocalSearchParams<{ petId: string }>();

  const [medications, setMedications] = useState<Medication[]>([]);

  const load = useCallback(async () => {
    setMedications(await createMedicationRepository(db).listByPet(petId));
  }, [db, petId]);

  useFocusEffect(
    useCallback(() => {
      // 등록/수정/삭제 후 돌아왔을 때 최신 목록을 반영해야 한다.
      void load();
    }, [load]),
  );

  const { active, ended } = useMemo(() => {
    const split = splitMedications(medications);
    return {
      active: sortMedicationsByTime(split.active),
      ended: split.ended,
    };
  }, [medications]);
  const dueToday = useMemo(
    () => medications.filter((medication) => isMedicationDueToday(medication)),
    [medications],
  );
  const nextMedicationTime = useMemo(() => getNextMedicationTime(medications), [medications]);
  const nextMedicationFormatted = nextMedicationTime
    ? formatTimeForDisplay(nextMedicationTime)
    : '';

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: '복약 관리' }} />
      <SafeAreaView style={styles.safeArea}>
        {medications.length === 0 ? (
          <EmptyState
            icon="medical-outline"
            title="등록된 복약이 없어요."
            description="복용 중인 약이나 영양제를 등록해 보세요."
            ctaLabel="복약 추가하기"
            onPressCta={() => router.push(`/pets/${petId}/medication/new`)}
          />
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <ThemedView style={styles.todayCard}>
              <ThemedText type="small" themeColor="textSecondary">
                오늘의 복약
              </ThemedText>
              <ThemedText type="heading">
                {dueToday.length > 0
                  ? `${dueToday.length}개의 복약 일정이 있어요.`
                  : '오늘 복용할 약이 없어요.'}
              </ThemedText>
              {nextMedicationFormatted ? (
                <ThemedText type="small" themeColor="primary">
                  {`다음 복약은 ${nextMedicationFormatted}이에요.`}
                </ThemedText>
              ) : null}
            </ThemedView>

            <ThemedView style={styles.sectionHeader}>
              <ThemedText type="small" themeColor="textSecondary">
                복용 중
              </ThemedText>
              <ThemedText type="smallBold" themeColor="primary">
                {active.length}
              </ThemedText>
            </ThemedView>

            {active.map((medication) => {
              const formattedTime = formatTimeForDisplay(medication.time);
              return (
                <Pressable
                  key={medication.id}
                  accessibilityLabel={medication.name}
                  onPress={() => router.push(`/pets/${petId}/medication/${medication.id}`)}
                >
                  <Card style={styles.activeCard}>
                    <ThemedView type="surface" style={styles.activeCardText}>
                      <ThemedText type="smallBold">{medication.name}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {[medication.frequency, formattedTime || null].filter(Boolean).join(' · ')}
                      </ThemedText>
                    </ThemedView>
                    <Ionicons name="chevron-forward" size={20} color={Colors.light.textMuted} />
                  </Card>
                </Pressable>
              );
            })}

            {ended.length > 0 && (
              <>
                <ThemedText type="small" themeColor="textSecondary" style={styles.endedLabel}>
                  종료된 복약
                </ThemedText>
                {ended.map((medication, i) => {
                  const formattedTime = formatTimeForDisplay(medication.time);
                  return (
                    <ListItem
                      key={medication.id}
                      leadingText={formatEndedPeriod(medication)}
                      title={medication.name}
                      subtitle={[medication.frequency, formattedTime || null]
                        .filter(Boolean)
                        .join(' · ')}
                      trailing={
                        <Ionicons name="chevron-forward" size={20} color={Colors.light.textMuted} />
                      }
                      onPress={() => router.push(`/pets/${petId}/medication/${medication.id}`)}
                      showDivider={i < ended.length - 1}
                    />
                  );
                })}
              </>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
      <BottomActionBar>
        <Button onPress={() => router.push(`/pets/${petId}/medication/new`)}>복약 추가</Button>
      </BottomActionBar>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.screen },
  scrollContent: {
    gap: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  todayCard: {
    backgroundColor: Colors.light.primaryLight,
    borderRadius: Radius.largeCard,
    padding: Spacing.md,
    gap: Spacing.xxs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  activeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  activeCardText: {
    flex: 1,
    gap: Spacing.xxs,
  },
  endedLabel: {
    marginTop: Spacing.sm,
  },
});
