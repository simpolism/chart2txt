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
      `Ascendant: ${Math.floor(getDegreeInSign(ascDegree))}° ${getDegreeSign(
        ascDegree
      )}`
    );
  } else {
    output.push('Ascendant: Not available');
  }

  if (mcDegree !== undefined) {
    output.push(
      `Midheaven: ${Math.floor(getDegreeInSign(mcDegree))}° ${getDegreeSign(
        mcDegree
      )}`
    );
  } else {
    output.push('Midheaven: Not available');
  }

  return output;
}
