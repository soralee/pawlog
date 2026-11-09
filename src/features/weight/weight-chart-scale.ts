export type WeightChartScale = {
  /** y축 하단 기준값(`LineChart`의 `yAxisOffset`). */
  yAxisOffset: number;
  /** `yAxisOffset` 기준 축 전체 높이(`LineChart`의 `maxValue`, `yMax - yAxisOffset`). */
  maxValue: number;
  /** 눈금 1칸 값(`LineChart`의 `stepValue`). */
  stepValue: number;
  /** 구간 개수(`LineChart`의 `noOfSections`, 4~6). */
  noOfSections: number;
  /** 하단부터 상단까지의 눈금 라벨 배열(`LineChart`의 `yAxisLabelTexts`, 예: `['4.0', ..., '4.5']`). */
  yAxisLabelTexts: string[];
  /** 실제 y축 최소값(kg). */
  minY: number;
  /** 실제 y축 최대값(kg). */
  maxY: number;
};

export type WeightChartSpacing = {
  chartWidth: number;
  initialSpacing: number;
  endSpacing: number;
  spacing: number;
};

const MIN_PADDING_KG = 0.2;
const PADDING_RATIO = 0.15;
const MIN_SPAN_KG = 0.4;
const DEFAULT_SECTIONS = 5;
const MIN_SECTIONS = 4;
const MAX_SECTIONS = 6;
const DEFAULT_INITIAL_SPACING = 20;
const DEFAULT_END_SPACING = 20;
const MIN_POINT_SPACING = 44;

function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

function floorToTenth(value: number): number {
  return Math.floor(value * 10 + 1e-9) / 10;
}

function ceilToTenth(value: number): number {
  return Math.ceil(value * 10 - 1e-9) / 10;
}

function candidateSteps(): number[] {
  const steps: number[] = [];
  for (const exp of [-1, 0, 1]) {
    const base = 10 ** exp;
    for (const mult of [1, 2, 5]) {
      steps.push(roundToTenth(mult * base));
    }
  }
  return steps;
}

/**
 * coral-design-spec.md §2.25 — 체중 측정값 배열로부터 LineChart y축 스케일을 계산한다.
 * - 양쪽 여유: `max(0.2kg, 데이터 범위 × 15%)`
 * - 최소 폭: `0.4kg`, 0.1kg 단위 바깥 반올림
 * - 눈금 간격: `1/2/5 × 10ⁿ` 중 4–6 구간을 만드는 가장 작은 간격
 * - 예: `[4.2, 4.3]` → `minY=4.0`, `maxY=4.5`, `stepValue=0.1`, `noOfSections=5`
 */
export function computeWeightChartScale(weightsKg: number[]): WeightChartScale {
  if (weightsKg.length === 0) {
    return {
      yAxisOffset: 0,
      maxValue: 1,
      stepValue: 0.2,
      noOfSections: DEFAULT_SECTIONS,
      yAxisLabelTexts: ['0.0', '0.2', '0.4', '0.6', '0.8', '1.0'],
      minY: 0,
      maxY: 1,
    };
  }

  const rawMin = Math.min(...weightsKg);
  const rawMax = Math.max(...weightsKg);
  const rawRange = rawMax - rawMin;
  const padding = Math.max(MIN_PADDING_KG, rawRange * PADDING_RATIO);

  let minY = Math.max(0, floorToTenth(rawMin - padding));
  let maxY = ceilToTenth(rawMax + padding);

  if (roundToTenth(maxY - minY) < MIN_SPAN_KG) {
    const center = (rawMin + rawMax) / 2;
    minY = Math.max(0, floorToTenth(center - MIN_SPAN_KG / 2));
    maxY = ceilToTenth(minY + MIN_SPAN_KG);
  }

  const targetSpan = roundToTenth(maxY - minY);
  const steps = candidateSteps();

  let chosenStep = steps[0];
  let chosenSections = DEFAULT_SECTIONS;
  let matched = false;

  for (const step of steps) {
    const sections = Math.ceil(targetSpan / step - 1e-9);
    if (sections >= MIN_SECTIONS && sections <= MAX_SECTIONS) {
      chosenStep = step;
      chosenSections = sections;
      matched = true;
      break;
    }
  }

  if (!matched) {
    for (const step of steps) {
      const sections = Math.max(MIN_SECTIONS, Math.ceil(targetSpan / step - 1e-9));
      if (sections <= MAX_SECTIONS) {
        chosenStep = step;
        chosenSections = sections;
        break;
      }
    }
  }

  const finalSpan = roundToTenth(chosenStep * chosenSections);
  const extraSpan = roundToTenth(finalSpan - targetSpan);
  if (extraSpan > 0) {
    const shiftDown = floorToTenth(extraSpan / 2);
    minY = Math.max(0, roundToTenth(minY - shiftDown));
  }
  maxY = roundToTenth(minY + finalSpan);

  const yAxisLabelTexts = Array.from({ length: chosenSections + 1 }, (_, i) =>
    (minY + chosenStep * i).toFixed(1),
  );

  return {
    yAxisOffset: minY,
    maxValue: finalSpan,
    stepValue: chosenStep,
    noOfSections: chosenSections,
    yAxisLabelTexts,
    minY,
    maxY,
  };
}

/**
 * coral-design-spec.md §2.25 — 콘텐츠 영역 전체 폭과 점 개수로부터 차트 폭·간격을 계산한다.
 * 점이 적을 때도 가용 폭 전체를 채우며, 점이 많아 최소 간격을 넘기면 가로 스크롤이 가능하도록 간격을 유지한다.
 */
export function computeWeightChartSpacing(
  contentWidth: number,
  pointCount: number,
  yAxisLabelWidth: number = 44,
): WeightChartSpacing {
  const chartWidth = Math.max(200, contentWidth - yAxisLabelWidth);
  const initialSpacing = DEFAULT_INITIAL_SPACING;
  const endSpacing = DEFAULT_END_SPACING;
  const segments = Math.max(1, pointCount - 1);
  const availableForSegments = Math.max(
    segments * MIN_POINT_SPACING,
    chartWidth - initialSpacing - endSpacing,
  );
  const spacing = availableForSegments / segments;

  return {
    chartWidth,
    initialSpacing,
    endSpacing,
    spacing,
  };
}
