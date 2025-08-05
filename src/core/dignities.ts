import { ZODIAC_SIGNS } from '../constants';
import { getDegreeSign } from './astrology';
import { Point } from '../types';

export interface DignityInfo {
  rulers: string[];
  exaltation?: string;
  detriment?: string;
  fall?: string;
}

// Essential dignity mappings
const SIGN_DIGNITIES: Record<string, DignityInfo> = {
  Aries: {
    rulers: ['Mars'],
    exaltation: 'Sun',
    detriment: 'Venus',
    fall: 'Saturn',
  },
  Taurus: {
    rulers: ['Venus'],
    exaltation: 'Moon',
    detriment: 'Mars',
    fall: 'Uranus',
  },
  Gemini: {
    rulers: ['Mercury'],
    detriment: 'Jupiter',
  },
  Cancer: {
    rulers: ['Moon'],
    exaltation: 'Jupiter',
    detriment: 'Saturn',
    fall: 'Mars',
  },
  Leo: {
    rulers: ['Sun'],
    detriment: 'Saturn',
    fall: 'Neptune',
  },
  Virgo: {
    rulers: ['Mercury'],
    exaltation: 'Mercury',
    detriment: 'Jupiter',
    fall: 'Venus',
  },
  Libra: {
    rulers: ['Venus'],
    exaltation: 'Saturn',
    detriment: 'Mars',
    fall: 'Sun',
  },
  Scorpio: {
    rulers: ['Mars'],
    detriment: 'Venus',
    fall: 'Moon',
  },
  Sagittarius: {
    rulers: ['Jupiter'],
    detriment: 'Mercury',
  },
  Capricorn: {
    rulers: ['Saturn'],
    exaltation: 'Mars',
    detriment: 'Moon',
    fall: 'Jupiter',
  },
  Aquarius: {
    rulers: ['Saturn'],
    detriment: 'Sun',
    fall: 'Neptune',
  },
  Pisces: {
    rulers: ['Jupiter'],
    exaltation: 'Venus',
    detriment: 'Mercury',
    fall: 'Mercury',
  },
};

/**
 * Gets the essential dignities for a planet in a specific sign
 * @param planetName Name of the planet
 * @param sign The zodiac sign
 * @returns Array of dignity descriptions
 */
export function getPlanetDignities(planetName: string, sign: string): string[] {
  const dignities: string[] = [];
  const normalizedSign = sign.trim();
  const signInfo = SIGN_DIGNITIES[normalizedSign];

  if (!signInfo) return dignities;

  // Check for rulership (domicile)
  if (signInfo.rulers.includes(planetName)) {
    dignities.push(`Domicile`);
  }

  // Check for exaltation
  if (signInfo.exaltation === planetName) {
    dignities.push(`Exaltation`);
  }

  // Check for detriment
  if (signInfo.detriment === planetName) {
    dignities.push(`Detriment`);
  }

  // Check for fall
  if (signInfo.fall && signInfo.fall === planetName) {
    dignities.push(`Fall`);
  }

  return dignities;
}

/**
 * Gets the ruler(s) of a zodiac sign
 * @param sign The zodiac sign
 * @returns Array of ruling planets
 */
export function getSignRulers(sign: string): string[] {
  const normalizedSign = sign.trim();
  const signInfo = SIGN_DIGNITIES[normalizedSign];
  return signInfo ? signInfo.rulers : [];
}

/**
 * Formats planet dignities for display
 * @param planet The planet point
 * @param houseCusps Array of house cusps (optional)
 * @returns Formatted string with dignities
 */
export function formatPlanetWithDignities(
  planet: Point,
  houseCusps?: number[]
): string {
  const sign = getDegreeSign(planet.degree);
  const dignities = getPlanetDignities(planet.name, sign);
  const rulers = getSignRulers(sign);

  let dignitiesStr = '';
  if (dignities.length > 0 && dignities.includes('Domicile')) {
    dignitiesStr = `[${dignities.join(', ')}]`;
  } else if (dignities.length > 0 && rulers.length > 0) {
    dignitiesStr = `[${dignities.join(', ')} | Ruler: ${rulers.join(', ')}]`;
  } else if (rulers.length > 0) {
    dignitiesStr = `[Ruler: ${rulers.join(', ')}]`;
  }

  return dignitiesStr;
}
