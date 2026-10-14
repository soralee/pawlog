import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ListItem } from '@/components/list-item';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import {
  createHealthRecordRepository,
  type HealthRecord,
} from '@/db/repositories/health-record.repository';

export default function HealthRecordScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { petId } = useLocalSearchParams<{ petId: string }>();

  const [records, setRecords] = useState<HealthRecord[]>([]);

  const load = useCallback(async () => {
    setRecords(await createHealthRecordRepository(db).listByPet(petId));
  }, [db, petId]);

  useFocusEffect(
    useCallback(() => {
      // 등록/수정/삭제 후 돌아왔을 때 최신 목록을 반영해야 한다.
      void load();
    }, [load]),
  );

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: '건강 기록',
          headerRight: () => (
            <Pressable
              accessibilityLabel="건강 기록 추가"
              onPress={() => router.push(`/pets/${petId}/health-record/new`)}
            >
              <Ionicons name="add" size={24} color={Colors.light.primary} />
            </Pressable>
          ),
        }}
      />
      <SafeAreaView style={styles.safeArea}>
        {records.length === 0 ? (
          <EmptyState
            title="아직 건강 기록이 없어요."
            description="오늘부터 우리 아이의 건강을 하나씩 기록해 보세요."
            ctaLabel="첫 기록 남기기"
            onPressCta={() => router.push(`/pets/${petId}/health-record/new`)}
          />
        ) : (
          <ScrollView>
            {records.map((record) => (
              <ListItem
                key={record.id}
                title={record.recordedAt}
                subtitle={record.note}
                trailing={
                  <Ionicons name="chevron-forward" size={20} color={Colors.light.textMuted} />
                }
                onPress={() => router.push(`/pets/${petId}/health-record/${record.id}`)}
              />
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
});
