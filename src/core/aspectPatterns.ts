import {
  Point,
  AspectData,
  AspectPattern,
  PlanetPosition,
  TSquare,
  GrandTrine,
  GrandCross,
  Yod,
  MysticRectangle,
  Kite,
} from '../types';
import { getDegreeSign } from './astrology';


/**
 * Create a lookup map for aspect relationships between planets
 */
function createAspectLookup(aspects: AspectData[]): Map<string, Map<string, AspectData>> {
  const lookup = new Map<string, Map<string, AspectData>>();
  
  aspects.forEach(aspect => {
    // Create bidirectional lookup (planetA -> planetB and planetB -> planetA)
    if (!lookup.has(aspect.planetA)) {
      lookup.set(aspect.planetA, new Map());
    }
    if (!lookup.has(aspect.planetB)) {
      lookup.set(aspect.planetB, new Map());
    }
    
    lookup.get(aspect.planetA)!.set(aspect.planetB, aspect);
    lookup.get(aspect.planetB)!.set(aspect.planetA, aspect);
  });
  
  return lookup;
}

/**
 * Convert Point to PlanetPosition for aspect patterns
 * Note: House information is optional for aspect patterns (except stelliums which are handled separately)
 */
function pointToPlanetPosition(
  point: Point,
  houseCusps?: number[]
): PlanetPosition {
  const sign = getDegreeSign(point.degree);
  // For multi-chart patterns, house information may not be meaningful
  // Only calculate house if houseCusps are provided and we're dealing with a single-chart context
  const house = houseCusps && houseCusps.length === 12
    ? (() => {
        // Simple house calculation without importing the utility
        const normalizedDegree = point.degree % 360;
        for (let i = 0; i < 12; i++) {
          const currentCusp = houseCusps[i];
          const nextCusp = houseCusps[(i + 1) % 12];
          
          if (nextCusp > currentCusp) {
            // Normal case: house doesn't cross 0°
            if (normalizedDegree >= currentCusp && normalizedDegree < nextCusp) {
              return i + 1;
            }
          } else {
            // House crosses 0° (e.g., 350° to 20°)
            if (normalizedDegree >= currentCusp || normalizedDegree < nextCusp) {
              return i + 1;
            }
          }
        }
        return undefined;
      })()
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

  if (fire.includes(sign)) return 'Fire';
  if (earth.includes(sign)) return 'Earth';
  if (air.includes(sign)) return 'Air';
  return 'Water';
}

/**
 * Check if two planets have a specific aspect type using the pre-calculated aspects
 */
function hasSpecificAspect(
  planet1Name: string,
  planet2Name: string,
  aspectType: string,
  aspectLookup: Map<string, Map<string, AspectData>>
): boolean {
  const planet1Aspects = aspectLookup.get(planet1Name);
  if (!planet1Aspects) return false;
  
  const aspectData = planet1Aspects.get(planet2Name);
  return aspectData !== undefined && aspectData.aspectType === aspectType;
}

/**
 * Get aspect data between two planets if it exists
 */
function getAspectBetween(
  planet1Name: string,
  planet2Name: string,
  aspectLookup: Map<string, Map<string, AspectData>>
): AspectData | undefined {
  const planet1Aspects = aspectLookup.get(planet1Name);
  if (!planet1Aspects) return undefined;
  
  return planet1Aspects.get(planet2Name);
}

/**
 * Detect T-Square patterns
 */
