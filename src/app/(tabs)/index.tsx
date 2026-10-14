import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/card';
import { DDayChip } from '@/components/d-day-chip';
import { ListItem } from '@/components/list-item';
import { PetAvatar } from '@/components/pet-avatar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { createCheckupRepository } from '@/db/repositories/checkup.repository';
import { createHealthRecordRepository } from '@/db/repositories/health-record.repository';
import { createHospitalExpenseRepository } from '@/db/repositories/hospital-expense.repository';
import { createMedicationRepository } from '@/db/repositories/medication.repository';
import { createPetRepository } from '@/db/repositories/pet.repository';
import { createVaccinationRepository } from '@/db/repositories/vaccination.repository';
import { createWeightRecordRepository } from '@/db/repositories/weight-record.repository';
import {
  buildHomeDashboard,
  type HomeDashboardData,
  type PetDashboardInput,
} from '@/features/home/build-home-dashboard';
import { daysUntil, formatAge } from '@/utils/date';

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

  if (hasAnyPet === false || !dashboard) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText type="title">홈</ThemedText>
          <ThemedText type="default">
            먼저 &quot;내 반려동물&quot; 탭에서 반려동물을 등록해주세요.
          </ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  // 펫이 한 마리면 병원비 펫별 Breakdown 등 중복 UI를 숨긴다(Graceful Mode).
  const showExpenseBreakdown = dashboard.petSummaries.length > 1;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="default" themeColor="textSecondary">
            오늘도 아이들의 건강을 챙겨볼까요?
          </ThemedText>

          <ThemedView style={styles.section}>
            <ThemedView style={styles.cardRow}>
              <ThemedText type="heading">우리 아이들</ThemedText>
              <Pressable
                accessibilityLabel="반려동물 추가"
                onPress={() => router.push('/pets/new')}
              >
                <ThemedText type="small" themeColor="primary">
                  + 추가
                </ThemedText>
              </Pressable>
            </ThemedView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petRow}>
              {dashboard.petSummaries.map(({ pet, actionLabel }) => (
                <Pressable
                  key={pet.id}
                  accessibilityLabel={pet.name}
                  onPress={() => router.push(`/pets/${pet.id}`)}
                >
                  <Card style={styles.petCard}>
                    <PetAvatar photoUri={pet.photoUri} size={40} />
                    <ThemedText type="default">{pet.name}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {formatAge(new Date(pet.birthDate))} ·{' '}
                      {pet.species === 'dog' ? '강아지' : '고양이'}
                    </ThemedText>
                    {actionLabel ? (
                      <ThemedText type="small" themeColor="primary">
                        {actionLabel}
                      </ThemedText>
                    ) : null}
                  </Card>
                </Pressable>
              ))}
            </ScrollView>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedView style={styles.cardRow}>
              <ThemedText type="heading">다가오는 일정</ThemedText>
              <Pressable
                accessibilityLabel="일정 전체보기"
                onPress={() => router.push('/schedule')}
              >
                <ThemedText type="small" themeColor="primary">
                  전체보기
                </ThemedText>
              </Pressable>
            </ThemedView>
            {dashboard.upcomingSchedule.length > 0 ? (
              dashboard.upcomingSchedule.map((entry) => (
                <ListItem
                  key={entry.id}
                  title={`[${entry.petName}] ${entry.title}`}
                  subtitle={entry.date}
                  trailing={<DDayChip daysUntil={daysUntil(entry.date)} />}
                />
              ))
            ) : (
              <ThemedText type="default" themeColor="textSecondary">
                다가오는 일정이 없어요.
              </ThemedText>
            )}
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="heading">오늘의 복약</ThemedText>
            {dashboard.todayMedications.length > 0 ? (
              dashboard.todayMedications.map(({ petId, petName, medication }) => (
                <ListItem
                  key={`${petId}-${medication.id}`}
                  title={`[${petName}] ${medication.name}`}
                  subtitle={medication.time}
                />
              ))
            ) : (
              <ThemedText type="default" themeColor="textSecondary">
                오늘 복용할 약이 없어요.
              </ThemedText>
            )}
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="heading">이번 달 병원비</ThemedText>
            <ThemedView style={styles.cardRow}>
              <ThemedText type="default">전체</ThemedText>
              <ThemedText type="display">
                {dashboard.monthlyExpenseTotal.toLocaleString('ko-KR')}원
              </ThemedText>
            </ThemedView>
            {showExpenseBreakdown &&
              dashboard.monthlyExpenseByPet.map((row) => (
                <ThemedView key={row.petId} style={styles.cardRow}>
                  <ThemedText type="default" themeColor="textSecondary">
                    {row.petName}
                  </ThemedText>
                  <ThemedText type="default" themeColor="textSecondary">
                    {row.amount.toLocaleString('ko-KR')}원
                  </ThemedText>
                </ThemedView>
              ))}
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedView style={styles.cardRow}>
              <ThemedText type="heading">최근 기록</ThemedText>
              <Pressable accessibilityLabel="기록 전체보기" onPress={() => router.push('/records')}>
                <ThemedText type="small" themeColor="primary">
                  전체보기
                </ThemedText>
              </Pressable>
            </ThemedView>
            {dashboard.recentRecords.length > 0 ? (
              dashboard.recentRecords.map((record) => (
                <ListItem
                  key={record.id}
                  title={`[${record.petName}] ${record.title}`}
                  subtitle={record.date}
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
  safeArea: { flex: 1, paddingHorizontal: Spacing.lg },
  content: { gap: Spacing.lg, paddingVertical: Spacing.md },
  section: { gap: Spacing.xs },
  petRow: { flexGrow: 0 },
  petCard: { gap: Spacing.xxs, marginRight: Spacing.sm, minWidth: 140 },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
