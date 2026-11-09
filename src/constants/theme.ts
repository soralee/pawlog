/**
 * Pawlog 디자인 토큰. `plan/design-guide.md`(Version 3.1) §3(Color)·§5(Typography)·§6(Spacing)·§7(Shape)를 따른다.
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
  onPrimary: '#FFFFFF',

  background: '#FFFDFC',
  surface: '#FFFFFF',

  textPrimary: '#292524',
  textSecondary: '#78716C',
  textMuted: '#A8A29E',

  border: '#EEEAE7',
  divider: '#F5F0EE',
  grabber: '#D6D3D1',
  overlay: 'rgba(41,37,36,0.40)',

  success: '#65A986',
  successBg: '#EAF6F0',
  warning: '#E9A23B',
  warningText: '#8A4B08',
  warningBg: '#FDF1E1',
  info: '#6E9ECF',
  infoBg: '#EDF4FA',
  danger: '#D95C5C',
  dangerBg: '#FBEDED',
} as const;

export const Colors = {
  light: lightPalette,
  dark: lightPalette,
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** coral-design-spec.md §2.1 — Surface 카드 그림자 토큰. */
export const Elevation = {
  card: {
    shadowColor: '#292524',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
} as const;

/** coral-design-spec.md §2.3 — 아바타 지름 스케일(pt). */
export const AvatarSize = {
  sm: 32,
  md: 48,
  lg: 64,
  hero: 96,
} as const;

export type AvatarSizeKey = keyof typeof AvatarSize;

/** coral-design-spec.md §2.2 — Chip 변형 토큰. */
export const ChipTokens = {
  filterSelected: {
    backgroundColor: Colors.light.primary,
    color: Colors.light.onPrimary,
  },
  filterUnselected: {
    backgroundColor: Colors.light.surface,
    color: Colors.light.textSecondary,
    borderColor: Colors.light.border,
    borderWidth: 1,
  },
} as const;

/** coral-design-spec.md §2.14 & §2.23 — D-day 구간별 배경·전경색. */
export const DDayTone = {
  urgent: {
    backgroundColor: Colors.light.warningBg,
    color: Colors.light.warningText,
  },
  near: {
    backgroundColor: Colors.light.primaryLight,
    color: Colors.light.primary,
  },
  far: {
    backgroundColor: Colors.light.infoBg,
    color: Colors.light.info,
  },
  completed: {
    backgroundColor: Colors.light.successBg,
    color: Colors.light.success,
  },
  overdue: {
    backgroundColor: Colors.light.warningBg,
    color: Colors.light.warningText,
  },
} as const;

/** coral-design-spec.md §2.16 — 40×40 아이콘 타일 변형 토큰. */
export const IconTileTone = {
  primary: {
    backgroundColor: Colors.light.primaryLight,
    color: Colors.light.primary,
  },
  success: {
    backgroundColor: Colors.light.successBg,
    color: Colors.light.success,
  },
  warning: {
    backgroundColor: Colors.light.warningBg,
    color: Colors.light.warning,
  },
  info: {
    backgroundColor: Colors.light.infoBg,
    color: Colors.light.info,
  },
} as const;

export type IconTileToneKey = keyof typeof IconTileTone;

/** coral-design-spec.md §2.11 — 도메인별 기본 아이콘 톤 매핑. */
export const DomainIconTone = {
  health: 'primary',
  vaccination: 'info',
  checkup: 'success',
  medication: 'warning',
  weight: 'info',
  'hospital-expense': 'warning',
} as const satisfies Record<string, IconTileToneKey>;

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
