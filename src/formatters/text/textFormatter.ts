import {
  ChartData,
  isMultiChartData,
  MultiChartData,
  PartialSettings,
  Point,
  AspectPattern,
  AspectData,
  UnionedPoint,
} from '../../types';
import { ChartSettings } from '../../config/ChartSettings';
import { validateInputData } from '../../utils/validation';
import {
  calculateAspects,
  calculateMultichartAspects,
} from '../../core/aspects';
import { detectAspectPatterns } from '../../core/aspectPatterns';
import { detectStelliums, formatStellium } from '../../core/stelliums';

/**
 * Helper function to get all points (planets + angles) from a chart for aspect calculation
 */
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

/**
 * Get points from chart excluding Ascendant, Midheaven, and North Node from pattern detection
 * These angles should not be included in stelliums or aspect patterns
 */
function getPointsForPatternDetection(chartData: ChartData): Point[] {
  const allPoints: Point[] = [...chartData.planets];
  // Explicitly exclude angles from pattern detection
  // Note: North Node is not currently implemented but included for future compatibility
  const excludedNames = ['Ascendant', 'Midheaven', 'North Node'];
  return allPoints.filter((point) => !excludedNames.includes(point.name));
}

/**
 * Detect aspect patterns that span across multiple charts
 * This function combines planets from all charts and detects global patterns
 */
function detectGlobalMultiChartPatterns(
  charts: ChartData[],
  allAspects: AspectData[] // Use pre-calculated aspects
): { patterns: AspectPattern[]; chartNames: string } {
  if (charts.length < 2) {
    return { patterns: [], chartNames: '' };
  }

  // Combine all planets from all charts (excluding angles for pattern detection)
  const allPlanetsForPatterns = charts.flatMap((chart) =>
    getPointsForPatternDetection(chart)
  );

  const unionedPoints = charts.flatMap((chart) =>
    getPointsForPatternDetection(chart).map(
      (point): UnionedPoint => [point, chart]
    )
  );
  // Detect patterns across all charts with chart ownership context
  // Aspects are now pre-calculated and passed in
  const globalPatterns = detectAspectPatterns(
    unionedPoints,
    allAspects,
    undefined // No house cusps for global patterns
  );

  // Create a descriptive name for the chart combination
  const chartNames = charts.map((c) => c.name).join('-');

  return { patterns: globalPatterns, chartNames };
}

import { generateMetadataOutput } from './sections/metadata';
import { generateChartHeaderOutput } from './sections/chartHeader';
import { generateBirthdataOutput } from './sections/birthdata';
import { generateAnglesOutput } from './sections/angles';
import { generateHousesOutput } from './sections/houses';
import { generatePlanetsOutput } from './sections/planets';
import { generateDispositorsOutput } from './sections/dispositors';
import { generateAspectsOutput } from './sections/aspects';
import { generateAspectPatternsOutput } from './sections/aspectPatterns';
import { generateHouseOverlaysOutput } from './sections/houseOverlays';
import {
  generateElementDistributionOutput,
  generateModalityDistributionOutput,
  generatePolarityOutput,
} from './sections/signDistributions';

