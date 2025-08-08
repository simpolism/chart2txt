import { ChartData, MultiChartData, PartialSettings, AstrologicalReport, ChartAnalysis, PairwiseAnalysis, TransitAnalysis, GlobalAnalysis, isMultiChartData } from '../../types';
import { analyzeCharts } from '../../core/analysis';
import { ChartSettings } from '../../config/ChartSettings';

import { generateMetadataOutput, determineChartType } from './sections/metadata';
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
  const { chart, aspects, patterns, stelliums, signDistributions, dispositors, placements } = analysis;

  outputLines.push(...generateChartHeaderOutput(chart.name, chartTitlePrefix));
  outputLines.push(...generateBirthdataOutput(chart.location, chart.timestamp, settings));
  outputLines.push(...generateAnglesOutput(chart.ascendant, chart.midheaven));
  outputLines.push(...generateHousesOutput(chart.houseCusps));
  outputLines.push(...generatePlanetsOutput(placements.planets, settings));
  outputLines.push(...generateDispositorsOutput(dispositors));

  if (settings.includeSignDistributions) {
    outputLines.push(...generateElementDistributionOutput(signDistributions.elements));
    outputLines.push(...generateModalityDistributionOutput(signDistributions.modalities));
    outputLines.push(...generatePolarityOutput(signDistributions.polarities));
  }

  outputLines.push(...generateAspectsOutput('[ASPECTS]', aspects, settings));

  if (settings.includeAspectPatterns) {
    outputLines.push('[ASPECT PATTERNS]');
    if (patterns.length === 0 && stelliums.length === 0) {
      outputLines.push('No aspect patterns detected.');
      outputLines.push('No stelliums detected.');
    } else {
      if (stelliums.length > 0) {
        stelliums.forEach((stellium) => {
          outputLines.push(...formatStellium(stellium));
        });
      } else {
        outputLines.push('No stelliums detected.');
      }
      if (patterns.length > 0) {
        outputLines.push(...generateAspectPatternsOutput(patterns, undefined, false).slice(1));
      }
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
  const { chart1, chart2, synastryAspects, compositePatterns, houseOverlays } = analysis;

  const header =
    chart1.chartType === 'event' && chart2.chartType === 'event'
      ? 'EVENT_RELATIONSHIP'
      : chart1.chartType === 'event' || chart2.chartType === 'event'
      ? 'NATAL_EVENT'
      : 'SYNASTRY';
  outputLines.push(...generateChartHeaderOutput(`${chart1.name}-${chart2.name}`, header));
  outputLines.push(...generateAspectsOutput('[PLANET-PLANET ASPECTS]', synastryAspects, settings, chart1.name, chart2.name));

  if (settings.includeAspectPatterns && compositePatterns.length > 0) {
    outputLines.push(...generateAspectPatternsOutput(compositePatterns, `${chart1.name}-${chart2.name} Composite`, true));
  }

  outputLines.push('');
  outputLines.push(...generateHouseOverlaysOutput(houseOverlays, chart1.name, chart2.name));
  outputLines.push('');
  return outputLines;
};

const processTransitChartInfoOutput = (
  analysis: TransitAnalysis,
  settings: ChartSettings
): string[] => {
    const outputLines: string[] = [];
    const { transitChart, aspects, patterns } = analysis;

    outputLines.push(...generateChartHeaderOutput(transitChart.name, 'TRANSIT'));
    outputLines.push(...generateBirthdataOutput(transitChart.location, transitChart.timestamp, settings, '[DATETIME]'));
    
    const transitChartAnalysis = {
        placements: { planets: transitChart.planets.map(p => ({...p, sign: ''})) },
    }
    outputLines.push(...generatePlanetsOutput(transitChartAnalysis.placements.planets, settings));
    outputLines.push('');
    
    outputLines.push(...generateAspectsOutput(`[TRANSIT ASPECTS: ${analysis.natalChart.name}]`, aspects, settings, analysis.natalChart.name, transitChart.name, true));

    if (settings.includeAspectPatterns) {
        outputLines.push(...generateAspectPatternsOutput(patterns, `Transit to ${analysis.natalChart.name}`, true));
    }
    outputLines.push('');
    return outputLines;
};

const processGlobalPatternsOutput = (
    analysis: GlobalAnalysis,
    isTransit: boolean = false
): string[] => {
    const outputLines: string[] = [];
    const { charts, patterns } = analysis;
    if (patterns.length > 0) {
        const chartNames = charts.map(c => c.name).join('-');
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
 * Formats a pre-computed AstrologicalReport into a human-readable text string.
 * @param report The AstrologicalReport object from formatChartToJson (analyzeCharts).
 * @returns A string representing the full chart report.
 */
export function formatReportToText(report: AstrologicalReport): string {
  const { chartAnalyses, pairwiseAnalyses, globalAnalysis, transitAnalyses, globalTransitAnalysis } = report;
  
  // The settings object in the report IS the ChartSettings instance.
  const settings = report.settings as ChartSettings;
  const outputLines: string[] = [];

  const originalCharts = chartAnalyses.map(ca => ca.chart);
  const chartType = determineChartType(originalCharts);
  outputLines.push(...generateMetadataOutput(settings, chartType, settings.houseSystemName));
  outputLines.push('');

  // 1. Process individual non-transit charts
  const nonTransitAnalyses = chartAnalyses.filter(a => a.chart.chartType !== 'transit');
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
      // Find the transit chart info from chart analyses to print its header once
      const transitChartAnalysis = chartAnalyses.find(a => a.chart.chartType === 'transit');
      if(transitChartAnalysis) {
          outputLines.push(...generateChartHeaderOutput(transitChartAnalysis.chart.name, 'TRANSIT'));
          outputLines.push(...generateBirthdataOutput(transitChartAnalysis.chart.location, transitChartAnalysis.chart.timestamp, settings, '[DATETIME]'));
          outputLines.push(...generatePlanetsOutput(transitChartAnalysis.placements.planets, settings));
          outputLines.push('');
      }

      for (const analysis of transitAnalyses) {
          outputLines.push(...generateAspectsOutput(`[TRANSIT ASPECTS: ${analysis.natalChart.name}]`, analysis.aspects, settings, analysis.natalChart.name, analysis.transitChart.name, true));
          if (settings.includeAspectPatterns) {
              outputLines.push(...generateAspectPatternsOutput(analysis.patterns, `Transit to ${analysis.natalChart.name}`, true));
          }
          outputLines.push('');
      }
  }
  
  // 5. Process global transit patterns
  if (globalTransitAnalysis) {
      outputLines.push(...processGlobalPatternsOutput(globalTransitAnalysis, true));
  }

  return outputLines.join('\n').trimEnd();
}


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
  const report: AstrologicalReport = analyzeCharts(data, partialSettings);
  return formatReportToText(report);
}
