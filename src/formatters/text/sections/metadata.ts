import { ChartSettings } from '../../../config/ChartSettings';

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
