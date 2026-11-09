import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddCircleButton } from '@/components/add-circle-button';
import { Chip } from '@/components/chip';
import { EmptyState } from '@/components/empty-state';
import { ListItem } from '@/components/list-item';
import { OptionSheet } from '@/components/option-sheet';
import { PetSwitchSheet } from '@/components/pet-switch-sheet';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, DomainIconTone, Spacing } from '@/constants/theme';
import { createCheckupRepository } from '@/db/repositories/checkup.repository';
import { createHealthRecordRepository } from '@/db/repositories/health-record.repository';
import { createHospitalExpenseRepository } from '@/db/repositories/hospital-expense.repository';
import { createPetRepository, type Pet } from '@/db/repositories/pet.repository';
import { createVaccinationRepository } from '@/db/repositories/vaccination.repository';
import { createWeightRecordRepository } from '@/db/repositories/weight-record.repository';
import { filterByPet, showsPetFilter, type PetFilterValue } from '@/features/pets/pet-filter';
import { formatDateForDisplay } from '@/utils/date';

type RecordType = 'health' | 'vaccination' | 'checkup' | 'weight' | 'hospital-expense';
type AddRecordType = RecordType | 'medication';
type FilterKey = 'all' | RecordType;

type TimelineEntry = {
  id: string;
  petId: string;
  petName: string;
  type: RecordType;
  date: string;
  title: string;
  subtitle?: string;
};

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'health', label: '건강 기록' },
  { key: 'vaccination', label: '예방접종' },
  { key: 'checkup', label: '건강검진' },
  { key: 'weight', label: '체중' },
  { key: 'hospital-expense', label: '병원비' },
];

function monthGroupKey(dateStr: string): string {
  const [year, month] = dateStr.split('-');
  return `${year}년 ${Number(month)}월`;
}

