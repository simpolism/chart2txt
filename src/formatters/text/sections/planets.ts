import { Point } from '../../../types';
import { ChartSettings } from '../../../config/ChartSettings';
import { getDegreeSign, getDegreeInSign } from '../../../core/astrology';
import { formatPlanetWithDignities } from '../../../core/dignities';
import { getOrdinal } from '../../../utils/formatting';
import { getHouseForPoint } from '../../../utils/houseCalculations';

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
      if (houseNumber) {
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
