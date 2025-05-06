import { getDegreeSign, getDegreeInSign } from '../../../core/astrology';

/**
 * Generates the [ANGLES] section of the chart output.
 * @param ascDegree The degree of the Ascendant.
 * @param mcDegree The degree of the Midheaven.
 * @returns An array of strings for the output.
 */
export function generateAnglesOutput(
  ascDegree?: number,
  mcDegree?: number
): string[] {
  const output: string[] = ['[ANGLES]'];

  if (ascDegree !== undefined) {
    output.push(
      `ASC: ${Math.floor(getDegreeInSign(ascDegree))}° ${getDegreeSign(
        ascDegree
      )}`
    );
  } else {
    output.push('ASC: Not available');
  }

  if (mcDegree !== undefined) {
    output.push(
      `MC: ${Math.floor(getDegreeInSign(mcDegree))}° ${getDegreeSign(mcDegree)}`
    );
  } else {
    output.push('MC: Not available');
  }

  return output;
}
