import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, StyleSheet } from 'react-native';
import { z } from 'zod';

import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { PetAvatar } from '@/components/pet-avatar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { CreatePetInput, Gender, Species } from '@/db/repositories/pet.repository';
import { isValidDateString } from '@/utils/date';

import { savePetPhoto } from './pet-photo';

const petFormSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD 형식으로 입력해주세요')
    .refine(isValidDateString, '실제로 존재하는 날짜를 입력해주세요'),
  species: z.enum(['dog', 'cat']),
  gender: z.enum(['male', 'female']),
});

type PetFormValues = z.infer<typeof petFormSchema>;

type PetFormProps = {
  initialValues?: PetFormValues;
  initialPhotoUri?: string | null;
  submitLabel?: string;
  onSubmit: (input: CreatePetInput) => void;
};

const SPECIES_OPTIONS: { value: Species; label: string }[] = [
  { value: 'dog', label: '강아지' },
  { value: 'cat', label: '고양이' },
];

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: '남아' },
  { value: 'female', label: '여아' },
];

export function PetForm({
  initialValues,
  initialPhotoUri = null,
  submitLabel = '등록',
  onSubmit,
}: PetFormProps) {
  const { control, handleSubmit, formState, reset } = useForm<PetFormValues>({
    resolver: zodResolver(petFormSchema),
    defaultValues: initialValues ?? { name: '', birthDate: '', species: 'dog', gender: 'male' },
  });
  const [photoUri, setPhotoUri] = useState<string | null>(initialPhotoUri);

  const submit = handleSubmit((values) => {
    onSubmit({ ...values, photoUri });
    if (!initialValues) reset();
  });

  async function pickPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('권한이 필요해요', '사진 보관함 접근 권한을 허용해주세요.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled) return;
    try {
      const saved = await savePetPhoto(result.assets[0].uri);
      setPhotoUri(saved);
    } catch (error) {
      Alert.alert(
        '사진을 저장하지 못했어요',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  return (
    <ThemedView style={styles.form}>
      <Pressable accessibilityLabel="프로필 사진 선택" onPress={pickPhoto} style={styles.avatarRow}>
        <PetAvatar photoUri={photoUri} size={80} />
        <ThemedText type="small" themeColor="primary">
          사진 선택
        </ThemedText>
      </Pressable>

      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <Input
            label="이름"
            value={field.value}
            onChangeText={field.onChange}
            error={formState.errors.name?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="birthDate"
        render={({ field }) => (
          <Input
            label="생년월일"
            placeholder="YYYY-MM-DD"
            value={field.value}
            onChangeText={field.onChange}
            error={formState.errors.birthDate?.message}
          />
        )}
      />

      <ThemedView style={styles.optionRow}>
        {SPECIES_OPTIONS.map((option) => (
          <Controller
            key={option.value}
            control={control}
            name="species"
            render={({ field }) => (
              <Pressable
                accessibilityLabel={option.label}
                onPress={() => field.onChange(option.value)}
                style={[
                  styles.optionButton,
                  field.value === option.value && styles.optionButtonSelected,
                ]}
              >
                <ThemedText type="small">{option.label}</ThemedText>
              </Pressable>
            )}
          />
        ))}
      </ThemedView>

      <ThemedView style={styles.optionRow}>
        {GENDER_OPTIONS.map((option) => (
          <Controller
            key={option.value}
            control={control}
            name="gender"
            render={({ field }) => (
              <Pressable
                accessibilityLabel={option.label}
                onPress={() => field.onChange(option.value)}
                style={[
                  styles.optionButton,
                  field.value === option.value && styles.optionButtonSelected,
                ]}
              >
                <ThemedText type="small">{option.label}</ThemedText>
              </Pressable>
            )}
          />
        ))}
      </ThemedView>

      <Button onPress={submit}>{submitLabel}</Button>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  avatarRow: {
    alignItems: 'center',
    gap: Spacing.xxs,
  },
  form: {
    gap: Spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  optionButton: {
    paddingVertical: Spacing.xxs,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  optionButtonSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primaryLight,
  },
});