export default function RecordsScreen() {
  const db = useSQLiteContext();
  const router = useRouter();

  const [pets, setPets] = useState<Pet[]>([]);
  const [hasAnyPet, setHasAnyPet] = useState<boolean | null>(null);
  const [petFilter, setPetFilter] = useState<PetFilterValue>('all');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [petSelectVisible, setPetSelectVisible] = useState(false);
  const [targetPetId, setTargetPetId] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    const petList = await createPetRepository(db).listPets();
    setPets(petList);
    setHasAnyPet(petList.length > 0);

    const perPet = await Promise.all(
      petList.map(async (pet) => {
        const [healthRecords, vaccinations, checkups, weightRecords, hospitalExpenses] =
          await Promise.all([
            createHealthRecordRepository(db).listByPet(pet.id),
            createVaccinationRepository(db).listByPet(pet.id),
            createCheckupRepository(db).listByPet(pet.id),
            createWeightRecordRepository(db).listByPet(pet.id),
            createHospitalExpenseRepository(db).listByPet(pet.id),
          ]);

        const petEntries: TimelineEntry[] = [
          ...healthRecords.map((r) => ({
            id: r.id,
            petId: pet.id,
            petName: pet.name,
            type: 'health' as const,
            date: r.recordedAt,
            title: '건강 기록',
            subtitle: r.note,
          })),
          // 완료하지 않은(vaccinatedAt/checkedAt이 없는) 예정 일정은 "일정" 탭 몫이라 뺀다.
          ...vaccinations
            .filter((r) => r.vaccinatedAt)
            .map((r) => ({
              id: r.id,
              petId: pet.id,
              petName: pet.name,
              type: 'vaccination' as const,
              date: r.vaccinatedAt!,
              title: r.vaccineName,
              subtitle: r.hospitalName ?? undefined,
            })),
          ...checkups
            .filter((r) => r.checkedAt)
            .map((r) => ({
              id: r.id,
              petId: pet.id,
              petName: pet.name,
              type: 'checkup' as const,
              date: r.checkedAt!,
              title: r.checkupType,
              subtitle: r.hospitalName ?? undefined,
            })),
          ...weightRecords.map((r) => ({
            id: r.id,
            petId: pet.id,
            petName: pet.name,
            type: 'weight' as const,
            date: r.measuredAt,
            title: `체중 ${r.weightKg}kg`,
          })),
          ...hospitalExpenses.map((r) => ({
            id: r.id,
            petId: pet.id,
            petName: pet.name,
            type: 'hospital-expense' as const,
            date: r.spentAt,
            title: `${r.amount.toLocaleString('ko-KR')}원`,
            subtitle: [r.hospitalName, r.description].filter(Boolean).join(' · ') || undefined,
          })),
        ];
        return petEntries;
      }),
    );

    const all = perPet.flat();
    all.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    setEntries(all);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      // 다른 화면에서 기록을 추가/수정/삭제하고 돌아왔을 때 최신 목록을 반영해야 한다.
      void loadAll();
    }, [loadAll]),
  );

  const showPetFilter = showsPetFilter(pets);
  const byPet = filterByPet(entries, petFilter);
  const filtered = filter === 'all' ? byPet : byPet.filter((entry) => entry.type === filter);
  const showPetTag = showPetFilter && petFilter === 'all';

  const groups = useMemo(() => {
    const result: { key: string; items: TimelineEntry[] }[] = [];
    for (const entry of filtered) {
      const key = monthGroupKey(entry.date);
      const last = result[result.length - 1];
      if (last && last.key === key) {
        last.items.push(entry);
      } else {
        result.push({ key, items: [entry] });
      }
    }
    return result;
  }, [filtered]);

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

  function openNew(type: AddRecordType) {
    if (!targetPetId) return;
    if (type === 'health') router.push(`/pets/${targetPetId}/health-record/new`);
    else if (type === 'vaccination') router.push(`/pets/${targetPetId}/vaccination/new`);
    else if (type === 'checkup') router.push(`/pets/${targetPetId}/checkup/new`);
    else if (type === 'medication') router.push(`/pets/${targetPetId}/medication/new`);
    else if (type === 'weight') router.push(`/pets/${targetPetId}/weight/new`);
    else router.push(`/pets/${targetPetId}/hospital-expense/new`);
  }

  function openDetail(entry: TimelineEntry) {
    if (entry.type === 'health') router.push(`/pets/${entry.petId}/health-record/${entry.id}`);
    else if (entry.type === 'vaccination')
      router.push(`/pets/${entry.petId}/vaccination/${entry.id}`);
    else if (entry.type === 'checkup') router.push(`/pets/${entry.petId}/checkup/${entry.id}`);
    else if (entry.type === 'weight') router.push(`/pets/${entry.petId}/weight/${entry.id}`);
    else router.push(`/pets/${entry.petId}/hospital-expense/${entry.id}`);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">기록</ThemedText>
          {hasAnyPet ? (
            <AddCircleButton accessibilityLabel="기록 추가" onPress={openAddFlow} />
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

            {filtered.length === 0 ? (
              entries.length === 0 ? (
                <EmptyState
                  icon="document-text-outline"
                  title="아직 건강 기록이 없어요."
                  description="오늘부터 우리 아이의 건강을 하나씩 기록해 보세요."
                  ctaLabel="첫 기록 남기기"
                  onPressCta={openAddFlow}
                />
              ) : (
                <EmptyState
                  icon="document-text-outline"
                  title="해당하는 기록이 없어요."
                  description="다른 필터를 선택하거나 새 기록을 추가해 보세요."
                  ctaLabel="기록 추가하기"
                  onPressCta={openAddFlow}
                />
              )
            ) : (
              <ScrollView>
                {groups.map((group) => (
                  <ThemedView key={group.key} style={styles.group}>
                    <ThemedText type="small" themeColor="textSecondary">
                      {group.key}
                    </ThemedText>
                    {group.items.map((entry) => (
                      <ListItem
                        key={entry.id}
                        title={showPetTag ? `[${entry.petName}] ${entry.title}` : entry.title}
                        subtitle={subtitleFor(entry)}
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
                ))}
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
        title="어떤 기록을 남길까요?"
        onClose={() => setSheetVisible(false)}
        options={[
          {
            label: '건강 기록',
            icon: 'document-text-outline',
            iconTone: DomainIconTone.health,
            onPress: () => openNew('health'),
          },
          {
            label: '예방접종',
            icon: 'medkit-outline',
            iconTone: DomainIconTone.vaccination,
            onPress: () => openNew('vaccination'),
          },
          {
            label: '건강검진',
            icon: 'heart-outline',
            iconTone: DomainIconTone.checkup,
            onPress: () => openNew('checkup'),
          },
          {
            label: '복약',
            icon: 'medical-outline',
            iconTone: DomainIconTone.medication,
            onPress: () => openNew('medication'),
          },
          {
            label: '체중',
            icon: 'scale-outline',
            iconTone: DomainIconTone.weight,
            onPress: () => openNew('weight'),
          },
          {
            label: '병원비',
            icon: 'wallet-outline',
            iconTone: DomainIconTone['hospital-expense'],
            onPress: () => openNew('hospital-expense'),
          },
        ]}
      />
    </ThemedView>
  );
}

function subtitleFor(entry: TimelineEntry): string {
  const formattedDate = formatDateForDisplay(entry.date, 'list');
  const parts = [formattedDate || null, entry.subtitle || null].filter(Boolean);
  return parts.join(' · ');
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
  group: {
    marginBottom: Spacing.sm,
  },
});
