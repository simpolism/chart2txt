import {
  Point,
  Aspect,
  AspectData,
  AspectPattern,
  PlanetPosition,
  TSquare,
  GrandTrine,
  Stellium,
  GrandCross,
  Yod,
  MysticRectangle,
  Kite,
} from '../types';
import { getDegreeSign, getDegreeInSign } from './astrology';
import { calculateAspects } from './aspects';

/**
 * Helper function to calculate orb between two planets for a specific aspect angle
 */
function calculateOrb(
  planet1: Point,
  planet2: Point,
  aspectAngle: number
): number {
  let diff = Math.abs(planet1.degree - planet2.degree);
  if (diff > 180) diff = 360 - diff;
  return Math.abs(diff - aspectAngle);
}

/**
 * Helper function to get house for a planet
 */
function getHouseForPoint(
  pointDegree: number,
  houseCusps: number[]
): number | undefined {
  if (!houseCusps || houseCusps.length !== 12) {
    return undefined;
  }

  for (let i = 0; i < 12; i++) {
    const cuspStart = houseCusps[i];
    const cuspEnd = houseCusps[(i + 1) % 12];

    if (cuspStart < cuspEnd) {
      if (pointDegree >= cuspStart && pointDegree < cuspEnd) {
        return i + 1;
      }
    } else {
      if (pointDegree >= cuspStart || pointDegree < cuspEnd) {
        return i + 1;
      }
    }
  }
  return undefined;
}

/**
 * Convert Point to PlanetPosition
 */
function pointToPlanetPosition(
  point: Point,
  houseCusps?: number[]
): PlanetPosition {
  const sign = getDegreeSign(point.degree);
  const house = houseCusps
    ? getHouseForPoint(point.degree, houseCusps)
    : undefined;

  return {
    name: point.name,
    degree: point.degree,
    sign,
    house,
  };
}

/**
 * Determine the modality (Cardinal, Fixed, Mutable) of a sign
 */
function getSignModality(sign: string): 'Cardinal' | 'Fixed' | 'Mutable' {
  const cardinal = ['Aries', 'Cancer', 'Libra', 'Capricorn'];
  const fixed = ['Taurus', 'Leo', 'Scorpio', 'Aquarius'];
  const mutable = ['Gemini', 'Virgo', 'Sagittarius', 'Pisces'];

  if (cardinal.includes(sign)) return 'Cardinal';
  if (fixed.includes(sign)) return 'Fixed';
  return 'Mutable';
}

/**
 * Determine the element (Fire, Earth, Air, Water) of a sign
 */
function getSignElement(sign: string): 'Fire' | 'Earth' | 'Air' | 'Water' {
  const fire = ['Aries', 'Leo', 'Sagittarius'];
  const earth = ['Taurus', 'Virgo', 'Capricorn'];
  const air = ['Gemini', 'Libra', 'Aquarius'];
  const water = ['Cancer', 'Scorpio', 'Pisces'];

  if (fire.includes(sign)) return 'Fire';
  if (earth.includes(sign)) return 'Earth';
  if (air.includes(sign)) return 'Air';
  return 'Water';
}

/**
 * Check if two planets form a specific aspect within orb
 */
function hasAspect(
  planet1: Point,
  planet2: Point,
  aspectAngle: number,
  orb: number
): boolean {
  const calculatedOrb = calculateOrb(planet1, planet2, aspectAngle);
  return calculatedOrb <= orb;
}

/**
 * Detect T-Square patterns
 */
function detectTSquares(
  planets: Point[],
  houseCusps?: number[],
  maxOrb = 8
): TSquare[] {
  const patterns: TSquare[] = [];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      // Check for opposition
      if (hasAspect(planets[i], planets[j], 180, maxOrb)) {
        // Look for a third planet that squares both
        for (let k = 0; k < planets.length; k++) {
          if (k === i || k === j) continue;

          if (
            hasAspect(planets[i], planets[k], 90, maxOrb) &&
            hasAspect(planets[j], planets[k], 90, maxOrb)
          ) {
            const apex = pointToPlanetPosition(planets[k], houseCusps);
            const opp1 = pointToPlanetPosition(planets[i], houseCusps);
            const opp2 = pointToPlanetPosition(planets[j], houseCusps);

            const orb1 = calculateOrb(planets[i], planets[j], 180);
            const orb2 = calculateOrb(planets[i], planets[k], 90);
            const orb3 = calculateOrb(planets[j], planets[k], 90);
            const averageOrb = (orb1 + orb2 + orb3) / 3;

            // Determine modality from apex planet
            const mode = getSignModality(apex.sign);

            patterns.push({
              type: 'T-Square',
              apex,
              opposition: [opp1, opp2],
              mode,
              averageOrb,
            });
          }
        }
      }
    }
  }

  return patterns;
}

/**
 * Detect Grand Trine patterns
 */
