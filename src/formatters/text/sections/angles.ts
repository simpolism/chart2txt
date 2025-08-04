import { getDegreeSign, formatDegreeInSign } from '../../../core/astrology';
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

  if (ascDegree !== undefined) {
    output.push(
      `ASC: ${formatDegreeInSign(ascDegree, useDegreesOnly)} ${getDegreeSign(ascDegree)}`
    );
  } else {
    output.push('ASC: Not available');
  }

  if (mcDegree !== undefined) {
    output.push(
      `MC: ${formatDegreeInSign(mcDegree, useDegreesOnly)} ${getDegreeSign(mcDegree)}`
    );
  } else {
    output.push('MC: Not available');
  }

  return output;
}
