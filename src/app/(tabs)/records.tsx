import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ListItem } from '@/components/list-item';
import { OptionSheet } from '@/components/option-sheet';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { createCheckupRepository } from '@/db/repositories/checkup.repository';
import { createHealthRecordRepository } from '@/db/repositories/health-record.repository';
import { createPetRepository } from '@/db/repositories/pet.repository';
import { createVaccinationRepository } from '@/db/repositories/vaccination.repository';
import { createWeightRecordRepository } from '@/db/repositories/weight-record.repository';
import { useAppStore } from '@/stores/app.store';

type RecordType = 'health' | 'vaccination' | 'checkup' | 'weight';
type FilterKey = 'all' | RecordType;

type TimelineEntry = {
  id: string;
  type: RecordType;
  date: string;
  title: string;
  subtitle?: string;
};

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'health', label: '건강' },
  { key: 'vaccination', label: '접종' },
  { key: 'checkup', label: '검진' },
  { key: 'weight', label: '체중' },
];

function monthGroupKey(dateStr: string): string {
  const [year, month] = dateStr.split('-');
  return `${year}년 ${Number(month)}월`;
}

export default function RecordsScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const petRepository = useMemo(() => createPetRepository(db), [db]);
  const selectedPetId = useAppStore((state) => state.selectedPetId);
  const setSelectedPetId = useAppStore((state) => state.setSelectedPetId);

  const [hasAnyPet, setHasAnyPet] = useState<boolean | null>(null);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
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
    const [healthRecords, vaccinations, checkups, weightRecords] = await Promise.all([
      createHealthRecordRepository(db).listByPet(selectedPetId),
      createVaccinationRepository(db).listByPet(selectedPetId),
      createCheckupRepository(db).listByPet(selectedPetId),
      createWeightRecordRepository(db).listByPet(selectedPetId),
    ]);

    const all: TimelineEntry[] = [
      ...healthRecords.map((r) => ({
        id: r.id,
        type: 'health' as const,
        date: r.recordedAt,
        title: '건강 기록',
        subtitle: r.note,
      })),
      ...vaccinations.map((r) => ({
        id: r.id,
        type: 'vaccination' as const,
        date: r.vaccinatedAt,
        title: r.vaccineName,
        subtitle: r.hospitalName ?? undefined,
      })),
      ...checkups.map((r) => ({
        id: r.id,
        type: 'checkup' as const,
        date: r.checkedAt,
        title: r.checkupType,
        subtitle: r.hospitalName ?? undefined,
      })),
      ...weightRecords.map((r) => ({
        id: r.id,
        type: 'weight' as const,
        date: r.measuredAt,
        title: `체중 ${r.weightKg}kg`,
      })),
    ];
    all.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    setEntries(all);
  }, [db, selectedPetId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SQLite(외부 시스템) 동기화용 마운트 시 fetch
    void ensureSelectedPet();
  }, [ensureSelectedPet]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SQLite(외부 시스템) 동기화용 마운트 시 fetch
    void loadEntries();
  }, [loadEntries]);

  const filtered = filter === 'all' ? entries : entries.filter((entry) => entry.type === filter);

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

  function openNew(type: RecordType) {
    if (type === 'health') router.push('/health-record/new');
    else if (type === 'vaccination') router.push('/vaccination/new');
    else if (type === 'checkup') router.push('/checkup/new');
    else router.push('/weight/new');
  }

  function openDetail(entry: TimelineEntry) {
    if (entry.type === 'health') router.push(`/health-record/${entry.id}`);
    else if (entry.type === 'vaccination') router.push(`/vaccination/${entry.id}`);
    else if (entry.type === 'checkup') router.push(`/checkup/${entry.id}`);
    else router.push(`/weight/${entry.id}`);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">기록</ThemedText>
          {hasAnyPet ? (
            <Pressable accessibilityLabel="기록 추가" onPress={() => setSheetVisible(true)}>
              <ThemedText type="title">+</ThemedText>
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
                title="아직 건강 기록이 없어요."
                description="오늘부터 우리 아이의 건강을 하나씩 기록해 보세요."
                ctaLabel="첫 기록 남기기"
                onPressCta={() => setSheetVisible(true)}
              />
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
                        title={entry.title}
                        subtitle={subtitleFor(entry)}
                        trailing={<ThemedText themeColor="textSecondary">{'>'}</ThemedText>}
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

      <OptionSheet
        visible={sheetVisible}
        title="어떤 기록을 남길까요?"
        onClose={() => setSheetVisible(false)}
        options={[
          { label: '건강 기록', onPress: () => openNew('health') },
          { label: '예방접종', onPress: () => openNew('vaccination') },
          { label: '건강검진', onPress: () => openNew('checkup') },
          { label: '체중', onPress: () => openNew('weight') },
        ]}
      />
    </ThemedView>
  );
}

function subtitleFor(entry: TimelineEntry): string {
  const parts = [entry.date];
  if (entry.subtitle) parts.push(entry.subtitle);
  return parts.join(' · ');
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
  group: {
    marginBottom: Spacing.sm,
  },
});