const processSingleChartOutput = (
  settings: ChartSettings,
  chartData: ChartData,
  aspects: AspectData[], // Use pre-calculated aspects
  chartTitlePrefix?: string
): string[] => {
  const outputLines: string[] = [];
  outputLines.push(
    ...generateChartHeaderOutput(chartData.name, chartTitlePrefix)
  );
  outputLines.push(
    ...generateBirthdataOutput(
      chartData.location,
      chartData.timestamp,
      settings
    )
  );
  outputLines.push(
    ...generateAnglesOutput(chartData.ascendant, chartData.midheaven)
  );
  outputLines.push(...generateHousesOutput(chartData.houseCusps));
  outputLines.push(
    ...generatePlanetsOutput(chartData.planets, chartData.houseCusps, settings)
  );
  outputLines.push(...generateDispositorsOutput(chartData.planets));
  if (settings.includeSignDistributions) {
    outputLines.push(
      ...generateElementDistributionOutput(
        chartData.planets,
        undefined,
        chartData.ascendant
      )
    );
    outputLines.push(
      ...generateModalityDistributionOutput(
        chartData.planets,
        undefined,
        chartData.ascendant
      )
    );
    outputLines.push(
      ...generatePolarityOutput(
        chartData.planets,
        undefined,
        chartData.ascendant
      )
    );
  }

  // Aspects are now pre-calculated and passed in
  // For single chart, p1ChartName and p2ChartName are not needed for aspect string generation
  outputLines.push(...generateAspectsOutput('[ASPECTS]', aspects, settings));

  // Detect and display aspect patterns (if enabled)
  if (settings.includeAspectPatterns) {
    // Detect non-stellium aspect patterns
    // Exclude Ascendant, Midheaven, and North Node from aspect pattern detection
    const unionedPoints = getPointsForPatternDetection(chartData).map(
      (p): UnionedPoint => [p, chartData]
    );
    const aspectPatterns = detectAspectPatterns(
      unionedPoints,
      aspects
    );

    // Detect stelliums separately (only for single charts where house information is meaningful)
    // Exclude Ascendant, Midheaven, and North Node from stellium detection
    const stelliums = detectStelliums(
      getPointsForPatternDetection(chartData),
      chartData.houseCusps
    );

    // Combine all patterns
    const allPatterns = [...aspectPatterns];

    // Always output aspect patterns section for single charts to prevent LLM hallucinations
    outputLines.push('[ASPECT PATTERNS]');

    if (allPatterns.length === 0 && stelliums.length === 0) {
      // General statement plus explicit enumeration to prevent LLM hallucinations
      outputLines.push('No aspect patterns detected.');
      outputLines.push('No stelliums detected.');
      outputLines.push('No T-Squares detected.');
      outputLines.push('No Grand Trines detected.');
    } else {
      // Output detected patterns
      if (stelliums.length > 0) {
        stelliums.forEach((stellium) => {
          outputLines.push(...formatStellium(stellium));
        });
      } else {
        outputLines.push('No stelliums detected.');
      }

      if (allPatterns.length > 0) {
        const patternsOutput = generateAspectPatternsOutput(allPatterns, undefined, false);
        // Remove the header and extract pattern content, excluding "No ... detected" messages
        const patternContent = patternsOutput
          .slice(1)
          .filter(
            (line) => !line.startsWith('No ') || !line.endsWith(' detected.')
          );
        outputLines.push(...patternContent);
      } else {
        outputLines.push('No T-Squares detected.');
        outputLines.push('No Grand Trines detected.');
      }
    }

    // Remove trailing empty line if present
    if (outputLines[outputLines.length - 1] === '') {
      outputLines.pop();
    }
  }
  outputLines.push('');
  return outputLines;
};

