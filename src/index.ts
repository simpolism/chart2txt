/**
 * chart2txt
 * A library to convert astrological chart data to human-readable text
 */

import type {
  Point,
  ChartData,
  AspectData,
  Settings,
  Aspect,
  HouseSystem,
} from './types';
import { ZODIAC_SIGNS, DEFAULT_SETTINGS } from './constants';

/**
 * Determines the zodiac sign for a given degree
 */
function getDegreeSign(degree: number): string {
  const signIndex = Math.floor(degree / 30) % 12;
  return ZODIAC_SIGNS[signIndex];
}

/**
 * Calculates the house for a given degree, based on the ascendant
 */
function getHousePosition(
  houseSystem: HouseSystem,
  pointDegree: number,
  ascendant: number
): {
  house: number;
  degree: number;
} {
  switch (houseSystem) {
    case 'equal': {
      // House 1 starts at the ascendant
      const housePosition = (pointDegree - ascendant + 360) % 360;
      const house = Math.floor(housePosition / 30) + 1;
      const degree = housePosition % 30;
      return { house, degree };
    }
    case 'whole_sign': {
      // House 1 starts at beginning of ascendant sign
      const house1SignCusp = (Math.floor(ascendant / 30) % 12) * 30;

      // Computation proceeds same as equal, using sign cusp
      const housePosition = (pointDegree - house1SignCusp + 360) % 360;
      const house = Math.floor(housePosition / 30) + 1;
      const degree = housePosition % 30;
      return { house, degree };
    }
  }
}

/**
 * Identifies aspects between planets
 */
function calculateAspects(
  aspectDefinitions: Aspect[],
  planets: Point[]
): AspectData[] {
  const aspects: AspectData[] = [];

  // Compare each planet with every other planet
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planetA = planets[i];
      const planetB = planets[j];

      // Calculate the angular difference
      let diff = Math.abs(planetA.degree - planetB.degree);
      if (diff > 180) diff = 360 - diff;

      // Check against each aspect type
      for (const aspectType of aspectDefinitions) {
        const orb = Math.abs(diff - aspectType.angle);
        if (orb <= aspectType.orb) {
          aspects.push({
            planetA: planetA.name,
            planetB: planetB.name,
            aspectType: aspectType.name,
            orb,
          });
          break; // Only record the strongest aspect between two planets
        }
      }
    }
  }

  return aspects;
}

/**
 * Formats planet sign positions as text
 */
function formatPlanetSigns(
  planets: Point[],
  ascendant?: number,
  points: Point[] = [],
  includeDegree = DEFAULT_SETTINGS.includeSignDegree
): string {
  const ascPoint: Point[] = ascendant
    ? [{ name: 'Ascendant', degree: ascendant }]
    : [];
  const output = [...ascPoint, ...planets, ...points]
    .map((planet) => {
      const sign = getDegreeSign(planet.degree);
      if (includeDegree) {
        const degree = Math.floor(planet.degree % 30);
        return `${planet.name} is at ${degree}° ${sign}`;
      } else {
        return `${planet.name} is in ${sign}`;
      }
    })
    .join('. ');
  return output ? `${output}.` : '';
}

/**
 * Formats planet house positions as text
 */
function formatPlanetHouses(
  houseSystem: HouseSystem,
  ascendant: number,
  planets: Point[],
  points: Point[] = [],
  includeDegree = DEFAULT_SETTINGS.includeHouseDegree
): string {
  // TODO: house systems
  const output = [...planets, ...points]
    .map((planet) => {
      const houseData = getHousePosition(
        houseSystem,
        planet.degree,
        ascendant
      );
      if (includeDegree) {
        return `${planet.name} is at ${houseData.degree}° in house ${houseData.house}`;
      } else {
        return `${planet.name} is in house ${houseData.house}`;
      }
    })
    .join('. ');
  return output ? `${output}.` : '';
}

/**
 * Formats aspects between planets as text
 */
function formatAspects(aspects: AspectData[]): string {
  const output = aspects
    .map((aspect) => {
      return `${aspect.planetA} is in ${aspect.aspectType} with ${
        aspect.planetB
      } (orb: ${aspect.orb.toFixed(1)}°)`;
    })
    .join('. ');
  return output ? `${output}.` : '';
}

/**
 * Formats provided location and time, if present, as text
 */
function formatLocationAndDate(location?: string, timestamp?: Date): string {
  const locationString = location ? `location: ${location}` : '';
  const timestampString = timestamp ? `at: ${timestamp.toISOString()}` : '';
  return [locationString, timestampString].filter((s) => s !== '').join(', ');
}

/**
 * Main function to convert chart data to text
 */
export function chart2txt(
  data: ChartData,
  settings: Partial<Settings> = {}
): string {
  // override default settings with any provided settings data
  const fullSettings: Settings = Object.assign({}, DEFAULT_SETTINGS, settings);

  // format header
  let result = 'Astrology Chart';
  const locationAndDate = formatLocationAndDate(data.location, data.timestamp);
  if (locationAndDate) {
    result += ` (${locationAndDate})`;
  }
  result += ':\n\n';

  // format planets
  if (!fullSettings.omitSigns) {
    result += formatPlanetSigns(
      data.planets,
      fullSettings.includeAscendant && data.ascendant
        ? data.ascendant
        : undefined,
      fullSettings.omitPoints ? [] : data.points,
      fullSettings.includeSignDegree
    );
  }

  // format houses
  if (!fullSettings.omitHouses && data.ascendant !== undefined) {
    result +=
      '\n\n' +
      formatPlanetHouses(
        fullSettings.houseSystem,
        data.ascendant,
        data.planets,
        fullSettings.omitPoints ? [] : data.points,
        fullSettings.includeHouseDegree
      );
  }

  // format aspects
  if (!fullSettings.omitAspects) {
    const aspects = calculateAspects(
      fullSettings.aspectDefinitions,
      data.planets
    );
    if (aspects.length > 0) {
      result += '\n\n' + formatAspects(aspects);
    }
  }

  return result;
}

// Export main function and types
export { ChartData, Point, Settings };

// Default export for browser usage
export default chart2txt;
