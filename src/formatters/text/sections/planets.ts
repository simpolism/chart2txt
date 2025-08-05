import { Point } from '../../../types';
import { ChartSettings } from '../../../config/ChartSettings';
import { getDegreeSign, getDegreeInSign } from '../../../core/astrology';
import { formatPlanetWithDignities } from '../../../core/dignities';
import { getOrdinal } from '../../../utils/formatting';

// Helper function to determine which house a point falls into
// (Copied from houseOverlays.ts - consider moving to a shared util if used in more places)
function getHouseForPoint(pointDegree: number, houseCusps: number[]): number {
  if (!houseCusps || houseCusps.length !== 12) {
    return 0; // Indicate failure or inability to calculate
  }

  for (let i = 0; i < 12; i++) {
    const cuspStart = houseCusps[i];
    const cuspEnd = houseCusps[(i + 1) % 12];

    if (cuspStart < cuspEnd) {
      if (pointDegree >= cuspStart && pointDegree < cuspEnd) {
        return i + 1;
      }
    } else {
      if (pointDegree >= cuspStart || pointDegree < cuspEnd) {
        return i + 1;
      }
    }
  }
  return 0; // Should not be reached if cusps cover 360 degrees
}

/**
 * Generates the [PLANETS] section of the chart output.
 * @param planets Array of planet points.
 * @param houseCusps Array of 12 house cusp degrees, or undefined if not available.
 * @param settings The chart settings.
 * @returns An array of strings for the output.
 */
export function generatePlanetsOutput(
  planets: Point[],
  houseCusps: number[] | undefined,
  settings: ChartSettings
): string[] {
  const output: string[] = ['[PLANETS]'];

  planets.forEach((planet) => {
    const sign = getDegreeSign(planet.degree);
    const degInSign = Math.floor(getDegreeInSign(planet.degree));
    const retrogradeIndicator =
      planet.speed !== undefined && planet.speed < 0 ? ' Retrograde' : '';
    const dignities = formatPlanetWithDignities(planet, houseCusps);
    
    let line = `${planet.name}: ${degInSign}° ${sign}${retrogradeIndicator}`;
    
    if (dignities) {
      line += ` ${dignities}`;
    }

    if (houseCusps && houseCusps.length === 12) {
      const houseNumber = getHouseForPoint(planet.degree, houseCusps);
      if (houseNumber > 0) {
        line += `, ${getOrdinal(houseNumber)} house`;
      }
    }
    output.push(line);
  });

  if (planets.length === 0) {
    output.push('No planets listed.');
  }

  return output;
}
