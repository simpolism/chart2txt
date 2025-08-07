import { Point, Aspect, AspectData, ChartData, UnionedPoint } from '../types';
import { normalizeDegree } from './astrology';
import { isExactAspect, roundDegrees } from '../utils/precision';
import { OrbResolver, OrbResolutionContext } from './orbResolver';

/**
 * Gets the expected sign difference for a given aspect angle
 * @param aspectAngle The aspect angle in degrees
 * @returns The expected sign difference
 */
function getExpectedSignDifference(aspectAngle: number): number {
  // Normalize aspect angle to 0-180 range for sign difference calculation
  const normalizedAngle = aspectAngle <= 180 ? aspectAngle : 360 - aspectAngle;

  // Calculate how many 30-degree signs this aspect spans
  switch (normalizedAngle) {
    case 0:
      return 0; // Conjunction: same sign
    case 30:
      return 1; // Semi-sextile: 1 sign apart
    case 60:
      return 2; // Sextile: 2 signs apart
    case 90:
      return 3; // Square: 3 signs apart
    case 120:
      return 4; // Trine: 4 signs apart
    case 150:
      return 5; // Quincunx: 5 signs apart
    case 180:
      return 6; // Opposition: 6 signs apart
    default:
      // For non-standard aspects, calculate based on 30-degree segments
      return Math.round(normalizedAngle / 30);
  }
}

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

  // Calculate current angular distance (handle wraparound properly)
  const degreeA = normalizeDegree(planetA.degree);
  const degreeB = normalizeDegree(planetB.degree);
  let currentDistance = Math.abs(degreeA - degreeB);
  if (currentDistance > 180) {
    currentDistance = 360 - currentDistance;
  }

  // If very close to exact, consider it exact
  const orbFromExact = Math.abs(currentDistance - aspectAngle);
  if (isExactAspect(orbFromExact)) {
    return 'exact';
  }

  // Calculate relative speed (how fast the angle between planets is changing)
  const relativeSpeed = speedA - speedB;

  if (relativeSpeed === 0) {
    return 'exact'; // Planets moving at same speed
  }

  // Use a small, consistent time increment (e.g., 0.1 days) rather than degree-based increment
  const timeIncrement = 0.1; // days

  // Calculate future positions after the same time period for both planets
  const futureA = normalizeDegree(degreeA + speedA * timeIncrement);
  const futureB = normalizeDegree(degreeB + speedB * timeIncrement);

  // Calculate current and future angular distances for this aspect
  const currentAspectDistance = Math.abs(currentDistance - aspectAngle);

  let futureSeparation = Math.abs(futureA - futureB);
  if (futureSeparation > 180) {
    futureSeparation = 360 - futureSeparation;
  }
  const futureAspectDistance = Math.abs(futureSeparation - aspectAngle);

  // If future distance to exact aspect is smaller, it's applying
  // If future distance to exact aspect is larger, it's separating
  const isApplying = futureAspectDistance < currentAspectDistance;

  return isApplying ? 'applying' : 'separating';
}

