import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddCircleButton } from '@/components/add-circle-button';
import { Card } from '@/components/card';
import { EmptyState } from '@/components/empty-state';
import { PetAvatar } from '@/components/pet-avatar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AvatarSize, Colors, Spacing } from '@/constants/theme';
import { createCheckupRepository } from '@/db/repositories/checkup.repository';
import { createPetRepository, type Pet } from '@/db/repositories/pet.repository';
import { createVaccinationRepository } from '@/db/repositories/vaccination.repository';
import { aggregateSchedule, getNextUpcomingSchedule } from '@/features/schedule/aggregate-schedule';
import { daysUntil, formatAgeFromDateString, formatDDay } from '@/utils/date';

type PetCardData = {
  pet: Pet;
  nextScheduleLabel: string | null;
  hasNextSchedule: boolean;
  hasOverdueSchedule: boolean;
};

export default function PetsScreen() {
  const db = useSQLiteContext();
  const router = useRouter();

  const [cards, setCards] = useState<PetCardData[] | null>(null);

  const load = useCallback(async () => {
    const pets = await createPetRepository(db).listPets();
    const withSchedule = await Promise.all(
      pets.map(async (pet) => {
        const [vaccinations, checkups] = await Promise.all([
          createVaccinationRepository(db).listByPet(pet.id),
          createCheckupRepository(db).listByPet(pet.id),
        ]);
        const allEntries = aggregateSchedule(vaccinations, checkups);
        const next = getNextUpcomingSchedule(vaccinations, checkups);
        const remaining = next ? daysUntil(next.date) : null;
        const hasNextSchedule = Boolean(next && remaining !== null);
        const hasOverdueSchedule = !hasNextSchedule && allEntries.length > 0;
        const nextScheduleLabel =
          next && remaining !== null
            ? `다음 일정 · ${next.title} ${formatDDay(remaining)}`
            : hasOverdueSchedule
              ? '다가오는 일정 없음'
              : null;
        return { pet, nextScheduleLabel, hasNextSchedule, hasOverdueSchedule };
      }),
    );
    setCards(withSchedule);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      // 등록/수정/삭제 후 돌아왔을 때 최신 목록을 반영해야 한다.
      void load();
    }, [load]),
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">내 반려동물</ThemedText>
          <AddCircleButton
            accessibilityLabel="반려동물 추가"
            onPress={() => router.push('/pets/new')}
          />
        </ThemedView>

        {cards && cards.length === 0 && (
          <EmptyState
            icon="paw-outline"
            title="등록된 반려동물이 없어요."
            description="첫 반려동물을 등록해 보세요."
            ctaLabel="반려동물 등록하기"
            onPressCta={() => router.push('/pets/new')}
          />
        )}

        {cards && cards.length > 0 && (
          <ScrollView contentContainerStyle={styles.list}>
            {cards.map(({ pet, nextScheduleLabel, hasNextSchedule, hasOverdueSchedule }) => {
              const ageText = formatAgeFromDateString(pet.birthDate);
              return (
                <Pressable
                  key={pet.id}
                  accessibilityLabel={pet.name}
                  onPress={() => router.push(`/pets/${pet.id}`)}
                >
                  <Card style={[styles.card, styles.cardRow]}>
                    <PetAvatar photoUri={pet.photoUri} size={AvatarSize.lg} />
                    <ThemedView type="surface" style={styles.cardText}>
                      <ThemedText type="heading">{pet.name}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {[ageText || null, pet.species === 'dog' ? '강아지' : '고양이']
                          .filter(Boolean)
                          .join(' · ')}
                      </ThemedText>
                      {nextScheduleLabel ? (
                        <ThemedText
                          type="small"
                          themeColor={hasNextSchedule ? 'primary' : 'textSecondary'}
                        >
                          {nextScheduleLabel}
                        </ThemedText>
                      ) : null}
                      {hasOverdueSchedule ? (
                        <ThemedText type="small" themeColor="textSecondary">
                          지난 일정은 일정 탭에서 확인할 수 있어요.
                        </ThemedText>
                      ) : null}
                    </ThemedView>
                    <Ionicons name="chevron-forward" size={20} color={Colors.light.textMuted} />
                  </Card>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </SafeAreaView>
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
  list: { gap: Spacing.sm },
  card: { gap: Spacing.xxs },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  cardText: { flex: 1, gap: Spacing.xxs },
});
