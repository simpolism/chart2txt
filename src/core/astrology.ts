import { ZODIAC_SIGNS } from '../constants';

/**
 * Determines the zodiac sign for a given degree.
 * @param degree The absolute degree (0-359.99...).
 * @returns The zodiac sign name.
 */
export function getDegreeSign(degree: number): string {
  const signIndex = Math.floor(degree / 30) % 12;
  if (signIndex < 0 || signIndex >= ZODIAC_SIGNS.length) {
    // This should ideally not happen with degree % 12 logic if degree is positive
    console.error(
      `Invalid sign index computed: ${signIndex} for degree ${degree}`
    );
    return 'Unknown Sign';
  }
  return ZODIAC_SIGNS[signIndex];
}

/**
 * Calculates the degree within its 30-degree sign (0-29.99...).
 * @param degree The absolute degree (0-359.99...).
 * @returns The degree within the sign.
 */
export function getDegreeInSign(degree: number): number {
  return degree % 30;
}
