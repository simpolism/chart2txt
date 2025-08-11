import {
  ChartData,
  MultiChartData,
  isMultiChartData,
  AstrologicalReport,
  PartialSettings,
  Point,
  UnionedPoint,
  AspectData,
  AspectPattern,
  ChartAnalysis,
  PairwiseAnalysis,
  TransitAnalysis,
  GlobalAnalysis,
  PlanetPosition,
} from '../types';
import { ChartSettings } from '../config/ChartSettings';
import { validateInputData } from '../utils/validation';
import { calculateAspects, calculateMultichartAspects } from './aspects';
import { detectAspectPatterns } from './aspectPatterns';
import { detectStelliums } from './stelliums';
import { getPlanetPositions } from '../utils/formatting';
import { calculateSignDistributions } from './signDistributions';
import { calculateDispositors } from './dispositors';
import { calculateHouseOverlays } from '../utils/houseCalculations';

// Helper functions

function getAllPointsFromChart(chartData: ChartData): Point[] {
  const allPoints: Point[] = [...chartData.planets];
  if (chartData.ascendant !== undefined) {
    allPoints.push({ name: 'Ascendant', degree: chartData.ascendant });
  }
  if (chartData.midheaven !== undefined) {
    allPoints.push({ name: 'Midheaven', degree: chartData.midheaven });
  }
  return allPoints;
}

function getPointsForPatternDetection(chartData: ChartData): Point[] {
  // Exclude angles and nodes from pattern detection
  const excludedNames = ['Ascendant', 'Midheaven', 'North Node', 'South Node'];
  return chartData.planets.filter(
    (point) => !excludedNames.includes(point.name)
  );
}

function getUnionedPoints(
  charts: ChartData[],
  forPatternDetection = false
): UnionedPoint[] {
  return charts.flatMap((chart) => {
    const points = forPatternDetection
      ? getPointsForPatternDetection(chart)
      : getAllPointsFromChart(chart);
    return points.map((p): UnionedPoint => [p, chart.name]);
  });
}

function getChartNamesFromPattern(pattern: AspectPattern): Set<string> {
  const chartNames = new Set<string>();
  const planetsToVisit: PlanetPosition[] = [];

  const addPlanet = (p: PlanetPosition) => {
    if (p) planetsToVisit.push(p);
  };

  switch (pattern.type) {
    case 'T-Square':
      addPlanet(pattern.apex);
      pattern.opposition.forEach(addPlanet);
      break;
    case 'Grand Trine':
      pattern.planets.forEach(addPlanet);
      break;
    case 'Grand Cross':
      pattern.planets.forEach(addPlanet);
      break;
    case 'Yod':
      addPlanet(pattern.apex);
      pattern.base.forEach(addPlanet);
      break;
    case 'Mystic Rectangle':
      pattern.oppositions.flat().forEach(addPlanet);
      break;
    case 'Kite':
      pattern.grandTrine.forEach(addPlanet);
      addPlanet(pattern.opposition);
      break;
  }

  planetsToVisit.forEach((p) => {
    if (p.chartName) {
      chartNames.add(p.chartName);
    }
  });

  return chartNames;
}

function countUniqueCharts(pattern: AspectPattern): number {
  return getChartNamesFromPattern(pattern).size;
}

function patternInvolvesChart(
  pattern: AspectPattern,
  chartName: string
): boolean {
  return getChartNamesFromPattern(pattern).has(chartName);
}

function filterPatternsByChartCount(
  patterns: AspectPattern[],
  minCharts: number,
  maxCharts = Infinity
): AspectPattern[] {
  return patterns.filter((pattern) => {
    const count = countUniqueCharts(pattern);
    return count >= minCharts && count <= maxCharts;
  });
}

function filterPatternsByChartInvolvement(
  patterns: AspectPattern[],
  requiredChartNames: string[]
): AspectPattern[] {
  return patterns.filter((pattern) => {
    return requiredChartNames.some((chartName) =>
      patternInvolvesChart(pattern, chartName)
    );
  });
}

/**
 * Analyzes single or multiple chart data and returns a structured report
 * containing all detected astrological configurations without any formatting.
 */