function detectTSquares(
  planets: Point[],
  aspectLookup: Map<string, Map<string, AspectData>>,
  houseCusps?: number[]
): TSquare[] {
  const patterns: TSquare[] = [];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      // Check for opposition
      if (hasSpecificAspect(planets[i].name, planets[j].name, 'opposition', aspectLookup)) {
        // Look for a third planet that squares both
        for (let k = 0; k < planets.length; k++) {
          if (k === i || k === j) continue;

          if (
            hasSpecificAspect(planets[i].name, planets[k].name, 'square', aspectLookup) &&
            hasSpecificAspect(planets[j].name, planets[k].name, 'square', aspectLookup)
          ) {
            const apex = pointToPlanetPosition(planets[k], houseCusps);
            const opp1 = pointToPlanetPosition(planets[i], houseCusps);
            const opp2 = pointToPlanetPosition(planets[j], houseCusps);

            // Get actual orbs from pre-calculated aspects
            const oppAspect = getAspectBetween(planets[i].name, planets[j].name, aspectLookup)!;
            const square1Aspect = getAspectBetween(planets[i].name, planets[k].name, aspectLookup)!;
            const square2Aspect = getAspectBetween(planets[j].name, planets[k].name, aspectLookup)!;
            const averageOrb = (oppAspect.orb + square1Aspect.orb + square2Aspect.orb) / 3;

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
  aspectLookup: Map<string, Map<string, AspectData>>,
  houseCusps?: number[]
): GrandTrine[] {
  const patterns: GrandTrine[] = [];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      for (let k = j + 1; k < planets.length; k++) {
        // Check if all three planets form trines with each other
        if (
          hasSpecificAspect(planets[i].name, planets[j].name, 'trine', aspectLookup) &&
          hasSpecificAspect(planets[j].name, planets[k].name, 'trine', aspectLookup) &&
          hasSpecificAspect(planets[k].name, planets[i].name, 'trine', aspectLookup)
        ) {
          const planet1 = pointToPlanetPosition(planets[i], houseCusps);
          const planet2 = pointToPlanetPosition(planets[j], houseCusps);
          const planet3 = pointToPlanetPosition(planets[k], houseCusps);

          // Get actual orbs from pre-calculated aspects
          const trine1Aspect = getAspectBetween(planets[i].name, planets[j].name, aspectLookup)!;
          const trine2Aspect = getAspectBetween(planets[j].name, planets[k].name, aspectLookup)!;
          const trine3Aspect = getAspectBetween(planets[k].name, planets[i].name, aspectLookup)!;
          const averageOrb = (trine1Aspect.orb + trine2Aspect.orb + trine3Aspect.orb) / 3;

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
 * Detect Grand Cross patterns
 */
function detectGrandCrosses(
  planets: Point[],
  aspectLookup: Map<string, Map<string, AspectData>>,
  houseCusps?: number[]
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
          const aspectData: AspectData[] = [];

          pairs.forEach(([a, b]) => {
            if (hasSpecificAspect(planets[a].name, planets[b].name, 'opposition', aspectLookup)) {
              oppositions++;
              aspectData.push(getAspectBetween(planets[a].name, planets[b].name, aspectLookup)!);
            }
          });

          otherPairs.forEach(([a, b]) => {
            if (hasSpecificAspect(planets[a].name, planets[b].name, 'square', aspectLookup)) {
              squares++;
              aspectData.push(getAspectBetween(planets[a].name, planets[b].name, aspectLookup)!);
            }
          });

          if (oppositions === 2 && squares === 4) {
            const planet1 = pointToPlanetPosition(planets[i], houseCusps);
            const planet2 = pointToPlanetPosition(planets[j], houseCusps);
            const planet3 = pointToPlanetPosition(planets[k], houseCusps);
            const planet4 = pointToPlanetPosition(planets[l], houseCusps);

            // Calculate average orb from actual aspect data
            const totalOrb = aspectData.reduce((sum, aspect) => sum + aspect.orb, 0);
            const averageOrb = totalOrb / aspectData.length;
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
  aspectLookup: Map<string, Map<string, AspectData>>,
  houseCusps?: number[]
): Yod[] {
  const patterns: Yod[] = [];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      // Check for sextile between base planets
      if (hasSpecificAspect(planets[i].name, planets[j].name, 'sextile', aspectLookup)) {
        // Look for apex planet that forms quincunxes with both
        for (let k = 0; k < planets.length; k++) {
          if (k === i || k === j) continue;

          if (
            hasSpecificAspect(planets[i].name, planets[k].name, 'quincunx', aspectLookup) &&
            hasSpecificAspect(planets[j].name, planets[k].name, 'quincunx', aspectLookup)
          ) {
            const apex = pointToPlanetPosition(planets[k], houseCusps);
            const base1 = pointToPlanetPosition(planets[i], houseCusps);
            const base2 = pointToPlanetPosition(planets[j], houseCusps);

            // Get actual orbs from pre-calculated aspects
            const sextileAspect = getAspectBetween(planets[i].name, planets[j].name, aspectLookup)!;
            const quincunx1Aspect = getAspectBetween(planets[i].name, planets[k].name, aspectLookup)!;
            const quincunx2Aspect = getAspectBetween(planets[j].name, planets[k].name, aspectLookup)!;
            const averageOrb = (sextileAspect.orb + quincunx1Aspect.orb + quincunx2Aspect.orb) / 3;

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
  aspectLookup: Map<string, Map<string, AspectData>>,
  houseCusps?: number[]
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
            const aspectData: AspectData[] = [];

            combo.oppositions.forEach(([a, b]) => {
              if (hasSpecificAspect(planets[a].name, planets[b].name, 'opposition', aspectLookup)) {
                validOppositions++;
                aspectData.push(getAspectBetween(planets[a].name, planets[b].name, aspectLookup)!);
              }
            });

            combo.sextiles.forEach(([a, b]) => {
              const sextileAspect = getAspectBetween(planets[a].name, planets[b].name, aspectLookup);
              if (sextileAspect && (sextileAspect.aspectType === 'sextile' || sextileAspect.aspectType === 'trine')) {
                validSextiles++;
                aspectData.push(sextileAspect);
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

              // Calculate average orb from actual aspect data
              const totalOrb = aspectData.reduce((sum, aspect) => sum + aspect.orb, 0);
              const averageOrb = totalOrb / aspectData.length;

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
  aspectLookup: Map<string, Map<string, AspectData>>,
  houseCusps?: number[]
): Kite[] {
  const patterns: Kite[] = [];
  const grandTrines = detectGrandTrines(planets, aspectLookup, houseCusps);

  grandTrines.forEach((grandTrine) => {
    // For each planet in the grand trine, look for opposition to another planet
    grandTrine.planets.forEach((trinePoint) => {
      planets.forEach((planet) => {
        const isPartOfTrine = grandTrine.planets.some(
          (tp) => tp.name === planet.name
        );
        if (!isPartOfTrine) {
          if (hasSpecificAspect(trinePoint.name, planet.name, 'opposition', aspectLookup)) {
            const oppositionPlanet = pointToPlanetPosition(planet, houseCusps);
            const oppositionAspect = getAspectBetween(trinePoint.name, planet.name, aspectLookup)!;
            const averageOrb = (grandTrine.averageOrb + oppositionAspect.orb) / 2;

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
 * Main function to detect aspect patterns (excluding stelliums which are handled separately)
 * This function works with both single-chart and multi-chart scenarios
 */
export function detectAspectPatterns(
  planets: Point[],
  aspects: AspectData[],
  houseCusps?: number[]
): AspectPattern[] {
  const patterns: AspectPattern[] = [];
  const aspectLookup = createAspectLookup(aspects);

  patterns.push(...detectTSquares(planets, aspectLookup, houseCusps));
  patterns.push(...detectGrandTrines(planets, aspectLookup, houseCusps));
  patterns.push(...detectGrandCrosses(planets, aspectLookup, houseCusps));
  patterns.push(...detectYods(planets, aspectLookup, houseCusps));
  patterns.push(...detectMysticRectangles(planets, aspectLookup, houseCusps));
  patterns.push(...detectKites(planets, aspectLookup, houseCusps));

  return patterns;
}
