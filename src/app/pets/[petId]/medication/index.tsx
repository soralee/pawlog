import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ListItem } from '@/components/list-item';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import {
  createMedicationRepository,
  type Medication,
} from '@/db/repositories/medication.repository';
import { splitMedications } from '@/features/medication/split-medications';

export default function MedicationScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { petId } = useLocalSearchParams<{ petId: string }>();

  const [medications, setMedications] = useState<Medication[]>([]);

  const load = useCallback(async () => {
    setMedications(await createMedicationRepository(db).listByPet(petId));
  }, [db, petId]);

  useFocusEffect(
    useCallback(() => {
      // 등록/수정/삭제 후 돌아왔을 때 최신 목록을 반영해야 한다.
      void load();
    }, [load]),
  );

  const { active, ended } = useMemo(() => splitMedications(medications), [medications]);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: '복약 관리',
          headerRight: () => (
            <Pressable
              accessibilityLabel="복약 추가"
              onPress={() => router.push(`/pets/${petId}/medication/new`)}
            >
              <Ionicons name="add" size={24} color={Colors.light.primary} />
            </Pressable>
          ),
        }}
      />
      <SafeAreaView style={styles.safeArea}>
        {medications.length === 0 ? (
          <EmptyState
            title="등록된 복약이 없어요."
            description="복용 중인 약이나 영양제를 등록해 보세요."
            ctaLabel="복약 추가하기"
            onPressCta={() => router.push(`/pets/${petId}/medication/new`)}
          />
        ) : (
          <ScrollView>
            <ThemedText type="small" themeColor="textSecondary">
              복용 중
            </ThemedText>
            {active.map((medication) => (
              <ListItem
                key={medication.id}
                title={medication.name}
                subtitle={`${medication.frequency} ${medication.time}`}
                trailing={
                  <Ionicons name="chevron-forward" size={20} color={Colors.light.textMuted} />
                }
                onPress={() => router.push(`/pets/${petId}/medication/${medication.id}`)}
              />
            ))}

            {ended.length > 0 && (
              <>
                <ThemedText type="small" themeColor="textSecondary" style={styles.endedLabel}>
                  종료된 복약
                </ThemedText>
                {ended.map((medication) => (
                  <ListItem
                    key={medication.id}
                    title={medication.name}
                    subtitle={`${medication.frequency} ${medication.time}`}
                    trailing={
                      <Ionicons name="chevron-forward" size={20} color={Colors.light.textMuted} />
                    }
                    onPress={() => router.push(`/pets/${petId}/medication/${medication.id}`)}
                  />
                ))}
              </>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.lg, gap: Spacing.md },
  endedLabel: {
    marginTop: Spacing.sm,
  },
});