export function analyzeCharts(
  data: ChartData | MultiChartData,
  partialSettings: PartialSettings = {}
): AstrologicalReport {
  const validationError = validateInputData(data);
  if (validationError) {
    throw new Error(`Invalid chart data: ${validationError}`);
  }

  const settings = new ChartSettings(partialSettings);
  const rawCharts = isMultiChartData(data) ? data : [data];

  const nonTransitCharts = rawCharts.filter((c) => c.chartType !== 'transit');
  const transitChart = rawCharts.find((c) => c.chartType === 'transit');
  const allCharts = [
    ...nonTransitCharts,
    ...(transitChart ? [transitChart] : []),
  ];

  // === Unified Aspect Calculation ===
  const allAspects: AspectData[] = [];
  const allUnionedPointsForPatterns = getUnionedPoints(allCharts, true);

  // 1. Individual chart aspects
  for (const chart of allCharts) {
    const points = getUnionedPoints([chart]);
    const aspects = calculateAspects(
      settings.resolvedAspectDefinitions,
      points,
      settings.skipOutOfSignAspects
    );
    allAspects.push(...aspects);
  }

  // 2. Pairwise aspects (Synastry, Natal-Transit, etc.)
  for (let i = 0; i < allCharts.length; i++) {
    for (let j = i + 1; j < allCharts.length; j++) {
      const chart1 = allCharts[i];
      const chart2 = allCharts[j];

      // Get unioned points from both charts for multi-chart analysis
      const unionedPoints = [
        ...getUnionedPoints([chart1]),
        ...getUnionedPoints([chart2]),
      ];
      const aspects = calculateMultichartAspects(
        settings.resolvedAspectDefinitions,
        unionedPoints,
        settings.skipOutOfSignAspects
      );
      allAspects.push(...aspects);
    }
  }

  // === Unified Pattern Detection ===
  const allPatterns = settings.includeAspectPatterns
    ? detectAspectPatterns(allUnionedPointsForPatterns, allAspects)
    : [];

  // === Analysis Structuring ===
  const chartAnalyses: ChartAnalysis[] = [];
  const pairwiseAnalyses: PairwiseAnalysis[] = [];
  const transitAnalyses: TransitAnalysis[] = [];
  let globalAnalysis: GlobalAnalysis | undefined;
  let globalTransitAnalysis: GlobalAnalysis | undefined;

  // Tier 1: Individual Chart Analysis
  for (const chart of allCharts) {
    const individualAspects = allAspects.filter(
      (a) => a.p1ChartName === chart.name && a.p2ChartName === chart.name
    );
    const individualPatterns = filterPatternsByChartCount(
      allPatterns,
      1,
      1
    ).filter((p) => patternInvolvesChart(p, chart.name));
    const stelliums = settings.includeAspectPatterns
      ? detectStelliums(getPointsForPatternDetection(chart), chart.houseCusps)
      : [];

    chartAnalyses.push({
      chart: chart,
      placements: {
        planets: getPlanetPositions(chart.planets, chart.houseCusps),
      },
      aspects: individualAspects,
      patterns: individualPatterns,
      stelliums: stelliums,
      signDistributions: settings.includeSignDistributions
        ? calculateSignDistributions(chart.planets, chart.ascendant)
        : { elements: {}, modalities: {}, polarities: {} },
      dispositors:
        chart.chartType !== 'transit'
          ? calculateDispositors(chart.planets, settings.includeDispositors)
          : {},
    });
  }

  // Tier 2: Pairwise Synastry Analysis (non-transit charts)
  if (nonTransitCharts.length >= 2) {
    for (let i = 0; i < nonTransitCharts.length; i++) {
      for (let j = i + 1; j < nonTransitCharts.length; j++) {
        const chart1 = nonTransitCharts[i];
        const chart2 = nonTransitCharts[j];

        const synastryAspects = allAspects.filter(
          (a) =>
            (a.p1ChartName === chart1.name && a.p2ChartName === chart2.name) ||
            (a.p1ChartName === chart2.name && a.p2ChartName === chart1.name)
        );

        const compositePatterns = filterPatternsByChartCount(
          allPatterns,
          2,
          2
        ).filter(
          (p) =>
            patternInvolvesChart(p, chart1.name) &&
            patternInvolvesChart(p, chart2.name)
        );

        pairwiseAnalyses.push({
          chart1: chart1,
          chart2: chart2,
          synastryAspects: synastryAspects,
          compositePatterns: compositePatterns,
          houseOverlays: settings.includeHouseOverlays 
            ? calculateHouseOverlays(chart1, chart2)
            : { chart1InChart2Houses: {}, chart2InChart1Houses: {} },
        });
      }
    }
  }

  // Tier 3: Global Analysis (3+ non-transit charts)
  if (nonTransitCharts.length > 2) {
    const globalPatterns = filterPatternsByChartCount(allPatterns, 3).filter(
      (p) => {
        // Ensure no transit charts are involved
        const involvedCharts = getChartNamesFromPattern(p);
        return !involvedCharts.has(transitChart?.name || 'TRANSIT_PLACEHOLDER');
      }
    );

    if (globalPatterns.length > 0) {
      globalAnalysis = {
        charts: nonTransitCharts,
        patterns: globalPatterns,
      };
    }
  }

  // Tier 4: Transit Analysis
  if (transitChart) {
    for (const natalChart of nonTransitCharts) {
      const transitAspects = allAspects.filter(
        (a) =>
          (a.p1ChartName === natalChart.name &&
            a.p2ChartName === transitChart.name) ||
          (a.p1ChartName === transitChart.name &&
            a.p2ChartName === natalChart.name)
      );

      const transitPatterns = filterPatternsByChartCount(
        allPatterns,
        2,
        2
      ).filter(
        (p) =>
          patternInvolvesChart(p, natalChart.name) &&
          patternInvolvesChart(p, transitChart.name)
      );

      transitAnalyses.push({
        natalChart: natalChart,
        transitChart: transitChart,
        aspects: transitAspects,
        patterns: transitPatterns,
      });
    }

    // Tier 5: Global Transit Analysis (if there are natal charts)
    if (nonTransitCharts.length > 0) {
      const globalTransitPatterns = filterPatternsByChartInvolvement(
        allPatterns,
        [transitChart.name]
      ).filter((p) => countUniqueCharts(p) >= 3); // Must involve transit + at least two other charts

      if (globalTransitPatterns.length > 0) {
        globalTransitAnalysis = {
          charts: allCharts,
          patterns: globalTransitPatterns,
        };
      }
    }
  }

  const report: AstrologicalReport = {
    settings: settings,
    chartAnalyses,
    pairwiseAnalyses,
    globalAnalysis,
    transitAnalyses,
    globalTransitAnalysis,
  };

  return report;
}