function detectGrandTrines(
  planets: Point[],
  houseCusps?: number[],
  maxOrb = 8
): GrandTrine[] {
  const patterns: GrandTrine[] = [];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      for (let k = j + 1; k < planets.length; k++) {
        // Check if all three planets form trines with each other
        if (
          hasAspect(planets[i], planets[j], 120, maxOrb) &&
          hasAspect(planets[j], planets[k], 120, maxOrb) &&
          hasAspect(planets[k], planets[i], 120, maxOrb)
        ) {
          const planet1 = pointToPlanetPosition(planets[i], houseCusps);
          const planet2 = pointToPlanetPosition(planets[j], houseCusps);
          const planet3 = pointToPlanetPosition(planets[k], houseCusps);

          const orb1 = calculateOrb(planets[i], planets[j], 120);
          const orb2 = calculateOrb(planets[j], planets[k], 120);
          const orb3 = calculateOrb(planets[k], planets[i], 120);
          const averageOrb = (orb1 + orb2 + orb3) / 3;

          // Determine element from the planets (should be same element for proper grand trine)
          const element = getSignElement(planet1.sign);

          patterns.push({
            type: 'Grand Trine',
            planets: [planet1, planet2, planet3],
            element,
            averageOrb,
          });
        }
      }
    }
  }

  return patterns;
}

/**
 * Detect Stellium patterns (3+ planets in same sign or adjacent houses)
 */
function detectStelliums(
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
 * Detect Grand Cross patterns
 */
function detectGrandCrosses(
  planets: Point[],
  houseCusps?: number[],
  maxOrb = 8
): GrandCross[] {
  const patterns: GrandCross[] = [];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      for (let k = j + 1; k < planets.length; k++) {
        for (let l = k + 1; l < planets.length; l++) {
          // Check if planets form two oppositions and four squares
          const pairs = [
            [i, j],
            [k, l],
          ];
          const otherPairs = [
            [i, k],
            [j, l],
            [i, l],
            [j, k],
          ];

          // Check for two oppositions
          let oppositions = 0;
          let squares = 0;

          pairs.forEach(([a, b]) => {
            if (hasAspect(planets[a], planets[b], 180, maxOrb)) {
              oppositions++;
            }
          });

          otherPairs.forEach(([a, b]) => {
            if (hasAspect(planets[a], planets[b], 90, maxOrb)) {
              squares++;
            }
          });

          if (oppositions === 2 && squares === 4) {
            const planet1 = pointToPlanetPosition(planets[i], houseCusps);
            const planet2 = pointToPlanetPosition(planets[j], houseCusps);
            const planet3 = pointToPlanetPosition(planets[k], houseCusps);
            const planet4 = pointToPlanetPosition(planets[l], houseCusps);

            // Calculate average orb
            let totalOrb = 0;
            let aspectCount = 0;

            pairs.forEach(([a, b]) => {
              totalOrb += calculateOrb(planets[a], planets[b], 180);
              aspectCount++;
            });

            otherPairs.forEach(([a, b]) => {
              totalOrb += calculateOrb(planets[a], planets[b], 90);
              aspectCount++;
            });

            const averageOrb = totalOrb / aspectCount;
            const mode = getSignModality(planet1.sign); // Determine from first planet

            patterns.push({
              type: 'Grand Cross',
              planets: [planet1, planet2, planet3, planet4],
              mode,
              averageOrb,
            });
          }
        }
      }
    }
  }

  return patterns;
}

/**
 * Detect Yod patterns (two quincunxes to apex planet and one sextile between base planets)
 */
function detectYods(
  planets: Point[],
  houseCusps?: number[],
  maxOrb = 5
): Yod[] {
  const patterns: Yod[] = [];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      // Check for sextile between base planets
      if (hasAspect(planets[i], planets[j], 60, maxOrb)) {
        // Look for apex planet that forms quincunxes with both
        for (let k = 0; k < planets.length; k++) {
          if (k === i || k === j) continue;

          if (
            hasAspect(planets[i], planets[k], 150, maxOrb) &&
            hasAspect(planets[j], planets[k], 150, maxOrb)
          ) {
            const apex = pointToPlanetPosition(planets[k], houseCusps);
            const base1 = pointToPlanetPosition(planets[i], houseCusps);
            const base2 = pointToPlanetPosition(planets[j], houseCusps);

            const orb1 = calculateOrb(planets[i], planets[j], 60);
            const orb2 = calculateOrb(planets[i], planets[k], 150);
            const orb3 = calculateOrb(planets[j], planets[k], 150);
            const averageOrb = (orb1 + orb2 + orb3) / 3;

            patterns.push({
              type: 'Yod',
              apex,
              base: [base1, base2],
              averageOrb,
            });
          }
        }
      }
    }
  }

  return patterns;
}

/**
 * Detect Mystic Rectangle patterns (two oppositions with sextiles and trines)
 */
