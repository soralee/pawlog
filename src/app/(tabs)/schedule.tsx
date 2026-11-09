import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddCircleButton } from '@/components/add-circle-button';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Chip } from '@/components/chip';
import { DDayChip } from '@/components/d-day-chip';
import { EmptyState } from '@/components/empty-state';
import { OptionSheet } from '@/components/option-sheet';
import { PetSwitchSheet } from '@/components/pet-switch-sheet';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, DomainIconTone, IconTileTone, Radius, Spacing } from '@/constants/theme';
import { createCheckupRepository } from '@/db/repositories/checkup.repository';
import {
  createMedicationRepository,
  type Medication,
} from '@/db/repositories/medication.repository';
import { createPetRepository, type Pet } from '@/db/repositories/pet.repository';
import { createVaccinationRepository } from '@/db/repositories/vaccination.repository';
import {
  compareMedicationTime,
  isMedicationDueToday,
  sortMedicationsByTime,
} from '@/features/medication/split-medications';
import { filterByPet, showsPetFilter, type PetFilterValue } from '@/features/pets/pet-filter';
import {
  aggregateSchedule,
  type ScheduleEntry,
  type ScheduleType,
} from '@/features/schedule/aggregate-schedule';
import {
  daysUntil,
  formatDateForDisplay,
  formatOverdueScheduleDays,
  formatTimeForDisplay,
  todayDateString,
} from '@/utils/date';

type TaggedScheduleEntry = ScheduleEntry & { petId: string; petName: string };
type TaggedMedication = { id: string; petId: string; petName: string; medication: Medication };

type AddType = ScheduleType | 'medication';
type FilterKey = 'all' | AddType;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'vaccination', label: '예방접종' },
  { key: 'checkup', label: '건강검진' },
  { key: 'medication', label: '복약' },
];

