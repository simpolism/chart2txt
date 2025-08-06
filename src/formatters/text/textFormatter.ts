import {
  ChartData,
  isMultiChartData,
  MultiChartData,
  PartialSettings,
  Point,
} from '../../types';
import { ChartSettings } from '../../config/ChartSettings';
import { validateInputData } from '../../utils/validation';
import {
  calculateAspects,
  calculateMultichartAspects,
} from '../../core/aspects';
import { detectAspectPatterns } from '../../core/aspectPatterns';

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
    ...generatePolarityOutput(chartData.planets, undefined, chartData.ascendant)
  );

  const aspects = calculateAspects(
    settings.aspectDefinitions,
    getAllPointsFromChart(chartData),
    settings.skipOutOfSignAspects
  );
  // For single chart, p1ChartName and p2ChartName are not needed for aspect string generation
  outputLines.push(...generateAspectsOutput('[ASPECTS]', aspects, settings));

  // Detect and display aspect patterns (if enabled)
  if (settings.includeAspectPatterns) {
    const aspectPatterns = detectAspectPatterns(
      chartData.planets,
      aspects,
      chartData.houseCusps
    );
    outputLines.push(...generateAspectPatternsOutput(aspectPatterns));
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
    settings.skipOutOfSignAspects
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

  // finally, process transit against each non-transit chart
  if (transitChart) {
    outputLines.push(...processTransitChartInfoOutput(settings, transitChart));
    for (const chart of nonTransitCharts) {
      // Transit Aspects to Chart 1
      const transitAspectsC1 = calculateMultichartAspects(
        settings.aspectDefinitions,
        getAllPointsFromChart(chart),
        getAllPointsFromChart(transitChart),
        settings.skipOutOfSignAspects
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
      outputLines.push('');
    }
  }

  return outputLines.join('\n').trimEnd();
}
