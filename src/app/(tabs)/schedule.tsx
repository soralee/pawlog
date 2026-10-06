import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DDayChip } from '@/components/d-day-chip';
import { EmptyState } from '@/components/empty-state';
import { ListItem } from '@/components/list-item';
import { OptionSheet } from '@/components/option-sheet';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { createCheckupRepository } from '@/db/repositories/checkup.repository';
import { createPetRepository } from '@/db/repositories/pet.repository';
import { createVaccinationRepository } from '@/db/repositories/vaccination.repository';
import {
  aggregateSchedule,
  type ScheduleEntry,
  type ScheduleType,
} from '@/features/schedule/aggregate-schedule';
import { useAppStore } from '@/stores/app.store';
import { daysUntil } from '@/utils/date';

type FilterKey = 'all' | ScheduleType;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'vaccination', label: '접종' },
  { key: 'checkup', label: '검진' },
];

type DayGroup = { day: string; weekday: string; items: ScheduleEntry[] };
type MonthGroup = { month: string; days: DayGroup[] };

function groupByMonthAndDay(entries: ScheduleEntry[]): MonthGroup[] {
  const monthGroups: MonthGroup[] = [];
  for (const entry of entries) {
    const parsed = parseISO(entry.date);
    const month = `${format(parsed, 'M')}월`;
    const day = format(parsed, 'd');
    const weekday = format(parsed, 'EEEEE', { locale: ko });

    let monthGroup = monthGroups[monthGroups.length - 1];
    if (!monthGroup || monthGroup.month !== month) {
      monthGroup = { month, days: [] };
      monthGroups.push(monthGroup);
    }
    let dayGroup = monthGroup.days[monthGroup.days.length - 1];
    if (!dayGroup || dayGroup.day !== day) {
      dayGroup = { day, weekday, items: [] };
      monthGroup.days.push(dayGroup);
    }
    dayGroup.items.push(entry);
  }
  return monthGroups;
}

export default function ScheduleScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const petRepository = useMemo(() => createPetRepository(db), [db]);
  const selectedPetId = useAppStore((state) => state.selectedPetId);
  const setSelectedPetId = useAppStore((state) => state.setSelectedPetId);

  const [hasAnyPet, setHasAnyPet] = useState<boolean | null>(null);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [sheetVisible, setSheetVisible] = useState(false);

  const ensureSelectedPet = useCallback(async () => {
    if (selectedPetId) {
      setHasAnyPet(true);
      return;
    }
    const pets = await petRepository.listPets();
    setHasAnyPet(pets.length > 0);
    if (pets.length > 0) setSelectedPetId(pets[0].id);
  }, [petRepository, selectedPetId, setSelectedPetId]);

  const loadEntries = useCallback(async () => {
    if (!selectedPetId) return;
    const [vaccinations, checkups] = await Promise.all([
      createVaccinationRepository(db).listByPet(selectedPetId),
      createCheckupRepository(db).listByPet(selectedPetId),
    ]);
    setEntries(aggregateSchedule(vaccinations, checkups));
  }, [db, selectedPetId]);

  useFocusEffect(
    useCallback(() => {
      // 접종/검진 등록·수정·삭제 후 돌아왔을 때 최신 일정을 반영해야 한다.
      void ensureSelectedPet();
      void loadEntries();
    }, [ensureSelectedPet, loadEntries]),
  );

  const filtered = filter === 'all' ? entries : entries.filter((entry) => entry.type === filter);
  const groups = useMemo(() => groupByMonthAndDay(filtered), [filtered]);

  function openNew(type: ScheduleType) {
    router.push(type === 'vaccination' ? '/vaccination/new' : '/checkup/new');
  }

  function openDetail(entry: ScheduleEntry) {
    router.push(entry.type === 'vaccination' ? `/vaccination/${entry.id}` : `/checkup/${entry.id}`);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">일정</ThemedText>
          {hasAnyPet ? (
            <Pressable accessibilityLabel="일정 추가" onPress={() => setSheetVisible(true)}>
              <Ionicons name="add" size={24} color={Colors.light.primary} />
            </Pressable>
          ) : null}
        </ThemedView>

        {hasAnyPet === false && (
          <ThemedText type="default">
            먼저 &quot;내 반려동물&quot; 탭에서 반려동물을 등록해주세요.
          </ThemedText>
        )}

        {hasAnyPet && (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
              {FILTERS.map((option) => (
                <Pressable
                  key={option.key}
                  accessibilityLabel={option.label}
                  onPress={() => setFilter(option.key)}
                  style={[styles.filterChip, filter === option.key && styles.filterChipSelected]}
                >
                  <ThemedText type="small">{option.label}</ThemedText>
                </Pressable>
              ))}
            </ScrollView>

            {entries.length === 0 ? (
              <EmptyState
                title="다가오는 일정이 없어요."
                description="다음 접종·검진 예정일을 등록해 보세요."
                ctaLabel="일정 추가하기"
                onPressCta={() => setSheetVisible(true)}
              />
            ) : (
              <ScrollView>
                {groups.map((monthGroup) => (
                  <ThemedView key={monthGroup.month} style={styles.monthGroup}>
                    <ThemedText type="small" themeColor="textSecondary">
                      {monthGroup.month}
                    </ThemedText>
                    {monthGroup.days.map((dayGroup) => (
                      <ThemedView key={dayGroup.day} style={styles.dayGroup}>
                        <ThemedView style={styles.dayLabel}>
                          <ThemedText type="heading">{dayGroup.day}</ThemedText>
                          <ThemedText type="small" themeColor="textSecondary">
                            {dayGroup.weekday}
                          </ThemedText>
                        </ThemedView>
                        <ThemedView style={styles.dayItems}>
                          {dayGroup.items.map((entry) => (
                            <ListItem
                              key={entry.id}
                              title={entry.title}
                              trailing={<DDayChip daysUntil={daysUntil(entry.date)} />}
                              onPress={() => openDetail(entry)}
                            />
                          ))}
                        </ThemedView>
                      </ThemedView>
                    ))}
                  </ThemedView>
                ))}
              </ScrollView>
            )}
          </>
        )}
      </SafeAreaView>

      <OptionSheet
        visible={sheetVisible}
        title="어떤 일정을 추가할까요?"
        onClose={() => setSheetVisible(false)}
        options={[
          { label: '예방접종', onPress: () => openNew('vaccination') },
          { label: '건강검진', onPress: () => openNew('checkup') },
        ]}
      />
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
  filterRow: {
    flexGrow: 0,
  },
  filterChip: {
    paddingVertical: Spacing.xxs,
    paddingHorizontal: Spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginRight: Spacing.xs,
  },
  filterChipSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primaryLight,
  },
  monthGroup: {
    marginBottom: Spacing.sm,
  },
  dayGroup: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  dayLabel: {
    width: 32,
    alignItems: 'center',
  },
  dayItems: {
    flex: 1,
  },
});
