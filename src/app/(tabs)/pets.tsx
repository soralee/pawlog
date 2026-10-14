import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/card';
import { EmptyState } from '@/components/empty-state';
import { PetAvatar } from '@/components/pet-avatar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { createCheckupRepository } from '@/db/repositories/checkup.repository';
import { createPetRepository, type Pet } from '@/db/repositories/pet.repository';
import { createVaccinationRepository } from '@/db/repositories/vaccination.repository';
import { aggregateSchedule } from '@/features/schedule/aggregate-schedule';
import { daysUntil, formatAge } from '@/utils/date';

type PetCardData = { pet: Pet; nextScheduleLabel: string | null };

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
        const next = aggregateSchedule(vaccinations, checkups)[0];
        const nextScheduleLabel = next
          ? `다음 일정 · ${next.title} D-${daysUntil(next.date)}`
          : null;
        return { pet, nextScheduleLabel };
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
          <Pressable accessibilityLabel="반려동물 추가" onPress={() => router.push('/pets/new')}>
            <Ionicons name="add" size={24} color={Colors.light.primary} />
          </Pressable>
        </ThemedView>

        {cards && cards.length === 0 && (
          <EmptyState
            title="등록된 반려동물이 없어요."
            description="첫 반려동물을 등록해 보세요."
            ctaLabel="반려동물 등록하기"
            onPressCta={() => router.push('/pets/new')}
          />
        )}

        {cards && cards.length > 0 && (
          <ScrollView contentContainerStyle={styles.list}>
            {cards.map(({ pet, nextScheduleLabel }) => (
              <Pressable
                key={pet.id}
                accessibilityLabel={pet.name}
                onPress={() => router.push(`/pets/${pet.id}`)}
              >
                <Card style={[styles.card, styles.cardRow]}>
                  <PetAvatar photoUri={pet.photoUri} size={56} />
                  <ThemedView style={styles.cardText}>
                    <ThemedText type="heading">{pet.name}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {formatAge(new Date(pet.birthDate))} ·{' '}
                      {pet.species === 'dog' ? '강아지' : '고양이'}
                    </ThemedText>
                    {nextScheduleLabel ? (
                      <ThemedText type="small" themeColor="primary">
                        {nextScheduleLabel}
                      </ThemedText>
                    ) : null}
                  </ThemedView>
                </Card>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
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
  list: { gap: Spacing.sm },
  card: { gap: Spacing.xxs },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  cardText: { flex: 1, gap: Spacing.xxs },
});
