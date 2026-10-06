import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DDayChip } from '@/components/d-day-chip';
import { ListItem } from '@/components/list-item';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { createCheckupRepository } from '@/db/repositories/checkup.repository';
import { createHealthRecordRepository } from '@/db/repositories/health-record.repository';
import { createHospitalExpenseRepository } from '@/db/repositories/hospital-expense.repository';
import { createMedicationRepository } from '@/db/repositories/medication.repository';
import { createPetRepository, type Pet } from '@/db/repositories/pet.repository';
import { createVaccinationRepository } from '@/db/repositories/vaccination.repository';
import { createWeightRecordRepository } from '@/db/repositories/weight-record.repository';
import { buildHomeDashboard, type HomeDashboardData } from '@/features/home/build-home-dashboard';
import { useAppStore } from '@/stores/app.store';
import { daysUntil, formatAge } from '@/utils/date';

export default function HomeScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const selectedPetId = useAppStore((state) => state.selectedPetId);
  const setSelectedPetId = useAppStore((state) => state.setSelectedPetId);

  const [pet, setPet] = useState<Pet | null>(null);
  const [dashboard, setDashboard] = useState<HomeDashboardData | null>(null);

  const load = useCallback(async () => {
    let petId = selectedPetId;
    if (!petId) {
      // 다른 탭을 거치지 않고 홈에 먼저 들어온 경우, 반려동물이 있다면 자동으로 첫 번째를 선택한다.
      const pets = await createPetRepository(db).listPets();
      if (pets.length > 0) {
        petId = pets[0].id;
        setSelectedPetId(petId);
      }
    }
    if (!petId) {
      setPet(null);
      setDashboard(null);
      return;
    }
    const [
      foundPet,
      healthRecords,
      vaccinations,
      checkups,
      weightRecords,
      medications,
      hospitalExpenses,
    ] = await Promise.all([
      createPetRepository(db).getPet(petId),
      createHealthRecordRepository(db).listByPet(petId),
      createVaccinationRepository(db).listByPet(petId),
      createCheckupRepository(db).listByPet(petId),
      createWeightRecordRepository(db).listByPet(petId),
      createMedicationRepository(db).listByPet(petId),
      createHospitalExpenseRepository(db).listByPet(petId),
    ]);
    setPet(foundPet);
    setDashboard(
      buildHomeDashboard({
        healthRecords,
        vaccinations,
        checkups,
        weightRecords,
        medications,
        hospitalExpenses,
      }),
    );
  }, [db, selectedPetId, setSelectedPetId]);

  useFocusEffect(
    useCallback(() => {
      // 다른 탭에서 기록/일정/복약/병원비를 추가·수정·삭제하고 돌아왔을 때 반영해야 한다.
      void load();
    }, [load]),
  );

  if (!pet || !dashboard) {
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

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedView>
            <ThemedText type="title">{pet.name}</ThemedText>
            <ThemedText type="default" themeColor="textSecondary">
              {formatAge(new Date(pet.birthDate))} · {pet.species === 'dog' ? '강아지' : '고양이'} ·{' '}
              {pet.gender === 'male' ? '남아' : '여아'}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="heading">다음 일정</ThemedText>
            {dashboard.nextSchedule ? (
              <ThemedView style={styles.card}>
                <ThemedView style={styles.cardRow}>
                  <ThemedText type="default">{dashboard.nextSchedule.title}</ThemedText>
                  <DDayChip daysUntil={daysUntil(dashboard.nextSchedule.date)} />
                </ThemedView>
                <ThemedText type="small" themeColor="textSecondary">
                  {dashboard.nextSchedule.date}
                </ThemedText>
              </ThemedView>
            ) : (
              <ThemedText type="default" themeColor="textSecondary">
                다가오는 일정이 없어요.
              </ThemedText>
            )}
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="heading">오늘의 복약</ThemedText>
            {dashboard.todayMedications.length > 0 ? (
              dashboard.todayMedications.map((medication) => (
                <ListItem key={medication.id} title={medication.name} subtitle={medication.time} />
              ))
            ) : (
              <ThemedText type="default" themeColor="textSecondary">
                오늘 복용할 약이 없어요.
              </ThemedText>
            )}
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="heading">이번 달 병원비</ThemedText>
            <ThemedText type="display">
              {dashboard.monthlyExpenseTotal.toLocaleString('ko-KR')}원
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedView style={styles.cardRow}>
              <ThemedText type="heading">최근 기록</ThemedText>
              <Pressable accessibilityLabel="전체보기" onPress={() => router.push('/records')}>
                <ThemedText type="small" themeColor="primary">
                  전체보기
                </ThemedText>
              </Pressable>
            </ThemedView>
            {dashboard.recentRecords.length > 0 ? (
              dashboard.recentRecords.map((record) => (
                <ListItem key={record.id} title={record.title} subtitle={record.date} />
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
  card: {
    backgroundColor: Colors.light.primaryLight,
    borderRadius: Radius.largeCard,
    padding: Spacing.md,
    gap: Spacing.xxs,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
