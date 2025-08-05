import { normalizeDegree } from '../core/astrology';
import { isOnCusp, roundDegrees } from './precision';

/**
 * Validates house cusps array for correctness
 * @param houseCusps Array of 12 house cusp degrees
 * @returns True if valid, false otherwise
 */
export function validateHouseCusps(houseCusps: number[] | undefined): boolean {
  if (!houseCusps || houseCusps.length !== 12) {
    return false;
  }

  // Check that all cusp values are finite numbers
  for (const cusp of houseCusps) {
    if (!isFinite(cusp)) {
      return false;
    }
  }

  return true;
}

/**
 * Determines which house a point falls into based on house cusps
 * @param pointDegree The degree of the point (will be normalized)
 * @param houseCusps Array of 12 house cusp degrees
 * @returns House number (1-12) or null if calculation fails
 */
export function getHouseForPoint(
  pointDegree: number,
  houseCusps: number[] | undefined
): number | null {
  if (!validateHouseCusps(houseCusps)) {
    return null;
  }

  if (!isFinite(pointDegree)) {
    return null;
  }

  const normalizedPoint = roundDegrees(normalizeDegree(pointDegree));
  const normalizedCusps = houseCusps!.map((cusp) =>
    roundDegrees(normalizeDegree(cusp))
  );

  // Check if point is exactly on any cusp (within precision tolerance)
  for (let i = 0; i < 12; i++) {
    if (isOnCusp(normalizedPoint, normalizedCusps[i])) {
      // Point is exactly on cusp - assign to the house that starts at this cusp
      return i + 1;
    }
  }

  for (let i = 0; i < 12; i++) {
    const cuspStart = normalizedCusps[i];
    const cuspEnd = normalizedCusps[(i + 1) % 12];

    if (cuspStart < cuspEnd) {
      // Normal case: cusp doesn't cross 0° boundary
      if (normalizedPoint > cuspStart && normalizedPoint < cuspEnd) {
        return i + 1;
      }
    } else {
      // Wraparound case: cusp crosses 0°/360° boundary
      if (normalizedPoint > cuspStart || normalizedPoint < cuspEnd) {
        return i + 1;
      }
    }
  }

  // This should never happen if cusps properly cover 360 degrees
  console.warn(`Point at ${normalizedPoint}° does not fall in any house`);
  return null;
}