function scheduleIconFor(type: ScheduleType): {
  name: keyof typeof Ionicons.glyphMap;
  tone: keyof typeof IconTileTone;
} {
  return type === 'vaccination'
    ? { name: 'medkit-outline', tone: 'info' }
    : { name: 'heart-outline', tone: 'success' };
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
        return sortMedicationsByTime(
          medicationList.filter((medication) => isMedicationDueToday(medication)),
        ).map((medication) => ({
          id: medication.id,
          petId: pet.id,
          petName: pet.name,
          medication,
        }));
      }),
    );
    const flatMedications = perPetMedications.flat();
    flatMedications.sort((a, b) => compareMedicationTime(a.medication.time, b.medication.time));
    setMedications(flatMedications);
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
  const todayEntries =
    filter === 'medication' ? [] : filtered.filter((entry) => entry.date === today);
  const upcoming = filter === 'medication' ? [] : filtered.filter((entry) => entry.date > today);
  // 복약은 전체/복약 필터에서만 보이고, 접종/검진 단독 필터에서는 숨긴다.
  const visibleMedications =
    filter === 'all' || filter === 'medication' ? filterByPet(medications, petFilter) : [];
  const hasTodaySection = todayEntries.length > 0 || visibleMedications.length > 0;
  // 현재 필터 기준으로 아무것도 안 보일 때만 EmptyState를 보여준다(필터별 빈 화면 방지).
  const nothingVisible =
    overdue.length === 0 &&
    todayEntries.length === 0 &&
    upcoming.length === 0 &&
    visibleMedications.length === 0;
  const hasAnyScheduleAtAll = entries.length > 0 || medications.length > 0;

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

  function renderScheduleCard(entry: TaggedScheduleEntry) {
    const icon = scheduleIconFor(entry.type);
    const tile = IconTileTone[icon.tone];
    const remaining = daysUntil(entry.date);
    const formattedDate = formatDateForDisplay(entry.date, 'schedule');
    return (
      <Pressable
        key={entry.id}
        accessibilityLabel={titleFor(entry)}
        onPress={() => openDetail(entry)}
      >
        <Card style={styles.scheduleCard}>
          <ThemedView style={[styles.iconTile, { backgroundColor: tile.backgroundColor }]}>
            <Ionicons name={icon.name} size={20} color={tile.color} />
          </ThemedView>
          <ThemedView type="surface" style={styles.cardTextGroup}>
            <ThemedText type="smallBold">{titleFor(entry)}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {formattedDate || '날짜를 설정해 주세요.'}
            </ThemedText>
          </ThemedView>
          {remaining !== null ? <DDayChip daysUntil={remaining} /> : null}
        </Card>
      </Pressable>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">일정</ThemedText>
          {hasAnyPet ? (
            <AddCircleButton accessibilityLabel="일정 추가" onPress={openAddFlow} />
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
                contentContainerStyle={styles.filterRowContent}
                style={styles.filterRow}
              >
                <Chip
                  label="전체"
                  accessibilityLabel="반려동물 전체"
                  selected={petFilter === 'all'}
                  onPress={() => setPetFilter('all')}
                />
                {pets.map((pet) => (
                  <Chip
                    key={pet.id}
                    label={pet.name}
                    accessibilityLabel={`${pet.name} 필터`}
                    selected={petFilter === pet.id}
                    onPress={() => setPetFilter(pet.id)}
                  />
                ))}
              </ScrollView>
            )}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRowContent}
              style={styles.filterRow}
            >
              {FILTERS.map((option) => (
                <Chip
                  key={option.key}
                  label={option.label}
                  selected={filter === option.key}
                  onPress={() => setFilter(option.key)}
                />
              ))}
            </ScrollView>

            {nothingVisible ? (
              hasAnyScheduleAtAll ? (
                <EmptyState
                  icon="calendar-outline"
                  title="해당하는 일정이 없어요."
                  description="다른 필터를 선택하거나 새 일정을 추가해 보세요."
                  ctaLabel="일정 추가하기"
                  onPressCta={openAddFlow}
                />
              ) : (
                <EmptyState
                  icon="calendar-outline"
                  title="다가오는 일정이 없어요."
                  description="다음 접종·검진·복약 일정을 등록해 보세요."
                  ctaLabel="일정 추가하기"
                  onPressCta={openAddFlow}
                />
              )
            ) : (
              <ScrollView contentContainerStyle={styles.listContent}>
                {hasTodaySection && (
                  <ThemedView style={styles.sectionGroup}>
                    <ThemedText type="smallBold" themeColor="textSecondary">
                      오늘
                    </ThemedText>
                    {todayEntries.map(renderScheduleCard)}
                    {visibleMedications.map((entry) => {
                      const formattedTime = formatTimeForDisplay(entry.medication.time);
                      return (
                        <Pressable
                          key={entry.id}
                          accessibilityLabel={medicationTitleFor(entry)}
                          onPress={() => router.push(`/pets/${entry.petId}/medication/${entry.id}`)}
                        >
                          <Card style={styles.scheduleCard}>
                            <ThemedView
                              style={[
                                styles.iconTile,
                                { backgroundColor: IconTileTone.warning.backgroundColor },
                              ]}
                            >
                              <Ionicons
                                name="medical-outline"
                                size={20}
                                color={IconTileTone.warning.color}
                              />
                            </ThemedView>
                            <ThemedView type="surface" style={styles.cardTextGroup}>
                              <ThemedText type="smallBold">{medicationTitleFor(entry)}</ThemedText>
                              <ThemedText type="small" themeColor="textSecondary">
                                {[entry.medication.frequency, formattedTime || null]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </ThemedText>
                            </ThemedView>
                            <Ionicons
                              name="chevron-forward"
                              size={20}
                              color={Colors.light.textMuted}
                            />
                          </Card>
                        </Pressable>
                      );
                    })}
                  </ThemedView>
                )}

                {upcoming.length > 0 && (
                  <ThemedView style={styles.sectionGroup}>
                    <ThemedText type="smallBold" themeColor="textSecondary">
                      다가오는 일정
                    </ThemedText>
                    {upcoming.map(renderScheduleCard)}
                  </ThemedView>
                )}

                {overdue.length > 0 && (
                  <ThemedView style={styles.sectionGroup}>
                    <ThemedText type="smallBold" themeColor="warningText">
                      지난 일정
                    </ThemedText>
                    {overdue.map((entry) => {
                      const icon = scheduleIconFor(entry.type);
                      const tile = IconTileTone[icon.tone];
                      const formattedDate = formatDateForDisplay(entry.date, 'schedule');
                      const overdueText = formatOverdueScheduleDays(entry.date, today);
                      return (
                        <Card key={entry.id} style={styles.overdueCard}>
                          <Pressable
                            accessibilityLabel={titleFor(entry)}
                            onPress={() => openDetail(entry)}
                            style={styles.scheduleRow}
                          >
                            <ThemedView
                              style={[styles.iconTile, { backgroundColor: tile.backgroundColor }]}
                            >
                              <Ionicons name={icon.name} size={20} color={tile.color} />
                            </ThemedView>
                            <ThemedView type="surface" style={styles.cardTextGroup}>
                              <ThemedText type="smallBold">{titleFor(entry)}</ThemedText>
                              <ThemedText type="small" themeColor="warningText">
                                {[formattedDate || null, overdueText || null]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </ThemedText>
                            </ThemedView>
                            <Ionicons
                              name="chevron-forward"
                              size={20}
                              color={Colors.light.textMuted}
                            />
                          </Pressable>
                          <Button variant="secondary" onPress={() => openDetail(entry)}>
                            완료하기
                          </Button>
                        </Card>
                      );
                    })}
                  </ThemedView>
                )}
              </ScrollView>
            )}
          </>
        )}
      </SafeAreaView>

      <PetSwitchSheet
        visible={petSelectVisible}
        pets={pets}
        selectedPetId={targetPetId}
        onSelectPet={choosePet}
        onAddPet={() => router.push('/pets/new')}
        onClose={() => setPetSelectVisible(false)}
      />

      <OptionSheet
        visible={sheetVisible}
        title="어떤 일정을 추가할까요?"
        onClose={() => setSheetVisible(false)}
        options={[
          {
            label: '예방접종 일정',
            icon: 'medkit-outline',
            iconTone: DomainIconTone.vaccination,
            onPress: () => openNew('vaccination'),
          },
          {
            label: '건강검진 일정',
            icon: 'heart-outline',
            iconTone: DomainIconTone.checkup,
            onPress: () => openNew('checkup'),
          },
          {
            label: '복약 일정',
            icon: 'medical-outline',
            iconTone: DomainIconTone.medication,
            onPress: () => openNew('medication'),
          },
        ]}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.screen, gap: Spacing.md },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterRow: {
    flexGrow: 0,
  },
  filterRowContent: {
    gap: Spacing.xs,
  },
  listContent: {
    gap: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  sectionGroup: {
    gap: Spacing.sm,
  },
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 56,
  },
  overdueCard: {
    gap: Spacing.sm,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 56,
  },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: Radius.input,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextGroup: {
    flex: 1,
    gap: Spacing.xxs,
  },
});
