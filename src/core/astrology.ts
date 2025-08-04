import { ZODIAC_SIGNS, PLANETARY_DIGNITIES } from '../constants';

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

/**
 * Formats a degree value to degrees, minutes, and seconds.
 * @param degree The degree value to format.
 * @returns A formatted string like "15°42'30"".
 */
export function formatDegreesMinutesSeconds(degree: number): string {
  const degrees = Math.floor(degree);
  const totalMinutes = (degree - degrees) * 60;
  const minutes = Math.floor(totalMinutes);
  const seconds = Math.floor((totalMinutes - minutes) * 60);
  
  return `${degrees}°${minutes.toString().padStart(2, '0')}'${seconds.toString().padStart(2, '0')}"`;
}

/**
 * Formats a degree within a sign to degrees, minutes, and seconds.
 * @param degree The absolute degree (0-359.99...).
 * @param useDegreesOnly If true, only show degrees without minutes/seconds.
 * @returns A formatted string like "15°42'30"" or "15°" for the degree within the sign.
 */
export function formatDegreeInSign(degree: number, useDegreesOnly = false): string {
  const degreeInSign = getDegreeInSign(degree);
  if (useDegreesOnly) {
    return `${Math.floor(degreeInSign)}°`;
  }
  return formatDegreesMinutesSeconds(degreeInSign);
}

/**
 * Formats a degree value conditionally based on precision setting.
 * @param degree The degree value to format.
 * @param useDegreesOnly If true, only show degrees without minutes/seconds.
 * @returns A formatted string like "15°42'30"" or "15°".
 */
export function formatDegreeConditional(degree: number, useDegreesOnly = false): string {
  if (useDegreesOnly) {
    return `${Math.floor(degree)}°`;
  }
  return formatDegreesMinutesSeconds(degree);
}

export type DignityType = 'rulership' | 'exaltation' | 'detriment' | 'fall' | 'none';

/**
 * Determines the dignity of a planet in a given sign.
 * @param planetName The name of the planet.
 * @param sign The zodiac sign.
 * @returns The dignity type.
 */
export function getPlanetaryDignity(planetName: string, sign: string): DignityType {
  const dignities = PLANETARY_DIGNITIES[planetName];
  if (!dignities) return 'none';
  
  if (dignities.rulership.includes(sign)) return 'rulership';
  if (dignities.exaltation.includes(sign)) return 'exaltation';
  if (dignities.detriment.includes(sign)) return 'detriment';
  if (dignities.fall.includes(sign)) return 'fall';
  
  return 'none';
}

/**
 * Gets a display symbol for dignity types.
 * @param dignity The dignity type.
 * @returns A symbol representing the dignity.
 */
export function getDignitySymbol(dignity: DignityType): string {
  switch (dignity) {
    case 'rulership': return ' (R)';
    case 'exaltation': return ' (E)';
    case 'detriment': return ' (D)';
    case 'fall': return ' (F)';
    case 'none': return '';
  }
}
