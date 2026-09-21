/**
 * Pawlog 디자인 토큰. `plan/pawlog-design-guide-v2.md` §3(Color)·§6(Typography)·§7(Spacing)·§8(Shape)를 따른다.
 *
 * 다크 모드 인프라(Colors.light/Colors.dark)는 유지하되, MVP는 다크 모드를 지원하지 않으므로
 * 두 값 모두 라이트 팔레트로 채운다 — 나중에 다크 팔레트만 추가하면 된다.
 */

import '@/global.css';

import { Platform } from 'react-native';

const lightPalette = {
  primary: '#F47C6C',
  primaryPressed: '#E96F60',
  primaryLight: '#FFF0ED',

  lavender: '#A978E8',
  lavenderLight: '#F4EEFC',

  background: '#FFFDFC',
  surface: '#FFFFFF',

  textPrimary: '#292524',
  textSecondary: '#78716C',
  textMuted: '#A8A29E',

  border: '#EEEAE7',
  divider: '#F3F0EE',

  success: '#65A986',
  warning: '#E9A23B',
  info: '#6E9ECF',
  danger: '#D95C5C',
} as const;

export const Colors = {
  light: lightPalette,
  dark: lightPalette,
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

/** 4pt 기반 spacing — design-guide §7. */
export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  screen: 20,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

/** design-guide §8. */
export const Radius = {
  sm: 8,
  input: 12,
  button: 14,
  card: 16,
  largeCard: 20,
  sheet: 24,
  full: 999,
} as const;

/** design-guide §6 Type Scale. */
export const Typography = {
  display: { fontSize: 28, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '700' },
  heading: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  bodySmall: { fontSize: 14, fontWeight: '400' },
  caption: { fontSize: 12, fontWeight: '400' },
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
