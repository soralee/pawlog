import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { DDayChip } from '@/components/d-day-chip';
import { EmptyState } from '@/components/empty-state';
import { ListItem } from '@/components/list-item';
import { PetAvatar } from '@/components/pet-avatar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AvatarSize, Colors, IconTileTone, Radius, Spacing } from '@/constants/theme';
import { createCheckupRepository } from '@/db/repositories/checkup.repository';
import { createHealthRecordRepository } from '@/db/repositories/health-record.repository';
import { createHospitalExpenseRepository } from '@/db/repositories/hospital-expense.repository';
import { createMedicationRepository } from '@/db/repositories/medication.repository';
import { createPetRepository, type Pet } from '@/db/repositories/pet.repository';
import { createVaccinationRepository } from '@/db/repositories/vaccination.repository';
import { createWeightRecordRepository } from '@/db/repositories/weight-record.repository';
import {
  buildHomeDashboard,
  type HomeDashboardData,
  type PetDashboardInput,
  type TaggedScheduleEntry,
} from '@/features/home/build-home-dashboard';
import {
  daysUntil,
  formatAgeFromDateString,
  formatDateForDisplay,
  formatTimeForDisplay,
} from '@/utils/date';

const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 } as const;

function speciesLabel(species: Pet['species']): string {
  return species === 'dog' ? '강아지' : '고양이';
}

function petMetadata(pet: Pet): string {
  const age = formatAgeFromDateString(pet.birthDate);
  return [age || null, speciesLabel(pet.species)].filter(Boolean).join(' · ');
}

function scheduleIconFor(type: TaggedScheduleEntry['type']): {
  name: keyof typeof Ionicons.glyphMap;
  tone: keyof typeof IconTileTone;
} {
  return type === 'vaccination'
    ? { name: 'medkit-outline', tone: 'info' }
    : { name: 'heart-outline', tone: 'success' };
}

