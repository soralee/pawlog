import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, TextInput } from 'react-native';
import { z } from 'zod';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { CreatePetInput, Gender, Species } from '@/db/repositories/pet.repository';

const petFormSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD 형식으로 입력해주세요'),
  species: z.enum(['dog', 'cat']),
  gender: z.enum(['male', 'female']),
});

type PetFormValues = z.infer<typeof petFormSchema>;

type PetFormProps = {
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

export function PetForm({ onSubmit }: PetFormProps) {
  const { control, handleSubmit, formState, reset } = useForm<PetFormValues>({
    resolver: zodResolver(petFormSchema),
    defaultValues: { name: '', birthDate: '', species: 'dog', gender: 'male' },
  });

  const submit = handleSubmit((values) => {
    onSubmit(values);
    reset();
  });

  return (
    <ThemedView style={styles.form}>
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <TextInput
            accessibilityLabel="이름"
            placeholder="이름"
            value={field.value}
            onChangeText={field.onChange}
            style={styles.input}
          />
        )}
      />
      {formState.errors.name && (
        <ThemedText type="small" themeColor="textSecondary">
          {formState.errors.name.message}
        </ThemedText>
      )}

      <Controller
        control={control}
        name="birthDate"
        render={({ field }) => (
          <TextInput
            accessibilityLabel="생년월일"
            placeholder="생년월일 (YYYY-MM-DD)"
            value={field.value}
            onChangeText={field.onChange}
            style={styles.input}
          />
        )}
      />
      {formState.errors.birthDate && (
        <ThemedText type="small" themeColor="textSecondary">
          {formState.errors.birthDate.message}
        </ThemedText>
      )}

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

      <Pressable accessibilityLabel="등록" onPress={submit} style={styles.submitButton}>
        <ThemedText type="smallBold">등록</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: Spacing.one,
    padding: Spacing.two,
  },
  optionRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  optionButton: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  optionButtonSelected: {
    borderColor: '#3c87f7',
  },
  submitButton: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    backgroundColor: '#3c87f7',
  },
});
