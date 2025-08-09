import { Point, Aspect, AspectData, UnionedPoint } from '../types';
import { normalizeDegree } from './astrology';
import { isExactAspect, roundDegrees } from '../utils/precision';

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

/**
 * Finds the tightest aspect between two planets using simple orb detection
 * @param aspectDefinitions Array of aspect types to check for
 * @param planetA First planet
 * @param planetB Second planet
 * @param skipOutOfSignAspects Whether to skip aspects that cross sign boundaries
 * @param aspectStrengthThresholds Thresholds for classifying aspect strength
 * @param p1ChartName Optional chart name for planetA
 * @param p2ChartName Optional chart name for planetB
 * @returns The tightest aspect found, or null if none
 */
function findTightestAspect(
  aspectDefinitions: Aspect[],
  planetA: Point,
  planetB: Point,
  skipOutOfSignAspects: boolean,
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
      const expectedSignDiff = getExpectedSignDifference(aspectType.angle);

      let actualSignDiff = Math.abs(planetASign - planetBSign);
      if (actualSignDiff > 6) actualSignDiff = 12 - actualSignDiff;

      if (actualSignDiff !== expectedSignDiff) {
        continue;
      }
    }

    // Use simple orb from aspect definition
    const maxAllowedOrb = aspectType.orb;

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
 * @param aspectStrengthThresholds Thresholds for classifying aspect strength.
 * @param forceChartType Optional override for chart type determination.
 * @returns Array of found aspects.
 */
export function calculateAspects(
  aspectDefinitions: Aspect[],
  unionedPlanets: UnionedPoint[],
  skipOutOfSignAspects = true
): AspectData[] {
  const aspects: AspectData[] = [];
  if (!unionedPlanets || unionedPlanets.length < 2) return aspects;

  for (let i = 0; i < unionedPlanets.length; i++) {
    for (let j = i + 1; j < unionedPlanets.length; j++) {
      const [planetA, chartNameA] = unionedPlanets[i];
      const [planetB, chartNameB] = unionedPlanets[j];

      const aspect = findTightestAspect(
        aspectDefinitions,
        planetA,
        planetB,
        skipOutOfSignAspects,
        chartNameA,
        chartNameB
      );

      if (aspect) {
        aspects.push(aspect);
      }
    }
  }
  return aspects;
}

/**
 * Calculates aspects in a multi-chart context (synastry, transits, etc.)
 * @param aspectDefinitions Array of aspect types to check for
 * @param unionedPlanets Array of UnionedPoint pairs to analyze
 * @param skipOutOfSignAspects Whether to skip aspects that cross sign boundaries
 * @param aspectStrengthThresholds Thresholds for classifying aspect strength
 * @returns Array of found aspects
 */
export function calculateMultichartAspects(
  aspectDefinitions: Aspect[],
  unionedPlanets: UnionedPoint[],
  skipOutOfSignAspects = true
): AspectData[] {
  // Filter to only cross-chart aspects
  const crossChartAspects: AspectData[] = [];

  for (let i = 0; i < unionedPlanets.length; i++) {
    for (let j = i + 1; j < unionedPlanets.length; j++) {
      const [planetA, chartNameA] = unionedPlanets[i];
      const [planetB, chartNameB] = unionedPlanets[j];

      // Only calculate aspects between planets from different charts
      if (chartNameA !== chartNameB) {
        const aspect = findTightestAspect(
          aspectDefinitions,
          planetA,
          planetB,
          skipOutOfSignAspects,
          chartNameA,
          chartNameB
        );

        if (aspect) {
          crossChartAspects.push(aspect);
        }
      }
    }
  }

  return crossChartAspects;
}
