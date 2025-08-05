import { ChartData } from '../../../types';
import { ChartSettings } from '../../../config/ChartSettings';
import { getOrdinal } from '../../../utils/formatting';

// Helper function to determine which house a point falls into
function getHouseForPoint(pointDegree: number, houseCusps: number[]): number {
  if (!houseCusps || houseCusps.length !== 12) {
    // console.error("Invalid or missing houseCusps array for getHouseForPoint.");
    return 0; // Indicate failure or inability to calculate
  }

  for (let i = 0; i < 12; i++) {
    const cuspStart = houseCusps[i]; // Cusp of current house (e.g., for House 1, i=0, cuspStart = Cusp 1)
    const cuspEnd = houseCusps[(i + 1) % 12]; // Cusp of next house (e.g., for House 1, cuspEnd = Cusp 2)

    // Check if the point degree falls between cuspStart and cuspEnd
    if (cuspStart < cuspEnd) {
      // Normal case: e.g., Cusp1=10, Cusp2=40. Point is between 10 and 40.
      if (pointDegree >= cuspStart && pointDegree < cuspEnd) {
        return i + 1; // House number is i+1 (cusps are 0-indexed, houses 1-indexed)
      }
    } else {
      // Wrap-around case: e.g., Cusp12=330, Cusp1=20. Point is >=330 OR <20.
      if (pointDegree >= cuspStart || pointDegree < cuspEnd) {
        return i + 1; // House number is i+1
      }
    }
  }
  // console.warn(`Point ${pointDegree} did not fall into any house with cusps: ${houseCusps.join(', ')}.`);
  return 0; // Should ideally not be reached if cusps correctly cover 360 degrees
}

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
        if (houseNumber > 0) {
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
        if (houseNumber > 0) {
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
