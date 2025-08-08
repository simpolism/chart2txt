import { getOrdinal } from '../../../utils/formatting';

/**
 * Generates the [HOUSE OVERLAYS] section for synastry.
 * @param overlays The pre-calculated house overlay data.
 * @param chart1Name The name of the first chart.
 * @param chart2Name The name of the second chart.
 * @returns An array of strings for the output.
 */
export function generateHouseOverlaysOutput(
  overlays: {
    chart1InChart2Houses: { [key: string]: number };
    chart2InChart1Houses: { [key: string]: number };
  },
  chart1Name: string,
  chart2Name: string
): string[] {
  const output: string[] = ['[HOUSE OVERLAYS]'];

  output.push(`${chart1Name}'s planets in ${chart2Name}'s houses:`);
  if (Object.keys(overlays.chart1InChart2Houses).length > 0) {
    for (const planet in overlays.chart1InChart2Houses) {
      output.push(
        `- ${planet}: ${getOrdinal(overlays.chart1InChart2Houses[planet])}`
      );
    }
  } else {
    output.push(`(${chart2Name} house cusps not available)`);
  }

  output.push('');

  output.push(`${chart2Name}'s planets in ${chart1Name}'s houses:`);
  if (Object.keys(overlays.chart2InChart1Houses).length > 0) {
    for (const planet in overlays.chart2InChart1Houses) {
      output.push(
        `- ${planet}: ${getOrdinal(overlays.chart2InChart1Houses[planet])}`
      );
    }
  } else {
    output.push(`(${chart1Name} house cusps not available)`);
  }

  return output;
}
