import { Point, Stellium, PlanetPosition } from '../types';
import { getDegreeSign } from './astrology';
import { getHouseForPoint } from '../utils/houseCalculations';
import { getOrdinal } from '../utils/formatting';

/**
 * Convert Point to PlanetPosition
 */
function pointToPlanetPosition(
  point: Point,
  houseCusps?: number[]
): PlanetPosition {
  const sign = getDegreeSign(point.degree);
  const house = houseCusps
    ? getHouseForPoint(point.degree, houseCusps) || undefined
    : undefined;

  return {
    name: point.name,
    degree: point.degree,
    sign,
    house,
  };
}

/**
 * Detect Stellium patterns (3+ planets in same sign or adjacent houses)
 * This function requires house information and is specific to single-chart analysis
 */
export function detectStelliums(
  planets: Point[],
  houseCusps?: number[],
  minPlanets = 3
): Stellium[] {
  const patterns: Stellium[] = [];

  // Group by sign
  const signGroups = new Map<string, Point[]>();
  planets.forEach((planet) => {
    const sign = getDegreeSign(planet.degree);
    if (!signGroups.has(sign)) {
      signGroups.set(sign, []);
    }
    signGroups.get(sign)!.push(planet);
  });

  // Check sign-based stelliums
  signGroups.forEach((planetsInSign, sign) => {
    if (planetsInSign.length >= minPlanets) {
      const planetPositions = planetsInSign.map((p) =>
        pointToPlanetPosition(p, houseCusps)
      );
      const houses = planetPositions
        .map((p) => p.house)
        .filter((h) => h !== undefined) as number[];
      const degrees = planetsInSign.map((p) => p.degree);
      const span = Math.max(...degrees) - Math.min(...degrees);

      patterns.push({
        type: 'Stellium',
        planets: planetPositions,
        sign,
        houses: [...new Set(houses)].sort(),
        span,
      });
    }
  });

  // Check house-based stelliums (if house cusps available)
  if (houseCusps) {
    const houseGroups = new Map<number, Point[]>();
    planets.forEach((planet) => {
      const house = getHouseForPoint(planet.degree, houseCusps);
      if (house) {
        if (!houseGroups.has(house)) {
          houseGroups.set(house, []);
        }
        houseGroups.get(house)!.push(planet);
      }
    });

    houseGroups.forEach((planetsInHouse, house) => {
      if (planetsInHouse.length >= minPlanets) {
        const planetPositions = planetsInHouse.map((p) =>
          pointToPlanetPosition(p, houseCusps)
        );
        const degrees = planetsInHouse.map((p) => p.degree);
        const span = Math.max(...degrees) - Math.min(...degrees);

        // Only add if not already covered by sign stellium
        const existingSignStellium = patterns.find(
          (p) =>
            p.type === 'Stellium' &&
            p.planets.some((planet) =>
              planetPositions.some((pp) => pp.name === planet.name)
            )
        );

        if (!existingSignStellium) {
          patterns.push({
            type: 'Stellium',
            planets: planetPositions,
            houses: [house],
            span,
          });
        }
      }
    });
  }

  return patterns;
}

/**
 * Format a Stellium pattern for display
 */
export function formatStellium(pattern: Stellium): string[] {
  const output = ['Stellium:'];
  const planetNames = pattern.planets.map((p) => p.name).join(', ');
  output.push(`  - Planets: ${planetNames}`);

  if (pattern.sign) {
    output.push(`  - Sign: ${pattern.sign}`);
  }

  if (pattern.houses && pattern.houses.length > 0) {
    const houseStr =
      pattern.houses.length === 1
        ? `${getOrdinal(pattern.houses[0])}`
        : pattern.houses.map((h) => getOrdinal(h)).join('-');
    output.push(`  - Houses: ${houseStr}`);
  }

  output.push(`  - Span: ${pattern.span.toFixed(1)}°`);
  output.push('');

  return output;
}
