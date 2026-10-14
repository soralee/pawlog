import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DDayChip } from '@/components/d-day-chip';
import { EmptyState } from '@/components/empty-state';
import { ListItem } from '@/components/list-item';
import { OptionSheet } from '@/components/option-sheet';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Spacing } from '@/constants/theme';
import {
  createVaccinationRepository,
  type Vaccination,
} from '@/db/repositories/vaccination.repository';
import { aggregateSchedule } from '@/features/schedule/aggregate-schedule';
import { daysUntil } from '@/utils/date';

export default function VaccinationScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { petId } = useLocalSearchParams<{ petId: string }>();

  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [sheetVisible, setSheetVisible] = useState(false);

  const load = useCallback(async () => {
    setVaccinations(await createVaccinationRepository(db).listByPet(petId));
  }, [db, petId]);

  useFocusEffect(
    useCallback(() => {
      // 등록/수정/삭제, 완료 처리 후 돌아왔을 때 최신 목록을 반영해야 한다.
      void load();
    }, [load]),
  );

  const completed = vaccinations.filter((v) => v.vaccinatedAt);
  const nextSchedule = aggregateSchedule(vaccinations, [])[0];

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: '예방접종',
          headerRight: () => (
            <Pressable accessibilityLabel="예방접종 추가" onPress={() => setSheetVisible(true)}>
              <Ionicons name="add" size={24} color={Colors.light.primary} />
            </Pressable>
          ),
        }}
      />
      <SafeAreaView style={styles.safeArea}>
        {nextSchedule && (
          <ThemedView style={styles.summaryCard}>
            <ThemedText type="small" themeColor="textSecondary">
              다음 예방접종
            </ThemedText>
            <ThemedView style={styles.summaryRow}>
              <ThemedText type="heading">{nextSchedule.title}</ThemedText>
              <DDayChip daysUntil={daysUntil(nextSchedule.date)} />
            </ThemedView>
            <ThemedText type="small" themeColor="textSecondary">
              {nextSchedule.date}
            </ThemedText>
          </ThemedView>
        )}

        {completed.length === 0 && !nextSchedule ? (
          <EmptyState
            title="등록된 예방접종이 없어요."
            description="접종 기록이나 다음 접종 일정을 등록해 보세요."
            ctaLabel="예방접종 추가하기"
            onPressCta={() => setSheetVisible(true)}
          />
        ) : (
          <ScrollView>
            {completed.length > 0 && (
              <ThemedText type="small" themeColor="textSecondary" style={styles.listLabel}>
                접종 기록
              </ThemedText>
            )}
            {completed.map((vaccination) => (
              <ListItem
                key={vaccination.id}
                title={vaccination.vaccineName}
                subtitle={vaccination.vaccinatedAt!}
                trailing={
                  <Ionicons name="chevron-forward" size={20} color={Colors.light.textMuted} />
                }
                onPress={() => router.push(`/pets/${petId}/vaccination/${vaccination.id}`)}
              />
            ))}
          </ScrollView>
        )}
      </SafeAreaView>

      <OptionSheet
        visible={sheetVisible}
        title="예방접종을 어떻게 추가할까요?"
        onClose={() => setSheetVisible(false)}
        options={[
          {
            label: '예방접종 기록',
            onPress: () => router.push(`/pets/${petId}/vaccination/new`),
          },
          {
            label: '예방접종 일정',
            onPress: () => router.push(`/pets/${petId}/vaccination/new-schedule`),
          },
        ]}
      />
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listLabel: {
    marginBottom: Spacing.xxs,
  },
});
