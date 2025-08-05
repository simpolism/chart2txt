import { Point, Aspect, AspectData } from '../types';

/**
 * Determines if an aspect is applying or separating based on planet speeds
 * @param planetA First planet
 * @param planetB Second planet
 * @param aspectAngle The aspect angle (0, 60, 90, 120, 180, etc.)
 * @returns 'applying', 'separating', or 'exact'
 */
function determineAspectApplication(
  planetA: Point,
  planetB: Point,
  aspectAngle: number
): 'applying' | 'separating' | 'exact' {
  // If either planet doesn't have speed data, we can't determine application
  if (planetA.speed === undefined || planetB.speed === undefined) {
    return 'exact';
  }

  const speedA = planetA.speed;
  const speedB = planetB.speed;

  // Calculate current angular distance
  let currentDistance = Math.abs(planetA.degree - planetB.degree);
  if (currentDistance > 180) {
    currentDistance = 360 - currentDistance;
  }

  // If very close to exact (within 0.1°), consider it exact
  const orbFromExact = Math.abs(currentDistance - aspectAngle);
  if (orbFromExact < 0.1) {
    return 'exact';
  }

  // Calculate relative speed (how fast the angle between planets is changing)
  const relativeSpeed = speedA - speedB;

  // Determine if the distance to the exact aspect is decreasing (applying) or increasing (separating)
  // This is a simplified calculation - in reality, the geometry is more complex
  const isGettingCloser =
    relativeSpeed !== 0 &&
    ((currentDistance < aspectAngle && relativeSpeed > 0) ||
      (currentDistance > aspectAngle && relativeSpeed < 0));

  return isGettingCloser ? 'applying' : 'separating';
}

function findTightestAspect(
  aspectDefinitions: Aspect[],
  planetA: Point,
  planetB: Point,
  skipOutOfSignAspects: boolean
): AspectData | null {
  let diff = Math.abs(planetA.degree - planetB.degree);
  if (diff > 180) diff = 360 - diff;

  let tightestAspect: AspectData | null = null;
  for (const aspectType of aspectDefinitions) {
    const orb = Math.abs(diff - aspectType.angle);

    if (skipOutOfSignAspects) {
      const planetASign = Math.floor(planetA.degree / 30);
      const planetBSign = Math.floor(planetB.degree / 30);
      const aspectSignDiff = Math.floor(aspectType.angle / 30);
      let signDiff = Math.abs(planetASign - planetBSign);
      if (signDiff > 6) signDiff = 12 - signDiff;
      if (signDiff !== aspectSignDiff) {
        continue;
      }
    }

    if (orb <= aspectType.orb) {
      if (!tightestAspect || orb < tightestAspect.orb) {
        const application = determineAspectApplication(
          planetA,
          planetB,
          aspectType.angle
        );
        tightestAspect = {
          planetA: planetA.name,
          planetB: planetB.name,
          aspectType: aspectType.name,
          orb,
          application,
        };
      }
    }
  }
  return tightestAspect;
}

/**
 * Identifies aspects between planets in a single chart.
 * @param aspectDefinitions Array of aspect types to check for.
 * @param planets Array of planet points.
 * @returns Array of found aspects.
 */
export function calculateAspects(
  aspectDefinitions: Aspect[],
  planets: Point[],
  skipOutOfSignAspects = true
): AspectData[] {
  const aspects: AspectData[] = [];
  if (!planets || planets.length < 2) return aspects;

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planetA = planets[i];
      const planetB = planets[j];
      const aspect = findTightestAspect(
        aspectDefinitions,
        planetA,
        planetB,
        skipOutOfSignAspects
      );
      if (aspect) {
        aspects.push(aspect);
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
  chart2Planets: Point[],
  skipOutOfSignAspects = true
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
      const aspect = findTightestAspect(
        aspectDefinitions,
        p1,
        p2,
        skipOutOfSignAspects
      );
      if (aspect) {
        aspects.push(aspect);
      }
    }
  }
  return aspects;
}
