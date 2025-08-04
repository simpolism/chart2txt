import { ZODIAC_SIGNS, PLANETARY_DIGNITIES, ZODIAC_SYMBOLS, PLANET_SYMBOLS, ASPECT_SYMBOLS } from '../constants';
import { DisplayMode } from '../types';

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

/**
 * Formats a zodiac sign name based on the display mode.
 * @param sign The zodiac sign name.
 * @param displayMode How to display the sign (words, symbols, or both).
 * @returns Formatted sign string.
 */
export function formatZodiacSign(sign: string, displayMode: DisplayMode): string {
  const signIndex = ZODIAC_SIGNS.indexOf(sign);
  if (signIndex === -1) return sign; // fallback for unknown signs
  
  const symbol = ZODIAC_SYMBOLS[signIndex];
  
  switch (displayMode) {
    case 'symbols':
      return symbol;
    case 'both':
      return `${sign} ${symbol}`;
    case 'words':
    default:
      return sign;
  }
}

/**
 * Formats a planet name based on the display mode.
 * @param planetName The planet name.
 * @param displayMode How to display the planet (words, symbols, or both).
 * @returns Formatted planet string.
 */
export function formatPlanetName(planetName: string, displayMode: DisplayMode): string {
  const symbol = PLANET_SYMBOLS[planetName];
  
  switch (displayMode) {
    case 'symbols':
      return symbol || planetName; // fallback to name if no symbol
    case 'both':
      return symbol ? `${planetName} ${symbol}` : planetName;
    case 'words':
    default:
      return planetName;
  }
}

/**
 * Formats an aspect name based on the display mode.
 * @param aspectName The aspect name.
 * @param displayMode How to display the aspect (words, symbols, or both).
 * @returns Formatted aspect string.
 */
export function formatAspectName(aspectName: string, displayMode: DisplayMode): string {
  const symbol = ASPECT_SYMBOLS[aspectName];
  
  switch (displayMode) {
    case 'symbols':
      return symbol || aspectName; // fallback to name if no symbol
    case 'both':
      return symbol ? `${aspectName} ${symbol}` : aspectName;
    case 'words':
    default:
      return aspectName;
  }
}

/**
 * Formats a house number based on the display mode.
 * @param houseNumber The house number (1-12).
 * @param displayMode How to display the house.
 * @returns Formatted house string.
 */
export function formatHouseNumber(houseNumber: number, displayMode: DisplayMode): string {
  if (displayMode === 'symbols') {
    return `${houseNumber}H`;
  }
  return `House ${houseNumber}`;
}
