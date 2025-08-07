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
  UnionedPoint,
} from '../types';
import { getDegreeSign } from './astrology';

/**
 * Create a lookup map for aspect relationships between planets
 */
function createAspectLookup(
  aspects: AspectData[]
): Map<string, Map<string, AspectData>> {
  const lookup = new Map<string, Map<string, AspectData>>();

  const getKey = (planetName: string, chartName?: string): string => {
    return chartName ? `${planetName}-${chartName}` : planetName;
  };

  aspects.forEach((aspect) => {
    const keyA = getKey(aspect.planetA, aspect.p1ChartName);
    const keyB = getKey(aspect.planetB, aspect.p2ChartName);

    if (!lookup.has(keyA)) {
      lookup.set(keyA, new Map());
    }
    if (!lookup.has(keyB)) {
      lookup.set(keyB, new Map());
    }

    lookup.get(keyA)!.set(keyB, aspect);
    lookup.get(keyB)!.set(keyA, aspect);
  });

  return lookup;
}

/**
 * Convert Point to PlanetPosition for aspect patterns
 * Note: House information is optional for aspect patterns (except stelliums which are handled separately)
 */
function pointToPlanetPosition(
  point: Point,
  houseCusps?: number[],
  chartName?: string
): PlanetPosition {
  const sign = getDegreeSign(point.degree);
  // For multi-chart patterns, house information may not be meaningful
  // Only calculate house if houseCusps are provided and we're dealing with a single-chart context
  const house =
    houseCusps && houseCusps.length === 12
      ? (() => {
          // Simple house calculation without importing the utility
          const normalizedDegree = point.degree % 360;
          for (let i = 0; i < 12; i++) {
            const currentCusp = houseCusps[i];
            const nextCusp = houseCusps[(i + 1) % 12];

            if (nextCusp > currentCusp) {
              // Normal case: house doesn't cross 0°
              if (
                normalizedDegree >= currentCusp &&
                normalizedDegree < nextCusp
              ) {
                return i + 1;
              }
            } else {
              // House crosses 0° (e.g., 350° to 20°)
              if (
                normalizedDegree >= currentCusp ||
                normalizedDegree < nextCusp
              ) {
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
    chartName,
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
  p1: UnionedPoint,
  p2: UnionedPoint,
  aspectType: string,
  aspectLookup: Map<string, Map<string, AspectData>>
): boolean {
  const getKey = (planetName: string, chartName?: string): string =>
    chartName ? `${planetName}-${chartName}` : planetName;
  const key1 = getKey(p1[0].name, p1[1].name);
  const key2 = getKey(p2[0].name, p2[1].name);

  const planet1Aspects = aspectLookup.get(key1);
  if (!planet1Aspects) return false;

  const aspectData = planet1Aspects.get(key2);
  return aspectData !== undefined && aspectData.aspectType === aspectType;
}

/**
 * Get aspect data between two planets if it exists
 */
function getAspectBetween(
  p1: UnionedPoint,
  p2: UnionedPoint,
  aspectLookup: Map<string, Map<string, AspectData>>
): AspectData | undefined {
  const getKey = (planetName: string, chartName?: string): string =>
    chartName ? `${planetName}-${chartName}` : planetName;
  const key1 = getKey(p1[0].name, p1[1].name);
  const key2 = getKey(p2[0].name, p2[1].name);

  const planet1Aspects = aspectLookup.get(key1);
  if (!planet1Aspects) return undefined;

  return planet1Aspects.get(key2);
}

/**
 * Detect T-Square patterns
 */
function detectTSquares(
  unionedPoints: UnionedPoint[],
  aspectLookup: Map<string, Map<string, AspectData>>,
  houseCusps?: number[]
): TSquare[] {
  const patterns: TSquare[] = [];

  for (let i = 0; i < unionedPoints.length; i++) {
    for (let j = i + 1; j < unionedPoints.length; j++) {
      // Check for opposition
      if (
        hasSpecificAspect(unionedPoints[i], unionedPoints[j], 'opposition', aspectLookup)
      ) {
        // Look for a third planet that squares both
        for (let k = 0; k < unionedPoints.length; k++) {
          if (k === i || k === j) continue;

          if (
            hasSpecificAspect(
              unionedPoints[i],
              unionedPoints[k],
              'square',
              aspectLookup
            ) &&
            hasSpecificAspect(
              unionedPoints[j],
              unionedPoints[k],
              'square',
              aspectLookup
            )
          ) {
            const [pApex, cApex] = unionedPoints[k];
            const [pOpp1, cOpp1] = unionedPoints[i];
            const [pOpp2, cOpp2] = unionedPoints[j];

            const apex = pointToPlanetPosition(pApex, houseCusps, cApex.name);
            const opp1 = pointToPlanetPosition(pOpp1, houseCusps, cOpp1.name);
            const opp2 = pointToPlanetPosition(pOpp2, houseCusps, cOpp2.name);

            // Get actual orbs from pre-calculated aspects
            const oppAspect = getAspectBetween(
              unionedPoints[i],
              unionedPoints[j],
              aspectLookup
            )!;
            const square1Aspect = getAspectBetween(
              unionedPoints[i],
              unionedPoints[k],
              aspectLookup
            )!;
            const square2Aspect = getAspectBetween(
              unionedPoints[j],
              unionedPoints[k],
              aspectLookup
            )!;
            const averageOrb =
              (oppAspect.orb + square1Aspect.orb + square2Aspect.orb) / 3;

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
  unionedPoints: UnionedPoint[],
  aspectLookup: Map<string, Map<string, AspectData>>,
  houseCusps?: number[]
): GrandTrine[] {
  const patterns: GrandTrine[] = [];

  for (let i = 0; i < unionedPoints.length; i++) {
    for (let j = i + 1; j < unionedPoints.length; j++) {
      for (let k = j + 1; k < unionedPoints.length; k++) {
        // Check if all three planets form trines with each other
        if (
          hasSpecificAspect(
            unionedPoints[i],
            unionedPoints[j],
            'trine',
            aspectLookup
          ) &&
          hasSpecificAspect(
            unionedPoints[j],
            unionedPoints[k],
            'trine',
            aspectLookup
          ) &&
          hasSpecificAspect(
            unionedPoints[k],
            unionedPoints[i],
            'trine',
            aspectLookup
          )
        ) {
          const [p1, c1] = unionedPoints[i];
          const [p2, c2] = unionedPoints[j];
          const [p3, c3] = unionedPoints[k];

          const planet1 = pointToPlanetPosition(p1, houseCusps, c1.name);
          const planet2 = pointToPlanetPosition(p2, houseCusps, c2.name);
          const planet3 = pointToPlanetPosition(p3, houseCusps, c3.name);

          // Get actual orbs from pre-calculated aspects
          const trine1Aspect = getAspectBetween(
            unionedPoints[i],
            unionedPoints[j],
            aspectLookup
          )!;
          const trine2Aspect = getAspectBetween(
            unionedPoints[j],
            unionedPoints[k],
            aspectLookup
          )!;
          const trine3Aspect = getAspectBetween(
            unionedPoints[k],
            unionedPoints[i],
            aspectLookup
          )!;
          const averageOrb =
            (trine1Aspect.orb + trine2Aspect.orb + trine3Aspect.orb) / 3;

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
  unionedPoints: UnionedPoint[],
  aspectLookup: Map<string, Map<string, AspectData>>,
  houseCusps?: number[]
): GrandCross[] {
  const patterns: GrandCross[] = [];

  for (let i = 0; i < unionedPoints.length; i++) {
    for (let j = i + 1; j < unionedPoints.length; j++) {
      for (let k = j + 1; k < unionedPoints.length; k++) {
        for (let l = k + 1; l < unionedPoints.length; l++) {
          const group = [
            unionedPoints[i],
            unionedPoints[j],
            unionedPoints[k],
            unionedPoints[l],
          ];
          // Check if planets form two oppositions and four squares
          const pairs = [
            [0, 1],
            [2, 3],
          ];
          const otherPairs = [
            [0, 2],
            [1, 3],
            [0, 3],
            [1, 2],
          ];

          // Check for two oppositions
          let oppositions = 0;
          let squares = 0;
          const aspectData: AspectData[] = [];

          pairs.forEach(([a, b]) => {
            if (
              hasSpecificAspect(group[a], group[b], 'opposition', aspectLookup)
            ) {
              oppositions++;
              aspectData.push(getAspectBetween(group[a], group[b], aspectLookup)!);
            }
          });

          otherPairs.forEach(([a, b]) => {
            if (hasSpecificAspect(group[a], group[b], 'square', aspectLookup)) {
              squares++;
              aspectData.push(getAspectBetween(group[a], group[b], aspectLookup)!);
            }
          });

          if (oppositions === 2 && squares === 4) {
            const [p1, c1] = group[0];
            const [p2, c2] = group[1];
            const [p3, c3] = group[2];
            const [p4, c4] = group[3];
            const planet1 = pointToPlanetPosition(p1, houseCusps, c1.name);
            const planet2 = pointToPlanetPosition(p2, houseCusps, c2.name);
            const planet3 = pointToPlanetPosition(p3, houseCusps, c3.name);
            const planet4 = pointToPlanetPosition(p4, houseCusps, c4.name);

            // Calculate average orb from actual aspect data
            const totalOrb = aspectData.reduce(
              (sum, aspect) => sum + aspect.orb,
              0
            );
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
  unionedPoints: UnionedPoint[],
  aspectLookup: Map<string, Map<string, AspectData>>,
  houseCusps?: number[]
): Yod[] {
  const patterns: Yod[] = [];

  for (let i = 0; i < unionedPoints.length; i++) {
    for (let j = i + 1; j < unionedPoints.length; j++) {
      // Check for sextile between base planets
      if (
        hasSpecificAspect(unionedPoints[i], unionedPoints[j], 'sextile', aspectLookup)
      ) {
        // Look for apex planet that forms quincunxes with both
        for (let k = 0; k < unionedPoints.length; k++) {
          if (k === i || k === j) continue;

          if (
            hasSpecificAspect(
              unionedPoints[i],
              unionedPoints[k],
              'quincunx',
              aspectLookup
            ) &&
            hasSpecificAspect(
              unionedPoints[j],
              unionedPoints[k],
              'quincunx',
              aspectLookup
            )
          ) {
            const [pApex, cApex] = unionedPoints[k];
            const [pBase1, cBase1] = unionedPoints[i];
            const [pBase2, cBase2] = unionedPoints[j];
            const apex = pointToPlanetPosition(pApex, houseCusps, cApex.name);
            const base1 = pointToPlanetPosition(pBase1, houseCusps, cBase1.name);
            const base2 = pointToPlanetPosition(pBase2, houseCusps, cBase2.name);

            // Get actual orbs from pre-calculated aspects
            const sextileAspect = getAspectBetween(
              unionedPoints[i],
              unionedPoints[j],
              aspectLookup
            )!;
            const quincunx1Aspect = getAspectBetween(
              unionedPoints[i],
              unionedPoints[k],
              aspectLookup
            )!;
            const quincunx2Aspect = getAspectBetween(
              unionedPoints[j],
              unionedPoints[k],
              aspectLookup
            )!;
            const averageOrb =
              (sextileAspect.orb + quincunx1Aspect.orb + quincunx2Aspect.orb) /
              3;

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
  unionedPoints: UnionedPoint[],
  aspectLookup: Map<string, Map<string, AspectData>>,
  houseCusps?: number[]
): MysticRectangle[] {
  const patterns: MysticRectangle[] = [];

  for (let i = 0; i < unionedPoints.length; i++) {
    for (let j = i + 1; j < unionedPoints.length; j++) {
      for (let k = j + 1; k < unionedPoints.length; k++) {
        for (let l = k + 1; l < unionedPoints.length; l++) {
          const group = [
            unionedPoints[i],
            unionedPoints[j],
            unionedPoints[k],
            unionedPoints[l],
          ];
          // Check for two oppositions and appropriate sextiles/trines
          const combinations = [
            {
              oppositions: [
                [0, 1],
                [2, 3],
              ],
              sextiles: [
                [0, 2],
                [0, 3],
                [1, 2],
                [1, 3],
              ],
            },
            {
              oppositions: [
                [0, 2],
                [1, 3],
              ],
              sextiles: [
                [0, 1],
                [0, 3],
                [2, 1],
                [2, 3],
              ],
            },
            {
              oppositions: [
                [0, 3],
                [1, 2],
              ],
              sextiles: [
                [0, 1],
                [0, 2],
                [3, 1],
                [3, 2],
              ],
            },
          ];

          for (const combo of combinations) {
            let validOppositions = 0;
            let validSextiles = 0;
            const aspectData: AspectData[] = [];

            combo.oppositions.forEach(([a, b]) => {
              if (
                hasSpecificAspect(group[a], group[b], 'opposition', aspectLookup)
              ) {
                validOppositions++;
                aspectData.push(
                  getAspectBetween(group[a], group[b], aspectLookup)!
                );
              }
            });

            combo.sextiles.forEach(([a, b]) => {
              const sextileAspect = getAspectBetween(
                group[a],
                group[b],
                aspectLookup
              );
              if (
                sextileAspect &&
                (sextileAspect.aspectType === 'sextile' ||
                  sextileAspect.aspectType === 'trine')
              ) {
                validSextiles++;
                aspectData.push(sextileAspect);
              }
            });

            if (validOppositions === 2 && validSextiles === 4) {
              const [p1, c1] = group[combo.oppositions[0][0]];
              const [p2, c2] = group[combo.oppositions[0][1]];
              const [p3, c3] = group[combo.oppositions[1][0]];
              const [p4, c4] = group[combo.oppositions[1][1]];
              const pos1 = pointToPlanetPosition(p1, houseCusps, c1.name);
              const pos2 = pointToPlanetPosition(p2, houseCusps, c2.name);
              const pos3 = pointToPlanetPosition(p3, houseCusps, c3.name);
              const pos4 = pointToPlanetPosition(p4, houseCusps, c4.name);

              // Calculate average orb from actual aspect data
              const totalOrb = aspectData.reduce(
                (sum, aspect) => sum + aspect.orb,
                0
              );
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
  unionedPoints: UnionedPoint[],
  aspectLookup: Map<string, Map<string, AspectData>>,
  houseCusps?: number[]
): Kite[] {
  const patterns: Kite[] = [];
  const grandTrines = detectGrandTrines(
    unionedPoints,
    aspectLookup,
    houseCusps
  );

  grandTrines.forEach((grandTrine) => {
    // For each planet in the grand trine, look for opposition to another planet
    grandTrine.planets.forEach((trinePoint) => {
      unionedPoints.forEach((unionedPoint) => {
        const [planet, chart] = unionedPoint;
        const isPartOfTrine = grandTrine.planets.some(
          (tp) => tp.name === planet.name && tp.chartName === chart.name
        );
        if (!isPartOfTrine) {
          if (
            hasSpecificAspect(
              [
                { name: trinePoint.name, degree: trinePoint.degree },
                { name: trinePoint.chartName!, planets: [] },
              ],
              unionedPoint,
              'opposition',
              aspectLookup
            )
          ) {
            const oppositionPlanet = pointToPlanetPosition(
              planet,
              houseCusps,
              chart.name
            );
            const oppositionAspect = getAspectBetween(
              [
                { name: trinePoint.name, degree: trinePoint.degree },
                { name: trinePoint.chartName!, planets: [] },
              ],
              unionedPoint,
              aspectLookup
            )!;
            const averageOrb =
              (grandTrine.averageOrb + oppositionAspect.orb) / 2;

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
 * @param planets Array of planets to analyze
 * @param aspects Pre-calculated aspects between planets
 * @param houseCusps Optional house cusps for single-chart reference
 * @param planetChartMap Optional mapping from planet name to chart name for multichart ownership context
 */
export function detectAspectPatterns(
  unionedPoints: UnionedPoint[],
  aspects: AspectData[],
  houseCusps?: number[]
): AspectPattern[] {
  const patterns: AspectPattern[] = [];
  const aspectLookup = createAspectLookup(aspects);

  patterns.push(...detectTSquares(unionedPoints, aspectLookup, houseCusps));
  patterns.push(...detectGrandTrines(unionedPoints, aspectLookup, houseCusps));
  patterns.push(...detectGrandCrosses(unionedPoints, aspectLookup, houseCusps));
  patterns.push(...detectYods(unionedPoints, aspectLookup, houseCusps));
  patterns.push(
    ...detectMysticRectangles(unionedPoints, aspectLookup, houseCusps)
  );
  patterns.push(...detectKites(unionedPoints, aspectLookup, houseCusps));

  return patterns;
}
