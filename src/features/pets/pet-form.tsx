import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet } from 'react-native';
import { z } from 'zod';

import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { CreatePetInput, Gender, Species } from '@/db/repositories/pet.repository';
import { isValidDateString } from '@/utils/date';

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

export function PetForm({ initialValues, submitLabel = '등록', onSubmit }: PetFormProps) {
  const { control, handleSubmit, formState, reset } = useForm<PetFormValues>({
    resolver: zodResolver(petFormSchema),
    defaultValues: initialValues ?? { name: '', birthDate: '', species: 'dog', gender: 'male' },
  });

  const submit = handleSubmit((values) => {
    onSubmit(values);
    if (!initialValues) reset();
  });

  return (
    <ThemedView style={styles.form}>
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
