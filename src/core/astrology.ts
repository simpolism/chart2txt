import { ZODIAC_SIGNS } from '../constants';

/**
 * Normalizes a degree value to the 0-359.999... range.
 * @param degree The degree value to normalize.
 * @returns The normalized degree value.
 */
export function normalizeDegree(degree: number): number {
  if (!isFinite(degree)) {
    throw new Error(`Invalid degree value: ${degree}`);
  }

  let normalized = degree % 360;
  if (normalized < 0) {
    normalized += 360;
  }
  return normalized;
}

/**
 * Determines the zodiac sign for a given degree.
 * @param degree The absolute degree (any value, will be normalized).
 * @returns The zodiac sign name.
 */
export function getDegreeSign(degree: number): string {
  const normalizedDegree = normalizeDegree(degree);
  const signIndex = Math.floor(normalizedDegree / 30);

  if (signIndex < 0 || signIndex >= ZODIAC_SIGNS.length) {
    console.error(
      `Invalid sign index computed: ${signIndex} for normalized degree ${normalizedDegree}`
    );
    return 'Unknown Sign';
  }
  return ZODIAC_SIGNS[signIndex];
}

/**
 * Calculates the degree within its 30-degree sign (0-29.99...).
 * @param degree The absolute degree (any value, will be normalized).
 * @returns The degree within the sign.
 */
export function getDegreeInSign(degree: number): number {
  const normalizedDegree = normalizeDegree(degree);
  return normalizedDegree % 30;
}
