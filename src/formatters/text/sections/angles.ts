import { getDegreeSign, formatDegreeInSign, formatZodiacSign, formatPlanetName } from '../../../core/astrology';
import { ChartSettings } from '../../../config/ChartSettings';

/**
 * Generates the [ANGLES] section of the chart output.
 * @param ascDegree The degree of the Ascendant.
 * @param mcDegree The degree of the Midheaven.
 * @param settings The chart settings.
 * @returns An array of strings for the output.
 */
export function generateAnglesOutput(
  ascDegree?: number,
  mcDegree?: number,
  settings?: ChartSettings
): string[] {
  const output: string[] = ['[ANGLES]'];

  const useDegreesOnly = settings?.useDegreesOnly ?? false;
  const displayMode = settings?.displayMode ?? 'words';

  if (ascDegree !== undefined) {
    const ascSign = getDegreeSign(ascDegree);
    const formattedAsc = formatPlanetName('Ascendant', displayMode);
    const formattedSign = formatZodiacSign(ascSign, displayMode);
    output.push(
      `${formattedAsc}: ${formatDegreeInSign(ascDegree, useDegreesOnly)} ${formattedSign}`
    );
  } else {
    const formattedAsc = formatPlanetName('Ascendant', displayMode);
    output.push(`${formattedAsc}: Not available`);
  }

  if (mcDegree !== undefined) {
    const mcSign = getDegreeSign(mcDegree);
    const formattedMc = formatPlanetName('Midheaven', displayMode);
    const formattedSign = formatZodiacSign(mcSign, displayMode);
    output.push(
      `${formattedMc}: ${formatDegreeInSign(mcDegree, useDegreesOnly)} ${formattedSign}`
    );
  } else {
    const formattedMc = formatPlanetName('Midheaven', displayMode);
    output.push(`${formattedMc}: Not available`);
  }

  return output;
}
