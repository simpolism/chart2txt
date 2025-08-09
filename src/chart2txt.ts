import { ChartData, MultiChartData, PartialSettings } from './types';
import { analyzeCharts } from './core/analysis';
import { groupAspects } from './core/grouping';
import { formatReportToText } from './formatters/text/textFormatter';
import { ChartSettings } from './config/ChartSettings';

/**
 * The main, all-in-one function to generate a complete astrological report text.
 * It performs analysis, default aspect grouping, and text formatting in one step.
 * @param data The chart data for one or more charts.
 * @param partialSettings Optional settings to override defaults.
 * @returns A string representing the full chart report.
 */
export function chart2txt(
  data: ChartData | MultiChartData,
  partialSettings: PartialSettings = {}
): string {
  // 1. Analyze the chart data to get a raw report.
  const analysisReport = analyzeCharts(data, partialSettings);

  // 2. Apply default grouping logic to the raw aspects.
  const settings = analysisReport.settings as ChartSettings;
  analysisReport.chartAnalyses.forEach((ca) => {
    ca.groupedAspects = groupAspects(ca.aspects, settings);
  });
  analysisReport.pairwiseAnalyses.forEach((pa) => {
    pa.groupedSynastryAspects = groupAspects(pa.synastryAspects, settings);
  });
  analysisReport.transitAnalyses.forEach((ta) => {
    ta.groupedAspects = groupAspects(ta.aspects, settings);
  });

  // 3. Format the now-grouped report into text.
  return formatReportToText(analysisReport);
}
