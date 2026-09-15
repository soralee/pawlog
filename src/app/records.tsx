import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { createPetRepository } from '@/db/repositories/pet.repository';
import { CheckupSection } from '@/features/health-records/checkup-section';
import { HealthRecordSection } from '@/features/health-records/health-record-section';
import { RecordTypeTabs, type RecordType } from '@/features/health-records/record-type-tabs';
import { VaccinationSection } from '@/features/health-records/vaccination-section';
import { WeightRecordSection } from '@/features/health-records/weight-record-section';
import { useAppStore } from '@/stores/app.store';

export default function RecordsScreen() {
  const db = useSQLiteContext();
  const petRepository = useMemo(() => createPetRepository(db), [db]);
  const selectedPetId = useAppStore((state) => state.selectedPetId);
  const setSelectedPetId = useAppStore((state) => state.setSelectedPetId);
  const [hasAnyPet, setHasAnyPet] = useState<boolean | null>(null);
  const [recordType, setRecordType] = useState<RecordType>('health');

  // 아직 "선택된 반려동물" 전환 UI가 없어(다묘 UX는 Non-goal), 선택된 게 없으면 첫 번째
  // 반려동물을 자동으로 선택해둔다.
  const ensureSelectedPet = useCallback(async () => {
    if (selectedPetId) {
      setHasAnyPet(true);
      return;
    }
    const pets = await petRepository.listPets();
    setHasAnyPet(pets.length > 0);
    if (pets.length > 0) setSelectedPetId(pets[0].id);
  }, [petRepository, selectedPetId, setSelectedPetId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SQLite(외부 시스템) 동기화용 마운트 시 fetch
    void ensureSelectedPet();
  }, [ensureSelectedPet]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">기록</ThemedText>

        {hasAnyPet === false && (
          <ThemedText type="default">
            먼저 &quot;내 반려동물&quot; 탭에서 반려동물을 등록해주세요.
          </ThemedText>
        )}

        {hasAnyPet && selectedPetId && (
          <>
            <RecordTypeTabs value={recordType} onChange={setRecordType} />
            {recordType === 'health' && <HealthRecordSection db={db} petId={selectedPetId} />}
            {recordType === 'vaccination' && <VaccinationSection db={db} petId={selectedPetId} />}
            {recordType === 'checkup' && <CheckupSection db={db} petId={selectedPetId} />}
            {recordType === 'weight' && <WeightRecordSection db={db} petId={selectedPetId} />}
          </>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
});