function detectMysticRectangles(
  planets: Point[],
  houseCusps?: number[],
  maxOrb = 8
): MysticRectangle[] {
  const patterns: MysticRectangle[] = [];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      for (let k = j + 1; k < planets.length; k++) {
        for (let l = k + 1; l < planets.length; l++) {
          // Check for two oppositions and appropriate sextiles/trines
          const combinations = [
            {
              oppositions: [
                [i, j],
                [k, l],
              ],
              sextiles: [
                [i, k],
                [i, l],
                [j, k],
                [j, l],
              ],
            },
            {
              oppositions: [
                [i, k],
                [j, l],
              ],
              sextiles: [
                [i, j],
                [i, l],
                [k, j],
                [k, l],
              ],
            },
            {
              oppositions: [
                [i, l],
                [j, k],
              ],
              sextiles: [
                [i, j],
                [i, k],
                [l, j],
                [l, k],
              ],
            },
          ];

          for (const combo of combinations) {
            let validOppositions = 0;
            let validSextiles = 0;

            combo.oppositions.forEach(([a, b]) => {
              if (hasAspect(planets[a], planets[b], 180, maxOrb)) {
                validOppositions++;
              }
            });

            combo.sextiles.forEach(([a, b]) => {
              if (
                hasAspect(planets[a], planets[b], 60, maxOrb) ||
                hasAspect(planets[a], planets[b], 120, maxOrb)
              ) {
                validSextiles++;
              }
            });

            if (validOppositions === 2 && validSextiles === 4) {
              const pos1 = pointToPlanetPosition(
                planets[combo.oppositions[0][0]],
                houseCusps
              );
              const pos2 = pointToPlanetPosition(
                planets[combo.oppositions[0][1]],
                houseCusps
              );
              const pos3 = pointToPlanetPosition(
                planets[combo.oppositions[1][0]],
                houseCusps
              );
              const pos4 = pointToPlanetPosition(
                planets[combo.oppositions[1][1]],
                houseCusps
              );

              // Calculate average orb
              let totalOrb = 0;
              let aspectCount = 0;

              combo.oppositions.forEach(([a, b]) => {
                totalOrb += calculateOrb(planets[a], planets[b], 180);
                aspectCount++;
              });

              combo.sextiles.forEach(([a, b]) => {
                const sextileOrb = calculateOrb(planets[a], planets[b], 60);
                const trineOrb = calculateOrb(planets[a], planets[b], 120);
                totalOrb += Math.min(sextileOrb, trineOrb);
                aspectCount++;
              });

              const averageOrb = totalOrb / aspectCount;

              patterns.push({
                type: 'Mystic Rectangle',
                oppositions: [
                  [pos1, pos2],
                  [pos3, pos4],
                ],
                averageOrb,
              });
            }
          }
        }
      }
    }
  }

  return patterns;
}

/**
 * Detect Kite patterns (Grand Trine with one opposition)
 */
function detectKites(
  planets: Point[],
  houseCusps?: number[],
  maxOrb = 8
): Kite[] {
  const patterns: Kite[] = [];
  const grandTrines = detectGrandTrines(planets, houseCusps, maxOrb);

  grandTrines.forEach((grandTrine) => {
    // For each planet in the grand trine, look for opposition to another planet
    grandTrine.planets.forEach((trinePoint) => {
      planets.forEach((planet) => {
        const isPartOfTrine = grandTrine.planets.some(
          (tp) => tp.name === planet.name
        );
        if (!isPartOfTrine) {
          const trinePointOriginal = planets.find(
            (p) => p.name === trinePoint.name
          );
          if (
            trinePointOriginal &&
            hasAspect(trinePointOriginal, planet, 180, maxOrb)
          ) {
            const oppositionPlanet = pointToPlanetPosition(planet, houseCusps);
            const orbToOpposition = calculateOrb(
              trinePointOriginal,
              planet,
              180
            );
            const averageOrb = (grandTrine.averageOrb + orbToOpposition) / 2;

            patterns.push({
              type: 'Kite',
              grandTrine: grandTrine.planets,
              opposition: oppositionPlanet,
              averageOrb,
            });
          }
        }
      });
    });
  });

  return patterns;
}

/**
 * Main function to detect all aspect patterns
 */
export function detectAspectPatterns(
  planets: Point[],
  houseCusps?: number[]
): AspectPattern[] {
  const patterns: AspectPattern[] = [];

  patterns.push(...detectTSquares(planets, houseCusps));
  patterns.push(...detectGrandTrines(planets, houseCusps));
  patterns.push(...detectStelliums(planets, houseCusps));
  patterns.push(...detectGrandCrosses(planets, houseCusps));
  patterns.push(...detectYods(planets, houseCusps));
  patterns.push(...detectMysticRectangles(planets, houseCusps));
  patterns.push(...detectKites(planets, houseCusps));

  return patterns;
}
