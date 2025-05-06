import { Point, Aspect, AspectData } from '../types';

/**
 * Identifies aspects between planets in a single chart.
 * @param aspectDefinitions Array of aspect types to check for.
 * @param planets Array of planet points.
 * @returns Array of found aspects.
 */
export function calculateAspects(
  aspectDefinitions: Aspect[],
  planets: Point[]
): AspectData[] {
  const aspects: AspectData[] = [];
  if (!planets || planets.length < 2) return aspects;

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planetA = planets[i];
      const planetB = planets[j];
      let diff = Math.abs(planetA.degree - planetB.degree);
      if (diff > 180) diff = 360 - diff;

      // Find the tightest valid aspect
      let tightestAspect: AspectData | null = null;
      for (const aspectType of aspectDefinitions) {
        const orb = Math.abs(diff - aspectType.angle);
        if (orb <= aspectType.orb) {
          if (!tightestAspect || orb < tightestAspect.orb) {
            tightestAspect = {
              planetA: planetA.name,
              planetB: planetB.name,
              aspectType: aspectType.name,
              orb,
            };
          }
        }
      }
      if (tightestAspect) {
        aspects.push(tightestAspect);
      }
    }
  }
  return aspects;
}

/**
 * Identifies aspects between planets across two charts.
 * PlanetA is always from chart1Planets, PlanetB always from chart2Planets.
 * @param aspectDefinitions Array of aspect types to check for.
 * @param chart1Planets Array of planet points for the first chart.
 * @param chart2Planets Array of planet points for the second chart.
 * @returns Array of found aspects.
 */
export function calculateMultichartAspects(
  aspectDefinitions: Aspect[],
  chart1Planets: Point[],
  chart2Planets: Point[]
): AspectData[] {
  const aspects: AspectData[] = [];
  if (
    !chart1Planets ||
    !chart2Planets ||
    chart1Planets.length === 0 ||
    chart2Planets.length === 0
  ) {
    return aspects;
  }

  for (const p1 of chart1Planets) {
    for (const p2 of chart2Planets) {
      let diff = Math.abs(p1.degree - p2.degree);
      if (diff > 180) diff = 360 - diff;

      // Find the tightest valid aspect
      let tightestAspect: AspectData | null = null;
      for (const aspectType of aspectDefinitions) {
        const orb = Math.abs(diff - aspectType.angle);
        if (orb <= aspectType.orb) {
          if (!tightestAspect || orb < tightestAspect.orb) {
            tightestAspect = {
              planetA: p1.name, // From chart1
              planetB: p2.name, // From chart2
              aspectType: aspectType.name,
              orb,
            };
          }
        }
      }
      if (tightestAspect) {
        aspects.push(tightestAspect);
      }
    }
  }
  return aspects;
}
