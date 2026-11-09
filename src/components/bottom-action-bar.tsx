import { useContext, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';

import { ThemedView } from './themed-view';

type BottomActionBarProps = {
  children: ReactNode;
  bottomInset?: number;
  backgroundColor?: string;
  testID?: string;
};

/**
 * coral-design-spec.md §2.9 — 하단 Full-width CTA 레이아웃 컴포넌트.
 * 화면 하단 flex 흐름으로 배치되어 본문 ScrollView를 가리지 않으며,
 * 흰 surface + 상단 Colors.divider 1pt + Safe Area bottom inset을 적용한다.
 */
export function BottomActionBar({
  children,
  bottomInset,
  backgroundColor = Colors.light.surface,
  testID,
}: BottomActionBarProps) {
  const insets = useContext(SafeAreaInsetsContext);
  const resolvedBottomInset = bottomInset ?? insets?.bottom ?? 0;

  return (
    <ThemedView
      type="surface"
      testID={testID}
      style={[
        styles.container,
        {
          backgroundColor,
          paddingBottom: Spacing.sm + resolvedBottomInset,
        },
      ]}
    >
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.divider,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.screen,
  },
});
