import { useHeaderHeight } from 'expo-router/react-navigation';
import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';

function useSafeHeaderHeight(): number {
  try {
    return useHeaderHeight();
  } catch {
    return 0;
  }
}

type FormScrollContainerProps = {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function FormScrollContainer({ children, contentContainerStyle }: FormScrollContainerProps) {
  const headerHeight = useSafeHeaderHeight();

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={headerHeight}
      >
        <ScrollView
          contentContainerStyle={[styles.content, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  keyboardAvoiding: { flex: 1 },
  content: { padding: Spacing.lg, gap: Spacing.md },
});
