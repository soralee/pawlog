import { ChipTokens, Colors, DDayTone, IconTileTone } from '@/constants/theme';

const AA_NORMAL_TEXT = 4.5;

function channelToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const normalized = hex.replace('#', '');
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return 0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b);
}

function contrastRatio(foregroundHex: string, backgroundHex: string): number {
  const l1 = relativeLuminance(foregroundHex);
  const l2 = relativeLuminance(backgroundHex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('§2.24 O1 — warningText 대비', () => {
  const foreground = Colors.light.warningText;

  test.each([
    ['Background', Colors.light.background],
    ['Surface', Colors.light.surface],
    ['Primary Light', Colors.light.primaryLight],
    ['Warning BG', Colors.light.warningBg],
  ])('%s 위 warningText는 WCAG 4.5:1 이상', (_name, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });
});

describe('§2.24 — semantic Warning 글자/아이콘 토큰', () => {
  test('Warning Chip·DDay urgent/overdue 글자색은 warningText', () => {
    // STATUS_STYLE.warning은 chip.tsx 내부 — DDayTone과 동일 토큰을 쓴다.
    expect(DDayTone.urgent.color).toBe(Colors.light.warningText);
    expect(DDayTone.overdue.color).toBe(Colors.light.warningText);
  });

  test('Warning 아이콘 타일 glyph는 장식색 warning(#E9A23B)을 유지한다', () => {
    expect(IconTileTone.warning.color).toBe(Colors.light.warning);
    expect(IconTileTone.warning.color).not.toBe(Colors.light.warningText);
  });

  test('필터 Chip 선택 색은 warningText가 아니다', () => {
    expect(ChipTokens.filterSelected.color).toBe(Colors.light.onPrimary);
  });
});