function findTightestAspect(
  aspectDefinitions: Aspect[],
  planetA: Point,
  planetB: Point,
  skipOutOfSignAspects: boolean,
  orbResolver?: OrbResolver,
  chartType?: 'natal' | 'synastry' | 'transit' | 'composite',
  p1ChartName?: string,
  p2ChartName?: string
): AspectData | null {
  const degreeA = roundDegrees(normalizeDegree(planetA.degree));
  const degreeB = roundDegrees(normalizeDegree(planetB.degree));
  let diff = Math.abs(degreeA - degreeB);
  if (diff > 180) diff = 360 - diff;

  let tightestAspect: AspectData | null = null;
  for (const aspectType of aspectDefinitions) {
    const orb = roundDegrees(Math.abs(diff - aspectType.angle));

    if (skipOutOfSignAspects) {
      const planetASign = Math.floor(degreeA / 30);
      const planetBSign = Math.floor(degreeB / 30);

      // Calculate expected sign difference for this aspect
      // For major aspects: 0° = 0 signs, 60° = 2 signs, 90° = 3 signs, 120° = 4 signs, 180° = 6 signs
      const expectedSignDiff = getExpectedSignDifference(aspectType.angle);

      let actualSignDiff = Math.abs(planetASign - planetBSign);
      if (actualSignDiff > 6) actualSignDiff = 12 - actualSignDiff;

      if (actualSignDiff !== expectedSignDiff) {
        continue;
      }
    }

    // Determine the maximum allowed orb for this aspect
    let maxAllowedOrb = aspectType.orb; // Default fallback

    if (orbResolver) {
      const context: OrbResolutionContext = {
        chartType: chartType || 'natal',
        planetA,
        planetB,
        aspect: aspectType,
      };
      maxAllowedOrb = orbResolver.resolveOrb(context);
    }

    if (orb <= maxAllowedOrb) {
      if (!tightestAspect || orb < tightestAspect.orb) {
        const application = determineAspectApplication(
          planetA,
          planetB,
          aspectType.angle
        );
        tightestAspect = {
          planetA: planetA.name,
          planetB: planetB.name,
          p1ChartName,
          p2ChartName,
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
 * Unified aspect calculation function that handles both single-chart and multi-chart scenarios
 * @param aspectDefinitions Array of aspect types to check for.
 * @param unionedPlanets Array of UnionedPoint pairs to analyze.
 * @param skipOutOfSignAspects Whether to skip aspects that cross sign boundaries.
 * @param orbResolver Optional orb resolver for advanced orb calculation.
 * @param forceChartType Optional override for chart type determination.
 * @returns Array of found aspects.
 */
export function calculateAspects(
  aspectDefinitions: Aspect[],
  unionedPlanets: UnionedPoint[],
  skipOutOfSignAspects = true,
  orbResolver?: OrbResolver,
  forceChartType?: 'natal' | 'synastry' | 'transit' | 'composite'
): AspectData[] {
  const aspects: AspectData[] = [];
  if (!unionedPlanets || unionedPlanets.length < 2) return aspects;

  for (let i = 0; i < unionedPlanets.length; i++) {
    for (let j = i + 1; j < unionedPlanets.length; j++) {
      const [planetA, chartA] = unionedPlanets[i];
      const [planetB, chartB] = unionedPlanets[j];
      
      // Automatically determine chart type based on whether planets are from same chart
      let chartType: 'natal' | 'synastry' | 'transit' | 'composite';
      if (forceChartType) {
        chartType = forceChartType;
      } else {
        chartType = chartA.name === chartB.name ? 'natal' : 'synastry';
      }

      const aspect = findTightestAspect(
        aspectDefinitions,
        planetA,
        planetB,
        skipOutOfSignAspects,
        orbResolver,
        chartType,
        chartA.name,
        chartB.name
      );
      if (aspect) {
        aspects.push(aspect);
      }
    }
  }
  return aspects;
}

/**
 * Identifies aspects between planets across multiple chart groups.
 * @param aspectDefinitions Array of aspect types to check for.
 * @param chart1Points Array of planet points for the first chart.
 * @param chart2Points Array of planet points for the second chart.
 * @param skipOutOfSignAspects Whether to skip aspects that cross sign boundaries.
 * @param orbResolver Optional orb resolver for advanced orb calculation.
 * @param chartType Type of multi-chart comparison (synastry, transit, etc.).
 * @returns Array of found aspects.
 */
export function calculateMultichartAspects(
  aspectDefinitions: Aspect[],
  chart1Points: UnionedPoint[],
  chart2Points: UnionedPoint[],
  skipOutOfSignAspects = true,
  orbResolver?: OrbResolver,
  chartType: 'synastry' | 'transit' | 'composite' = 'synastry'
): AspectData[] {
  const aspects: AspectData[] = [];

  if (
    !chart1Points ||
    !chart2Points ||
    chart1Points.length === 0 ||
    chart2Points.length === 0
  ) {
    return aspects;
  }

  // Only calculate aspects between planets from different charts
  for (const [p1, c1] of chart1Points) {
    for (const [p2, c2] of chart2Points) {
      const aspect = findTightestAspect(
        aspectDefinitions,
        p1,
        p2,
        skipOutOfSignAspects,
        orbResolver,
        chartType,
        c1.name,
        c2.name
      );
      if (aspect) {
        aspects.push(aspect);
      }
    }
  }
  return aspects;
}
