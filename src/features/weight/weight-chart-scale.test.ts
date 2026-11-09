import { computeWeightChartScale, computeWeightChartSpacing } from './weight-chart-scale';

describe('computeWeightChartScale (§2.25)', () => {
  test('[4.2, 4.3] → y축 4.0–4.5, step 0.1, 5구간, 소수 1자리 라벨', () => {
    const scale = computeWeightChartScale([4.2, 4.3]);

    expect(scale.minY).toBe(4.0);
    expect(scale.maxY).toBe(4.5);
    expect(scale.yAxisOffset).toBe(4.0);
    expect(scale.maxValue).toBe(0.5);
    expect(scale.stepValue).toBe(0.1);
    expect(scale.noOfSections).toBe(5);
    expect(scale.yAxisLabelTexts).toEqual(['4.0', '4.1', '4.2', '4.3', '4.4', '4.5']);
  });

  test('단일 측정값도 축 안에 포함하고 4–6 구간을 만든다', () => {
    const weights = [5.2];
    const scale = computeWeightChartScale(weights);

    expect(scale.noOfSections).toBeGreaterThanOrEqual(4);
    expect(scale.noOfSections).toBeLessThanOrEqual(6);
    expect(weights[0]).toBeGreaterThanOrEqual(scale.minY);
    expect(weights[0]).toBeLessThanOrEqual(scale.maxY);
    scale.yAxisLabelTexts.forEach((label) => expect(label).toMatch(/^\d+\.\d$/));
  });

  test('넓은 범위(3.0–8.0) — 구간 4~6, 모든 값이 minY~maxY 안', () => {
    const weights = [3.0, 4.5, 6.2, 8.0];
    const scale = computeWeightChartScale(weights);

    expect(scale.noOfSections).toBeGreaterThanOrEqual(4);
    expect(scale.noOfSections).toBeLessThanOrEqual(6);
    for (const w of weights) {
      expect(w).toBeGreaterThanOrEqual(scale.minY);
      expect(w).toBeLessThanOrEqual(scale.maxY);
    }
    for (const label of scale.yAxisLabelTexts) {
      expect(label).toMatch(/^\d+\.\d$/);
    }
  });

  test('빈 배열은 기본 스케일 fallback', () => {
    const scale = computeWeightChartScale([]);
    expect(scale.noOfSections).toBeGreaterThanOrEqual(4);
    expect(scale.yAxisLabelTexts.every((l) => /^\d+\.\d$/.test(l))).toBe(true);
  });
});

describe('computeWeightChartSpacing (§2.25)', () => {
  test('점 2개여도 가용 콘텐츠 폭을 채우도록 간격을 계산한다', () => {
    const contentWidth = 320;
    const spacing = computeWeightChartSpacing(contentWidth, 2, 44);

    expect(spacing.chartWidth).toBe(contentWidth - 44);
    const occupied = spacing.initialSpacing + spacing.spacing + spacing.endSpacing;
    expect(occupied).toBeGreaterThanOrEqual(spacing.chartWidth - 1);
    expect(spacing.spacing).toBeGreaterThanOrEqual(44);
  });
});
