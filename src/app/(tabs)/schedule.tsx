import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useFocusEffect, useRouter } from 'expo-router';
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
import { Colors, Spacing } from '@/constants/theme';
import { createCheckupRepository } from '@/db/repositories/checkup.repository';
import {
  createMedicationRepository,
  type Medication,
} from '@/db/repositories/medication.repository';
import { createPetRepository, type Pet } from '@/db/repositories/pet.repository';
import { createVaccinationRepository } from '@/db/repositories/vaccination.repository';
import { splitMedications } from '@/features/medication/split-medications';
import { filterByPet, showsPetFilter, type PetFilterValue } from '@/features/pets/pet-filter';
import {
  aggregateSchedule,
  type ScheduleEntry,
  type ScheduleType,
} from '@/features/schedule/aggregate-schedule';
import { daysUntil, todayDateString } from '@/utils/date';

type TaggedScheduleEntry = ScheduleEntry & { petId: string; petName: string };
type TaggedMedication = { id: string; petId: string; petName: string; medication: Medication };

type AddType = ScheduleType | 'medication';
type FilterKey = 'all' | AddType;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'vaccination', label: '접종' },
  { key: 'checkup', label: '검진' },
  { key: 'medication', label: '복약' },
];

type DayGroup = { day: string; weekday: string; items: TaggedScheduleEntry[] };
type MonthGroup = { month: string; days: DayGroup[] };

