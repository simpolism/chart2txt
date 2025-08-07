import {
  ChartData,
  isMultiChartData,
  MultiChartData,
  PartialSettings,
  Point,
  AspectPattern,
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
  settings: ChartSettings
): { patterns: AspectPattern[]; chartNames: string } {
  if (charts.length < 2) {
    return { patterns: [], chartNames: '' };
  }

  // Combine all planets from all charts (excluding angles for pattern detection)
  const allPlanetsForPatterns = charts.flatMap((chart) =>
    getPointsForPatternDetection(chart)
  );
  // But keep all points for aspect calculation (aspects can include angles)
  const allPlanets = charts.flatMap((chart) => getAllPointsFromChart(chart));

  // Create mapping of planet names to chart names for ownership context
  const planetChartMap = new Map<string, string>();
  charts.forEach((chart) => {
    getPointsForPatternDetection(chart).forEach((planet) => {
      planetChartMap.set(planet.name, chart.name);
    });
    getAllPointsFromChart(chart).forEach((planet) => {
      if (!planetChartMap.has(planet.name)) {
        planetChartMap.set(planet.name, chart.name);
      }
    });
  });

  // Calculate all aspects between all planets (both intra-chart and inter-chart)
  const allAspects = calculateAspects(
    settings.aspectDefinitions,
    allPlanets,
    settings.skipOutOfSignAspects,
    settings.orbResolver
  );

  // Detect patterns across all charts with chart ownership context
  // Exclude angles from pattern detection but keep them in aspects
  const globalPatterns = detectAspectPatterns(
    allPlanetsForPatterns,
    allAspects,
    undefined, // No house cusps since it doesn't make sense across charts
    planetChartMap
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

  const aspects = calculateAspects(
    settings.aspectDefinitions,
    getAllPointsFromChart(chartData),
    settings.skipOutOfSignAspects,
    settings.orbResolver
  );
  // For single chart, p1ChartName and p2ChartName are not needed for aspect string generation
  outputLines.push(...generateAspectsOutput('[ASPECTS]', aspects, settings));

  // Detect and display aspect patterns (if enabled)
  if (settings.includeAspectPatterns) {
    // Detect non-stellium aspect patterns
    // Exclude Ascendant, Midheaven, and North Node from aspect pattern detection
    const aspectPatterns = detectAspectPatterns(
      getPointsForPatternDetection(chartData),
      aspects,
      chartData.houseCusps
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
        const patternsOutput = generateAspectPatternsOutput(allPatterns);
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
  chart2: ChartData
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
  const synastryAspects = calculateMultichartAspects(
    settings.aspectDefinitions,
    getAllPointsFromChart(chart1),
    getAllPointsFromChart(chart2),
    settings.skipOutOfSignAspects,
    settings.orbResolver,
    'synastry'
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
    // Combine planets from both charts for composite pattern detection
    const combinedPlanetsForPatterns = [
      ...getPointsForPatternDetection(chart1),
      ...getPointsForPatternDetection(chart2),
    ];
    // But keep all points for aspect calculation
    const combinedPlanets = [
      ...getAllPointsFromChart(chart1),
      ...getAllPointsFromChart(chart2),
    ];

    // Calculate all aspects between all planets (both intra-chart and inter-chart)
    const allCompositeAspects = calculateAspects(
      settings.aspectDefinitions,
      combinedPlanets,
      settings.skipOutOfSignAspects,
      settings.orbResolver
    );

    // Create mapping for chart ownership context
    const planetChartMap = new Map<string, string>();
    getPointsForPatternDetection(chart1).forEach((planet) => {
      planetChartMap.set(planet.name, chart1.name);
    });
    getPointsForPatternDetection(chart2).forEach((planet) => {
      planetChartMap.set(planet.name, chart2.name);
    });
    getAllPointsFromChart(chart1).forEach((planet) => {
      if (!planetChartMap.has(planet.name)) {
        planetChartMap.set(planet.name, chart1.name);
      }
    });
    getAllPointsFromChart(chart2).forEach((planet) => {
      if (!planetChartMap.has(planet.name)) {
        planetChartMap.set(planet.name, chart2.name);
      }
    });

    const compositePatternsChart1Chart2 = detectAspectPatterns(
      combinedPlanetsForPatterns,
      allCompositeAspects,
      chart1.houseCusps, // Use chart1's house cusps for primary reference
      planetChartMap
    );
    if (compositePatternsChart1Chart2.length > 0) {
      outputLines.push(
        ...generateAspectPatternsOutput(
          compositePatternsChart1Chart2,
          `${chart1.name}-${chart2.name} Composite`
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
    outputLines.push(...processSingleChartOutput(settings, data as ChartData));
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

  // first, process each chart individually
  for (const chart of nonTransitCharts) {
    outputLines.push(...processSingleChartOutput(settings, chart));
  }

  // then, process each pairwise chart
  for (let i = 0; i < nonTransitCharts.length; i++) {
    for (let j = i + 1; j < nonTransitCharts.length; j++) {
      outputLines.push(
        ...processChartPairOutput(
          settings,
          nonTransitCharts[i],
          nonTransitCharts[j]
        )
      );
    }
  }

  // Global multi-chart pattern detection (for 3+ chart combinations or comprehensive 2-chart analysis)
  if (settings.includeAspectPatterns && nonTransitCharts.length >= 2) {
    const { patterns: globalPatterns, chartNames } =
      detectGlobalMultiChartPatterns(nonTransitCharts, settings);

    if (globalPatterns.length > 0) {
      const title =
        nonTransitCharts.length > 2
          ? `${chartNames} Global Composite`
          : `${chartNames} Complete Composite`;
      outputLines.push(...generateAspectPatternsOutput(globalPatterns, title));
      outputLines.push('');
    }
  }

  // finally, process transit against each non-transit chart
  if (transitChart) {
    outputLines.push(...processTransitChartInfoOutput(settings, transitChart));
    for (const chart of nonTransitCharts) {
      // Transit Aspects to Chart 1
      const transitAspectsC1 = calculateMultichartAspects(
        settings.aspectDefinitions,
        getAllPointsFromChart(chart),
        getAllPointsFromChart(transitChart),
        settings.skipOutOfSignAspects,
        settings.orbResolver,
        'transit'
      );
      outputLines.push(
        ...generateAspectsOutput(
          `[TRANSIT ASPECTS: ${chart.name}]`,
          transitAspectsC1,
          settings,
          chart.name,
          transitChart.name,
          true
        )
      );

      // Detect and display aspect patterns for transit relationships (if enabled)
      if (settings.includeAspectPatterns) {
        // Combine planets from natal chart and transits for pattern detection
        const combinedTransitPlanetsForPatterns = [
          ...getPointsForPatternDetection(chart),
          ...getPointsForPatternDetection(transitChart),
        ];
        // But keep all points for aspect calculation
        const combinedTransitPlanets = [
          ...getAllPointsFromChart(chart),
          ...getAllPointsFromChart(transitChart),
        ];

        // Calculate all aspects between all planets (natal + transit)
        const allTransitAspects = calculateAspects(
          settings.aspectDefinitions,
          combinedTransitPlanets,
          settings.skipOutOfSignAspects,
          settings.orbResolver
        );

        // Create mapping for chart ownership context (natal + transit)
        const transitPlanetChartMap = new Map<string, string>();
        getPointsForPatternDetection(chart).forEach((planet) => {
          transitPlanetChartMap.set(planet.name, chart.name);
        });
        getPointsForPatternDetection(transitChart).forEach((planet) => {
          transitPlanetChartMap.set(planet.name, transitChart.name);
        });
        getAllPointsFromChart(chart).forEach((planet) => {
          if (!transitPlanetChartMap.has(planet.name)) {
            transitPlanetChartMap.set(planet.name, chart.name);
          }
        });
        getAllPointsFromChart(transitChart).forEach((planet) => {
          if (!transitPlanetChartMap.has(planet.name)) {
            transitPlanetChartMap.set(planet.name, transitChart.name);
          }
        });

        const transitPatterns = detectAspectPatterns(
          combinedTransitPlanetsForPatterns,
          allTransitAspects,
          chart.houseCusps, // Use natal chart's house cusps for reference
          transitPlanetChartMap
        );
        if (transitPatterns.length > 0) {
          outputLines.push(
            ...generateAspectPatternsOutput(
              transitPatterns,
              `Transit to ${chart.name}`
            )
          );
        }
      }

      outputLines.push('');
    }

    // Global pattern detection including transits (if enabled)
    if (settings.includeAspectPatterns) {
      const allChartsIncludingTransits = [...nonTransitCharts, transitChart];
      const { patterns: globalTransitPatterns, chartNames } =
        detectGlobalMultiChartPatterns(allChartsIncludingTransits, settings);

      if (globalTransitPatterns.length > 0) {
        outputLines.push(
          ...generateAspectPatternsOutput(
            globalTransitPatterns,
            `${chartNames} Global Transit Composite`
          )
        );
        outputLines.push('');
      }
    }
  }

  return outputLines.join('\n').trimEnd();
}
