// 디자인 토큰 진입점. 실제 값은 `@/constants/theme`(기존 Expo 템플릿 테마)를 그대로 노출한다 —
// 화면/컴포넌트는 이 경로로 토큰을 가져오고, 값 자체는 한 곳(constants/theme.ts)에서만 관리한다.
export { Colors, Fonts, Spacing, BottomTabInset, MaxContentWidth } from '@/constants/theme';
export type { ThemeColor } from '@/constants/theme';