function groupByMonthAndDay(entries: TaggedScheduleEntry[]): MonthGroup[] {
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

  const [pets, setPets] = useState<Pet[]>([]);
  const [hasAnyPet, setHasAnyPet] = useState<boolean | null>(null);
  const [petFilter, setPetFilter] = useState<PetFilterValue>('all');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [entries, setEntries] = useState<TaggedScheduleEntry[]>([]);
  const [medications, setMedications] = useState<TaggedMedication[]>([]);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [petSelectVisible, setPetSelectVisible] = useState(false);
  const [targetPetId, setTargetPetId] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    const petList = await createPetRepository(db).listPets();
    setPets(petList);
    setHasAnyPet(petList.length > 0);

    const perPet = await Promise.all(
      petList.map(async (pet) => {
        const [vaccinations, checkups] = await Promise.all([
          createVaccinationRepository(db).listByPet(pet.id),
          createCheckupRepository(db).listByPet(pet.id),
        ]);
        return aggregateSchedule(vaccinations, checkups).map((entry) => ({
          ...entry,
          petId: pet.id,
          petName: pet.name,
        }));
      }),
    );

    const all = perPet.flat();
    all.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    setEntries(all);

    // 복약은 1회성 일정이 아니라 활성 계획이라 날짜별로 보여주지 않고 "오늘의 복약"으로 묶는다.
    const perPetMedications = await Promise.all(
      petList.map(async (pet) => {
        const medicationList = await createMedicationRepository(db).listByPet(pet.id);
        return splitMedications(medicationList).active.map((medication) => ({
          id: medication.id,
          petId: pet.id,
          petName: pet.name,
          medication,
        }));
      }),
    );
    setMedications(perPetMedications.flat());
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      // 접종/검진 등록·수정·삭제 후 돌아왔을 때 최신 일정을 반영해야 한다.
      void loadAll();
    }, [loadAll]),
  );

  const showPetFilter = showsPetFilter(pets);
  const byPet = filterByPet(entries, petFilter);
  const filtered =
    filter === 'all' || filter === 'medication'
      ? byPet
      : byPet.filter((entry) => entry.type === filter);
  const showPetTag = showPetFilter && petFilter === 'all';
  // 예정일이 지난 미완료 일정은 "지난 일정"으로 따로 모아 보여준다 — 자동 완료하지 않는다.
  const today = todayDateString();
  const overdue = filter === 'medication' ? [] : filtered.filter((entry) => entry.date < today);
  const upcoming = filter === 'medication' ? [] : filtered.filter((entry) => entry.date >= today);
  const groups = groupByMonthAndDay(upcoming);
  // 복약은 전체/복약 필터에서만 보이고, 접종/검진 단독 필터에서는 숨긴다.
  const visibleMedications =
    filter === 'all' || filter === 'medication' ? filterByPet(medications, petFilter) : [];

  function openAddFlow() {
    if (pets.length === 0) return;
    if (pets.length === 1) {
      setTargetPetId(pets[0].id);
      setSheetVisible(true);
    } else {
      setPetSelectVisible(true);
    }
  }

  function choosePet(petId: string) {
    setTargetPetId(petId);
    setSheetVisible(true);
  }

  function openNew(type: AddType) {
    if (!targetPetId) return;
    if (type === 'vaccination') router.push(`/pets/${targetPetId}/vaccination/new-schedule`);
    else if (type === 'checkup') router.push(`/pets/${targetPetId}/checkup/new-schedule`);
    else router.push(`/pets/${targetPetId}/medication/new`);
  }

  function openDetail(entry: TaggedScheduleEntry) {
    router.push(
      entry.type === 'vaccination'
        ? `/pets/${entry.petId}/vaccination/${entry.id}`
        : `/pets/${entry.petId}/checkup/${entry.id}`,
    );
  }

  function titleFor(entry: TaggedScheduleEntry): string {
    return showPetTag ? `[${entry.petName}] ${entry.title}` : entry.title;
  }

  function medicationTitleFor(entry: TaggedMedication): string {
    const name = entry.medication.name;
    return showPetTag ? `[${entry.petName}] ${name}` : name;
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">일정</ThemedText>
          {hasAnyPet ? (
            <Pressable accessibilityLabel="일정 추가" onPress={openAddFlow}>
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
            {showPetFilter && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterRow}
              >
                <Pressable
                  accessibilityLabel="반려동물 전체"
                  onPress={() => setPetFilter('all')}
                  style={[styles.filterChip, petFilter === 'all' && styles.filterChipSelected]}
                >
                  <ThemedText type="small">전체</ThemedText>
                </Pressable>
                {pets.map((pet) => (
                  <Pressable
                    key={pet.id}
                    accessibilityLabel={`${pet.name} 필터`}
                    onPress={() => setPetFilter(pet.id)}
                    style={[styles.filterChip, petFilter === pet.id && styles.filterChipSelected]}
                  >
                    <ThemedText type="small">{pet.name}</ThemedText>
                  </Pressable>
                ))}
              </ScrollView>
            )}

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

            {entries.length === 0 && medications.length === 0 ? (
              <EmptyState
                title="다가오는 일정이 없어요."
                description="다음 접종·검진·복약 일정을 등록해 보세요."
                ctaLabel="일정 추가하기"
                onPressCta={openAddFlow}
              />
            ) : (
              <ScrollView>
                {visibleMedications.length > 0 && (
                  <ThemedView style={styles.monthGroup}>
                    <ThemedText type="small" themeColor="textSecondary">
                      오늘의 복약
                    </ThemedText>
                    {visibleMedications.map((entry) => (
                      <ListItem
                        key={entry.id}
                        title={medicationTitleFor(entry)}
                        subtitle={`${entry.medication.frequency} ${entry.medication.time}`}
                        trailing={
                          <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={Colors.light.textMuted}
                          />
                        }
                        onPress={() => router.push(`/pets/${entry.petId}/medication/${entry.id}`)}
                      />
                    ))}
                  </ThemedView>
                )}
                {overdue.length > 0 && (
                  <ThemedView style={styles.monthGroup}>
                    <ThemedText type="small" themeColor="warning">
                      지난 일정
                    </ThemedText>
                    {overdue.map((entry) => (
                      <ListItem
                        key={entry.id}
                        title={titleFor(entry)}
                        subtitle={`${entry.date} · ${Math.abs(daysUntil(entry.date))}일 지남`}
                        trailing={
                          <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={Colors.light.textMuted}
                          />
                        }
                        onPress={() => openDetail(entry)}
                      />
                    ))}
                  </ThemedView>
                )}
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
                              title={titleFor(entry)}
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
        visible={petSelectVisible}
        title="어느 반려동물의 일정인가요?"
        onClose={() => setPetSelectVisible(false)}
        options={pets.map((pet) => ({ label: pet.name, onPress: () => choosePet(pet.id) }))}
      />

      <OptionSheet
        visible={sheetVisible}
        title="어떤 일정을 추가할까요?"
        onClose={() => setSheetVisible(false)}
        options={[
          { label: '예방접종 일정', onPress: () => openNew('vaccination') },
          { label: '건강검진 일정', onPress: () => openNew('checkup') },
          { label: '복약 일정', onPress: () => openNew('medication') },
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
