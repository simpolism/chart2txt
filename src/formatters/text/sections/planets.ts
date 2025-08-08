import { PlanetPosition } from '../../../types';
import { ChartSettings } from '../../../config/ChartSettings';
import { getOrdinal } from '../../../utils/formatting';
import { formatPlanetWithDignities } from '../../../core/dignities';

/**
 * Generates the [PLANETS] section of the chart output.
 * @param placements Array of planet positions.
 * @param settings The chart settings.
 * @returns An array of strings for the output.
 */
export function generatePlanetsOutput(
  placements: PlanetPosition[],
  settings: ChartSettings
): string[] {
  const output: string[] = ['[PLANETS]'];

  placements.forEach((planet) => {
    const dignities = formatPlanetWithDignities(planet);
    const retrograde = planet.speed && planet.speed < 0 ? ' Retrograde' : '';
    let line = `${planet.name}: ${Math.floor(planet.degree % 30)}° ${
      planet.sign
    }${retrograde} ${dignities}`;

    if (planet.house) {
      line += `, ${getOrdinal(planet.house)} house`;
    }
    output.push(line.replace(/\s+/g, ' ').trim());
  });

  if (placements.length === 0) {
    output.push('No planets listed.');
  }

  return output;
}
