import { ChartSettings } from '../../../config/ChartSettings';
import { MultiChartData } from '../../../types';

export function determineChartType(data: MultiChartData): string {
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
}

/**
 * Generates the [METADATA] section of the chart output.
 * @param settings The chart settings.
 * @param chartType A string describing the type of chart (e.g., "natal", "synastry").
 * @param houseSystemName Optional: The name of the house system used.
 * @returns An array of strings, each representing a line in the output.
 */
export function generateMetadataOutput(
  settings: ChartSettings,
  chartType: string,
  houseSystemName?: string
): string[] {
  const output = ['[METADATA]', `chart_type: ${chartType}`];
  if (houseSystemName) {
    output.push(`house_system: ${houseSystemName}`);
  }
  output.push(`date_format: ${settings.dateFormat}`);
  return output;
}