const processChartPairOutput = (
  settings: ChartSettings,
  chart1: ChartData,
  chart2: ChartData,
  chart1Aspects: AspectData[],
  chart2Aspects: AspectData[],
  synastryAspects: AspectData[]
): string[] => {
  const outputLines: string[] = [];
  const header =
    chart1.chartType === 'event' && chart2.chartType === 'event'
      ? 'EVENT_RELATIONSHIP'
      : chart1.chartType === 'event' || chart2.chartType === 'event'
      ? 'NATAL_EVENT'
      : 'SYNASTRY';
  outputLines.push(
    ...generateChartHeaderOutput(`${chart1.name}-${chart2.name}`, header)
  );
  outputLines.push(
    ...generateAspectsOutput(
      '[PLANET-PLANET ASPECTS]',
      synastryAspects,
      settings,
      chart1.name,
      chart2.name
    )
  );

  // Detect and display aspect patterns for synastry/multichart relationships (if enabled)
  if (settings.includeAspectPatterns) {
    // Combine individual and synastry aspects for a complete picture for this pair
    const allCompositeAspects = [
      ...chart1Aspects,
      ...chart2Aspects,
      ...synastryAspects,
    ];

    const unionedPoints = [
      ...getPointsForPatternDetection(chart1).map(
        (p): UnionedPoint => [p, chart1]
      ),
      ...getPointsForPatternDetection(chart2).map(
        (p): UnionedPoint => [p, chart2]
      ),
    ];

    const compositePatternsChart1Chart2 = detectAspectPatterns(
      unionedPoints,
      allCompositeAspects
    );
    if (compositePatternsChart1Chart2.length > 0) {
      outputLines.push(
        ...generateAspectPatternsOutput(
          compositePatternsChart1Chart2,
          `${chart1.name}-${chart2.name} Composite`,
          true
        )
      );
    }
  }

  outputLines.push('');
  outputLines.push(...generateHouseOverlaysOutput(chart1, chart2, settings));
  outputLines.push('');
  return outputLines;
};

const processTransitChartInfoOutput = (
  settings: ChartSettings,
  transitData: ChartData
): string[] => {
  const outputLines: string[] = [];
  outputLines.push(...generateChartHeaderOutput(transitData.name, 'TRANSIT'));
  outputLines.push(
    ...generateBirthdataOutput(
      transitData.location,
      transitData.timestamp,
      settings,
      '[DATETIME]'
    )
  );
  // For transit chart's own planets, houses are usually not shown unless it's a full natal chart for that moment.
  outputLines.push(
    ...generatePlanetsOutput(
      transitData.planets,
      transitData.houseCusps,
      settings
    )
  );
  outputLines.push('');
  return outputLines;
};

const determineChartType = (data: MultiChartData): string => {
  let baseChartString = 'natal';
  let suffixString = '';
  const natalCharts = data.filter(
    ({ chartType }) => chartType !== 'transit' && chartType !== 'event'
  );
  const eventCharts = data.filter(({ chartType }) => chartType === 'event');
  const transitCharts = data.filter(({ chartType }) => chartType === 'transit');
  if (transitCharts.length > 1) {
    throw new Error('Must provide at most one transit chart');
  }
  const hasTransit = transitCharts.length > 0;

  // first determine suffix
  if (natalCharts.length > 0) {
    if (eventCharts.length === 0) {
      if (hasTransit) {
        suffixString = '_with_transit';
      }
    } else if (eventCharts.length === 1) {
      suffixString = hasTransit ? '_with_event_and_transit' : '_with_event';
    } else {
      suffixString = hasTransit ? '_with_events_and_transit' : '_with_events';
    }
  } else {
    // base event charts can have transits
    if (hasTransit) {
      suffixString = '_with_transit';
    }
  }

  // then determine base string
  if (natalCharts.length === 0) {
    if (eventCharts.length === 0) {
      throw new Error('Must provide at least one non-transit chart');
    } else if (eventCharts.length === 1) {
      baseChartString = 'event';
    } else {
      baseChartString = 'multi_event';
    }
  } else if (natalCharts.length === 1) {
    baseChartString = 'natal';
  } else if (natalCharts.length === 2) {
    baseChartString = 'synastry';
  } else {
    baseChartString = 'group_synastry';
  }

  return baseChartString + suffixString;
};

/**
 * Orchestrates the generation of a complete astrological chart report in text format.
 * @param data The chart data, can be for a single chart or multiple charts (synastry, transits).
 * @param partialSettings Optional: Custom settings to override defaults.
 * @returns A string representing the full chart report.
 */
