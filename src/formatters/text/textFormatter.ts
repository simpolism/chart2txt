import {
  AstrologicalReport,
  ChartAnalysis,
  PairwiseAnalysis,
  GlobalAnalysis,
} from '../../types';
import { ChartSettings } from '../../config/ChartSettings';

import {
  generateMetadataOutput,
  determineChartType,
} from './sections/metadata';
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
import { formatStellium } from '../../core/stelliums';

const processSingleChartOutput = (
  analysis: ChartAnalysis,
  settings: ChartSettings,
  chartTitlePrefix?: string
): string[] => {
  const outputLines: string[] = [];
  const {
    chart,
    groupedAspects,
    patterns,
    stelliums,
    signDistributions,
    dispositors,
    placements,
  } = analysis;

  outputLines.push(...generateChartHeaderOutput(chart.name, chartTitlePrefix));
  outputLines.push(
    ...generateBirthdataOutput(chart.location, chart.timestamp, settings)
  );
  outputLines.push(...generateAnglesOutput(chart.ascendant, chart.midheaven));
  outputLines.push(...generateHousesOutput(chart.houseCusps));
  outputLines.push(...generatePlanetsOutput(placements.planets));
  
  if (settings.includeDispositors) {
    outputLines.push(...generateDispositorsOutput(dispositors));
  }

  if (settings.includeSignDistributions) {
    outputLines.push(
      ...generateElementDistributionOutput(signDistributions.elements)
    );
    outputLines.push(
      ...generateModalityDistributionOutput(signDistributions.modalities)
    );
    outputLines.push(...generatePolarityOutput(signDistributions.polarities));
  }

  outputLines.push(...generateAspectsOutput('[ASPECTS]', groupedAspects));

  if (settings.includeAspectPatterns) {
    outputLines.push(
      ...generateAspectPatternsOutput(patterns, undefined, false)
    );
    if (stelliums.length > 0) {
      stelliums.forEach((stellium) => {
        outputLines.push(...formatStellium(stellium));
      });
    } else {
      outputLines.push('No Stelliums detected.');
    }
  }
  outputLines.push('');
  return outputLines;
};

const processChartPairOutput = (
  analysis: PairwiseAnalysis,
  settings: ChartSettings
): string[] => {
  const outputLines: string[] = [];
  const {
    chart1,
    chart2,
    groupedSynastryAspects,
    compositePatterns,
    houseOverlays,
  } = analysis;

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
      groupedSynastryAspects,
      chart1.name,
      chart2.name
    )
  );

  if (settings.includeAspectPatterns && compositePatterns.length > 0) {
    outputLines.push(
      ...generateAspectPatternsOutput(
        compositePatterns,
        `${chart1.name}-${chart2.name} Composite`,
        true
      )
    );
  }

  outputLines.push('');
  
  if (settings.includeHouseOverlays) {
    outputLines.push(
      ...generateHouseOverlaysOutput(houseOverlays, chart1.name, chart2.name)
    );
    outputLines.push('');
  }
  
  return outputLines;
};

const processGlobalPatternsOutput = (
  analysis: GlobalAnalysis,
  isTransit = false
): string[] => {
  const outputLines: string[] = [];
  const { charts, patterns } = analysis;
  if (patterns.length > 0) {
    const chartNames = charts.map((c) => c.name).join('-');
    let title = `${chartNames} Global Composite`;
    if (isTransit) {
      title = `${chartNames} Global Transit Composite`;
    }
    outputLines.push(...generateAspectPatternsOutput(patterns, title, true));
    outputLines.push('');
  }
  return outputLines;
};

/**
 * Formats a pre-computed and pre-grouped AstrologicalReport into a human-readable text string.
 * @param report The AstrologicalReport object, with aspects already grouped.
 * @returns A string representing the full chart report.
 */
export function formatReportToText(report: AstrologicalReport): string {
  const {
    chartAnalyses,
    pairwiseAnalyses,
    globalAnalysis,
    transitAnalyses,
    globalTransitAnalysis,
  } = report;

  const settings = report.settings as ChartSettings;
  const outputLines: string[] = [];

  const originalCharts = chartAnalyses.map((ca) => ca.chart);
  const chartType = determineChartType(originalCharts);
  outputLines.push(
    ...generateMetadataOutput(settings, chartType, settings.houseSystemName)
  );
  outputLines.push('');

  // 1. Process individual non-transit charts
  const nonTransitAnalyses = chartAnalyses.filter(
    (a) => a.chart.chartType !== 'transit'
  );
  for (const analysis of nonTransitAnalyses) {
    outputLines.push(...processSingleChartOutput(analysis, settings));
  }

  // 2. Process pairwise analyses
  for (const analysis of pairwiseAnalyses) {
    outputLines.push(...processChartPairOutput(analysis, settings));
  }

  // 3. Process global patterns (non-transit)
  if (globalAnalysis) {
    outputLines.push(...processGlobalPatternsOutput(globalAnalysis, false));
  }

  // 4. Process transit analyses
  if (transitAnalyses.length > 0) {
    const transitChartAnalysis = chartAnalyses.find(
      (a) => a.chart.chartType === 'transit'
    );
    if (transitChartAnalysis) {
      outputLines.push(
        ...generateChartHeaderOutput(transitChartAnalysis.chart.name, 'TRANSIT')
      );
      outputLines.push(
        ...generateBirthdataOutput(
          transitChartAnalysis.chart.location,
          transitChartAnalysis.chart.timestamp,
          settings,
          '[DATETIME]'
        )
      );
      outputLines.push(
        ...generatePlanetsOutput(transitChartAnalysis.placements.planets)
      );
      outputLines.push('');
    }

    for (const analysis of transitAnalyses) {
      outputLines.push(
        ...generateAspectsOutput(
          `[TRANSIT ASPECTS: ${analysis.natalChart.name}]`,
          analysis.groupedAspects,
          analysis.natalChart.name,
          analysis.transitChart.name,
          true
        )
      );
      if (settings.includeAspectPatterns) {
        outputLines.push(
          ...generateAspectPatternsOutput(
            analysis.patterns,
            `Transit to ${analysis.natalChart.name}`,
            true
          )
        );
      }
      outputLines.push('');
    }
  }

  // 5. Process global transit patterns
  if (globalTransitAnalysis) {
    outputLines.push(
      ...processGlobalPatternsOutput(globalTransitAnalysis, true)
    );
  }

  return outputLines.join('\n').trimEnd();
}
