/**
 * Generates the chart header line (e.g., "[CHART: Alice]", "[SYNASTRY: Alice-Bob]").
 * @param chartName The name of the chart or chart combination.
 * @param prefix The prefix for the header (e.g., "CHART", "SYNASTRY", "TRANSIT").
 * @returns An array containing a single string for the header line.
 */
export function generateChartHeaderOutput(
  chartName: string | undefined,
  prefix = 'CHART'
): string[] {
  return [`[${prefix}: ${chartName || 'Unknown'}]`];
}