export function formatChartToText(
  data: ChartData | MultiChartData,
  partialSettings: PartialSettings = {}
): string {
  // Validate input data
  const validationError = validateInputData(data);
  if (validationError) {
    throw new Error(`Invalid chart data: ${validationError}`);
  }

  const settings = new ChartSettings(partialSettings);
  const houseSystemName = settings.houseSystemName;
  const outputLines: string[] = [];

  if (!isMultiChartData(data)) {
    // single chart or event, legacy usage
    if (data.chartType === 'transit') {
      throw new Error('Single chart data must not be transit.');
    }
    outputLines.push(
      ...generateMetadataOutput(
        settings,
        data.chartType || 'natal',
        houseSystemName
      )
    );
    outputLines.push(''); // Blank line after metadata
    // Pre-calculate aspects for the single chart
    const unionedPoints = getAllPointsFromChart(data as ChartData).map(
      (p): UnionedPoint => [p, data as ChartData]
    );
    const aspects = calculateAspects(
      settings.aspectDefinitions,
      unionedPoints,
      settings.skipOutOfSignAspects,
      settings.orbResolver
    );
    outputLines.push(
      ...processSingleChartOutput(settings, data as ChartData, aspects)
    );
    return outputLines.join('\n').trimEnd();
  }

  // multi-chart analysis proceeds from here on
  // generate metadata
  const chartType = determineChartType(data);
  outputLines.push(
    ...generateMetadataOutput(settings, chartType, houseSystemName)
  );
  outputLines.push(''); // Blank line after metadata

  const nonTransitCharts = data.filter(
    ({ chartType }) => chartType !== 'transit'
  );
  const transitChart = data.find(({ chartType }) => chartType === 'transit');

  // Pre-calculate all necessary aspects to avoid redundant calculations
  const individualAspects = new Map<string, AspectData[]>();
  nonTransitCharts.forEach((chart) => {
    const unionedPoints = getAllPointsFromChart(chart).map(
      (p): UnionedPoint => [p, chart]
    );
    individualAspects.set(
      chart.name,
      calculateAspects(
        settings.aspectDefinitions,
        unionedPoints,
        settings.skipOutOfSignAspects,
        settings.orbResolver
      )
    );
  });

  const synastryAspects = new Map<string, AspectData[]>();
  for (let i = 0; i < nonTransitCharts.length; i++) {
    for (let j = i + 1; j < nonTransitCharts.length; j++) {
      const chart1 = nonTransitCharts[i];
      const chart2 = nonTransitCharts[j];
      const pairKey = `${chart1.name}-${chart2.name}`;
      synastryAspects.set(
        pairKey,
        calculateMultichartAspects(
          settings.aspectDefinitions,
          getAllPointsFromChart(chart1).map((p): UnionedPoint => [p, chart1]),
          getAllPointsFromChart(chart2).map((p): UnionedPoint => [p, chart2]),
          settings.skipOutOfSignAspects,
          settings.orbResolver,
          'synastry'
        )
      );
    }
  }

  // first, process each chart individually
  for (const chart of nonTransitCharts) {
    outputLines.push(
      ...processSingleChartOutput(settings, chart, individualAspects.get(
        chart.name
      )!)
    );
  }

  // then, process each pairwise chart
  for (let i = 0; i < nonTransitCharts.length; i++) {
    for (let j = i + 1; j < nonTransitCharts.length; j++) {
      const chart1 = nonTransitCharts[i];
      const chart2 = nonTransitCharts[j];
      const pairKey = `${chart1.name}-${chart2.name}`;
      outputLines.push(
        ...processChartPairOutput(
          settings,
          chart1,
          chart2,
          individualAspects.get(chart1.name)!,
          individualAspects.get(chart2.name)!,
          synastryAspects.get(pairKey)!
        )
      );
    }
  }

  // Global multi-chart pattern detection (for 3+ charts)
  if (settings.includeAspectPatterns && nonTransitCharts.length > 2) {
    // Combine all individual and synastry aspects for global analysis
    const allIndividualAspects = Array.from(individualAspects.values()).flat();
    const allSynastryAspects = Array.from(synastryAspects.values()).flat();
    const allGlobalAspects = [...allIndividualAspects, ...allSynastryAspects];

    const { patterns: globalPatterns, chartNames } =
      detectGlobalMultiChartPatterns(nonTransitCharts, allGlobalAspects);

    if (globalPatterns.length > 0) {
      const title =
        nonTransitCharts.length > 2
          ? `${chartNames} Global Composite`
          : // This title clarifies that it includes personal aspects in the composite view
            `${chartNames} Composite (including personal aspects)`;
      outputLines.push(...generateAspectPatternsOutput(globalPatterns, title, true));
      outputLines.push('');
    }
  }

  // finally, process transit against each non-transit chart
  if (transitChart) {
    outputLines.push(...processTransitChartInfoOutput(settings, transitChart));
    for (const chart of nonTransitCharts) {
      const transitAspects = calculateMultichartAspects(
        settings.aspectDefinitions,
        getAllPointsFromChart(chart).map((p): UnionedPoint => [p, chart]),
        getAllPointsFromChart(transitChart).map(
          (p): UnionedPoint => [p, transitChart]
        ),
        settings.skipOutOfSignAspects,
        settings.orbResolver,
        'transit'
      );
      outputLines.push(
        ...generateAspectsOutput(
          `[TRANSIT ASPECTS: ${chart.name}]`,
          transitAspects,
          settings,
          chart.name,
          transitChart.name,
          true
        )
      );

      if (settings.includeAspectPatterns) {
        // For transit patterns, we must combine the natal aspects with the new transit aspects
        const natalAspects = individualAspects.get(chart.name)!;
        const allRelevantAspects = [...natalAspects, ...transitAspects];

        const unionedPoints = [
          ...getPointsForPatternDetection(chart).map(
            (p): UnionedPoint => [p, chart]
          ),
          ...getPointsForPatternDetection(transitChart).map(
            (p): UnionedPoint => [p, transitChart]
          ),
        ];

        const transitPatterns = detectAspectPatterns(
          unionedPoints,
          allRelevantAspects
        );
        if (transitPatterns.length > 0) {
          outputLines.push(
            ...generateAspectPatternsOutput(
              transitPatterns,
              `Transit to ${chart.name}`,
              true
            )
          );
        }
      }
      outputLines.push('');
    }

    // Global pattern detection including transits
    if (settings.includeAspectPatterns && nonTransitCharts.length > 0) {
      // Re-use all previously calculated aspects and add the new transit-related ones
      const allIndividualAspects = Array.from(
        individualAspects.values()
      ).flat();
      const allSynastryAspects = Array.from(synastryAspects.values()).flat();
      const transitAspectsForAllCharts = nonTransitCharts
        .map((chart) => {
          return calculateMultichartAspects(
            settings.aspectDefinitions,
            getAllPointsFromChart(chart).map((p): UnionedPoint => [p, chart]),
            getAllPointsFromChart(transitChart!).map(
              (p): UnionedPoint => [p, transitChart!]
            ),
            settings.skipOutOfSignAspects,
            settings.orbResolver,
            'transit'
          );
        })
        .flat();

      const allGlobalAspectsWithTransit = [
        ...allIndividualAspects,
        ...allSynastryAspects,
        ...transitAspectsForAllCharts,
      ];
      const allChartsForGlobalTransit = [...nonTransitCharts, transitChart];

      const { patterns: globalTransitPatterns, chartNames } =
        detectGlobalMultiChartPatterns(
          allChartsForGlobalTransit,
          allGlobalAspectsWithTransit
        );

      if (globalTransitPatterns.length > 0) {
        outputLines.push(
          ...generateAspectPatternsOutput(
            globalTransitPatterns,
            `${chartNames} Global Transit Composite`,
            true
          )
        );
        outputLines.push('');
      }
    }
  }

  return outputLines.join('\n').trimEnd();
}