export default function HomeScreen() {
  const db = useSQLiteContext();
  const router = useRouter();

  const [hasAnyPet, setHasAnyPet] = useState<boolean | null>(null);
  const [dashboard, setDashboard] = useState<HomeDashboardData | null>(null);

  const load = useCallback(async () => {
    const pets = await createPetRepository(db).listPets();
    setHasAnyPet(pets.length > 0);
    if (pets.length === 0) {
      setDashboard(null);
      return;
    }

    const petsData: PetDashboardInput[] = await Promise.all(
      pets.map(async (pet) => {
        const [
          healthRecords,
          vaccinations,
          checkups,
          weightRecords,
          medications,
          hospitalExpenses,
        ] = await Promise.all([
          createHealthRecordRepository(db).listByPet(pet.id),
          createVaccinationRepository(db).listByPet(pet.id),
          createCheckupRepository(db).listByPet(pet.id),
          createWeightRecordRepository(db).listByPet(pet.id),
          createMedicationRepository(db).listByPet(pet.id),
          createHospitalExpenseRepository(db).listByPet(pet.id),
        ]);
        return {
          pet,
          healthRecords,
          vaccinations,
          checkups,
          weightRecords,
          medications,
          hospitalExpenses,
        };
      }),
    );

    setDashboard(buildHomeDashboard(petsData));
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      // 다른 탭에서 펫/기록/일정/복약/병원비를 추가·수정·삭제하고 돌아왔을 때 반영해야 한다.
      void load();
    }, [load]),
  );

  if (hasAnyPet === false) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText type="title">홈</ThemedText>
          <EmptyState
            icon="paw-outline"
            title="반려동물을 등록하고 건강 기록을 시작해 보세요."
            description='먼저 "내 반려동물" 탭에서 반려동물을 등록해주세요.'
            ctaLabel="반려동물 등록하기"
            onPressCta={() => router.push('/pets/new')}
          />
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (hasAnyPet === null || !dashboard) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedView style={styles.heroSkeleton} testID="home-loading-skeleton" />
        </SafeAreaView>
      </ThemedView>
    );
  }

  const isSinglePet = dashboard.petSummaries.length === 1;
  const primaryPet = dashboard.petSummaries[0].pet;
  const greetingPetNames = dashboard.petSummaries.map(({ pet }) => pet.name).join('·');
  // 펫이 한 마리면 병원비 펫별 Breakdown 등 중복 UI를 숨긴다(Graceful Mode).
  const showExpenseBreakdown = !isSinglePet;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedView style={styles.greetingRow}>
            <ThemedView style={styles.greetingTextGroup}>
              <ThemedText type="heading">안녕하세요, {greetingPetNames} 보호자님</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                오늘도 좋은 하루예요! 🧡
              </ThemedText>
            </ThemedView>
            <ThemedView accessible={false} style={styles.bellIcon}>
              <Ionicons name="notifications-outline" size={22} color={Colors.light.textSecondary} />
            </ThemedView>
          </ThemedView>

          {isSinglePet ? (
            <Pressable
              accessibilityLabel={primaryPet.name}
              onPress={() => router.push(`/pets/${primaryPet.id}`)}
              style={styles.heroBanner}
            >
              <PetAvatar photoUri={primaryPet.photoUri} size={AvatarSize.hero} />
              <ThemedView style={styles.heroInfo}>
                <ThemedText type="title">{primaryPet.name}</ThemedText>
                <ThemedView style={styles.heroMetaRow}>
                  <ThemedText type="small" themeColor="textSecondary">
                    {petMetadata(primaryPet)}
                  </ThemedText>
                  <Ionicons name="chevron-forward" size={16} color={Colors.light.textSecondary} />
                </ThemedView>
              </ThemedView>
            </Pressable>
          ) : (
            <ThemedView style={styles.section}>
              <ThemedView style={styles.cardRow}>
                <ThemedText type="heading">우리 아이들</ThemedText>
                <Pressable
                  accessibilityLabel="반려동물 추가"
                  hitSlop={HIT_SLOP}
                  onPress={() => router.push('/pets/new')}
                  style={styles.textAction}
                >
                  <ThemedText type="small" themeColor="primary">
                    + 추가
                  </ThemedText>
                </Pressable>
              </ThemedView>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petRow}>
                {dashboard.petSummaries.map(({ pet }) => (
                  <Pressable
                    key={pet.id}
                    accessibilityLabel={pet.name}
                    onPress={() => router.push(`/pets/${pet.id}`)}
                  >
                    <Card style={styles.petCard}>
                      <PetAvatar photoUri={pet.photoUri} size={AvatarSize.lg} />
                      <ThemedText type="smallBold">{pet.name}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {petMetadata(pet)}
                      </ThemedText>
                    </Card>
                  </Pressable>
                ))}
              </ScrollView>
            </ThemedView>
          )}

          <ThemedView style={styles.section}>
            <ThemedView style={styles.cardRow}>
              <ThemedText type="heading">다음 일정</ThemedText>
              <Pressable
                accessibilityLabel="일정 전체보기"
                hitSlop={HIT_SLOP}
                onPress={() => router.push('/schedule')}
                style={styles.textAction}
              >
                <ThemedText type="small" themeColor="primary">
                  전체보기
                </ThemedText>
              </Pressable>
            </ThemedView>
            {dashboard.upcomingSchedule.length > 0 ? (
              dashboard.upcomingSchedule.map((entry) => {
                const icon = scheduleIconFor(entry.type);
                const tileStyle = IconTileTone[icon.tone];
                const remaining = daysUntil(entry.date);
                const formattedDate = formatDateForDisplay(entry.date, 'schedule');
                return (
                  <Card key={entry.id} style={styles.scheduleCard}>
                    <ThemedView
                      style={[styles.iconTile, { backgroundColor: tileStyle.backgroundColor }]}
                    >
                      <Ionicons name={icon.name} size={20} color={tileStyle.color} />
                    </ThemedView>
                    <ThemedView type="surface" style={styles.scheduleCardText}>
                      <ThemedText type="smallBold">
                        {`[${entry.petName}] ${entry.title}`}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {formattedDate || '날짜를 설정해 주세요.'}
                      </ThemedText>
                    </ThemedView>
                    {remaining !== null ? <DDayChip daysUntil={remaining} /> : null}
                  </Card>
                );
              })
            ) : (
              <ThemedView style={styles.emptyScheduleBox}>
                <ThemedText type="default" themeColor="textSecondary">
                  예정된 일정이 없어요.
                </ThemedText>
                {dashboard.hasOverdueSchedule ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    지난 일정은 일정 탭에서 확인할 수 있어요.
                  </ThemedText>
                ) : null}
                <Button variant="secondary" onPress={() => router.push('/schedule')}>
                  일정 추가
                </Button>
              </ThemedView>
            )}
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="heading">오늘의 복약</ThemedText>
            {dashboard.todayMedications.length > 0 ? (
              <Card style={styles.listCard}>
                {dashboard.todayMedications.map(({ petId, petName, medication }, i) => (
                  <ListItem
                    key={`${petId}-${medication.id}`}
                    leading={
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
                    }
                    title={`[${petName}] ${medication.name}`}
                    subtitle={formatTimeForDisplay(medication.time)}
                    showDivider={i < dashboard.todayMedications.length - 1}
                  />
                ))}
              </Card>
            ) : (
              <ThemedText type="default" themeColor="textSecondary">
                오늘 복용할 약이 없어요.
              </ThemedText>
            )}
          </ThemedView>

          <ThemedView style={styles.section}>
            <Card style={styles.expenseCard}>
              <ThemedView type="surface" style={styles.cardRow}>
                <ThemedView type="surface" style={styles.expenseHeaderText}>
                  <ThemedText type="small" themeColor="textSecondary">
                    이번 달 병원비
                  </ThemedText>
                  <ThemedText type="display">
                    {dashboard.monthlyExpenseTotal.toLocaleString('ko-KR')}원
                  </ThemedText>
                </ThemedView>
                <ThemedView
                  style={[
                    styles.iconTile,
                    { backgroundColor: IconTileTone.primary.backgroundColor },
                  ]}
                >
                  <Ionicons
                    name="stats-chart-outline"
                    size={22}
                    color={IconTileTone.primary.color}
                    testID="home-expense-chart-icon"
                  />
                </ThemedView>
              </ThemedView>
              {showExpenseBreakdown &&
                dashboard.monthlyExpenseByPet.map((row) => (
                  <ThemedView key={row.petId} type="surface" style={styles.cardRow}>
                    <ThemedText type="default" themeColor="textSecondary">
                      {row.petName}
                    </ThemedText>
                    <ThemedText type="default" themeColor="textSecondary">
                      {row.amount.toLocaleString('ko-KR')}원
                    </ThemedText>
                  </ThemedView>
                ))}
            </Card>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedView style={styles.cardRow}>
              <ThemedText type="heading">최근 기록</ThemedText>
              <Pressable
                accessibilityLabel="기록 전체보기"
                hitSlop={HIT_SLOP}
                onPress={() => router.push('/records')}
                style={styles.textAction}
              >
                <ThemedText type="small" themeColor="primary">
                  전체보기
                </ThemedText>
              </Pressable>
            </ThemedView>
            {dashboard.recentRecords.length > 0 ? (
              dashboard.recentRecords.map((record, i) => (
                <ListItem
                  key={record.id}
                  leadingText={formatDateForDisplay(record.date, 'list')}
                  title={`[${record.petName}] ${record.title}`}
                  subtitle={record.subtitle}
                  showDivider={i < dashboard.recentRecords.length - 1}
                />
              ))
            ) : (
              <ThemedText type="default" themeColor="textSecondary">
                아직 기록이 없어요.
              </ThemedText>
            )}
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.screen },
  content: { gap: Spacing.lg, paddingVertical: Spacing.md },
  heroSkeleton: {
    height: 128,
    borderRadius: Radius.largeCard,
    backgroundColor: Colors.light.divider,
    marginTop: Spacing.md,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingTextGroup: {
    flex: 1,
    gap: Spacing.xxs,
  },
  bellIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.light.primaryLight,
    borderRadius: Radius.largeCard,
    padding: Spacing.md,
  },
  heroInfo: {
    flex: 1,
    gap: Spacing.xxs,
    backgroundColor: 'transparent',
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
    backgroundColor: 'transparent',
  },
  section: { gap: Spacing.sm },
  petRow: { flexGrow: 0 },
  petCard: { gap: Spacing.xxs, marginRight: Spacing.sm, minWidth: 140 },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textAction: {
    minHeight: 44,
    justifyContent: 'center',
  },
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  scheduleCardText: {
    flex: 1,
    gap: Spacing.xxs,
  },
  emptyScheduleBox: {
    gap: Spacing.xs,
    alignItems: 'flex-start',
  },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: Radius.input,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listCard: {
    paddingVertical: Spacing.xs,
  },
  expenseCard: {
    gap: Spacing.xs,
  },
  expenseHeaderText: {
    gap: Spacing.xxs,
  },
});
