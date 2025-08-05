import { ChartData } from '../../../types';
import { ChartSettings } from '../../../config/ChartSettings';
import { getOrdinal } from '../../../utils/formatting';
import { getHouseForPoint } from '../../../utils/houseCalculations';

/**
 * Generates the [HOUSE OVERLAYS] section for synastry.
 * @param chart1 The first chart data.
 * @param chart2 The second chart data.
 * @param settings The chart settings, containing the house system calculator.
 * @returns An array of strings for the output.
 */
export function generateHouseOverlaysOutput(
  chart1: ChartData,
  chart2: ChartData,
  settings: ChartSettings
): string[] {
  const output: string[] = ['[HOUSE OVERLAYS]'];
  const c1Name = chart1.name;
  const c2Name = chart2.name;

  // Chart 1's planets in Chart 2's houses
  if (chart2.houseCusps && chart2.houseCusps.length === 12) {
    output.push(`${c1Name}'s planets in ${c2Name}'s houses:`);
    if (chart1.planets && chart1.planets.length > 0) {
      chart1.planets.forEach((planet) => {
        const houseNumber = getHouseForPoint(planet.degree, chart2.houseCusps!);
        if (houseNumber) {
          output.push(`- ${planet.name}: ${getOrdinal(houseNumber)}`);
        } else {
          output.push(
            `- ${planet.name}: (Could not determine house in ${c2Name})`
          );
        }
      });
    } else {
      output.push('(No planets listed for overlay)');
    }
  } else {
    output.push(
      `${c1Name}'s planets in ${c2Name}'s houses: (${c2Name} house cusps not available)`
    );
  }

  output.push(''); // Blank line between the two overlay sections

  // Chart 2's planets in Chart 1's houses
  if (chart1.houseCusps && chart1.houseCusps.length === 12) {
    output.push(`${c2Name}'s planets in ${c1Name}'s houses:`);
    if (chart2.planets && chart2.planets.length > 0) {
      chart2.planets.forEach((planet) => {
        const houseNumber = getHouseForPoint(planet.degree, chart1.houseCusps!);
        if (houseNumber) {
          output.push(`- ${planet.name}: ${getOrdinal(houseNumber)}`);
        } else {
          output.push(
            `- ${planet.name}: (Could not determine house in ${c1Name})`
          );
        }
      });
    } else {
      output.push('(No planets listed for overlay)');
    }
  } else {
    output.push(
      `${c2Name}'s planets in ${c1Name}'s houses: (${c1Name} house cusps not available)`
    );
  }

  return output;
}
