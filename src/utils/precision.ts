/**
 * Floating point precision utilities for astrological calculations
 */

// Default epsilon for floating-point comparisons (about 0.0036 arc-minutes)
export const DEFAULT_EPSILON = 1e-4;

/**
 * Compares two floating-point numbers with epsilon tolerance
 * @param a First number
 * @param b Second number
 * @param epsilon Tolerance value (default: DEFAULT_EPSILON)
 * @returns True if numbers are equal within tolerance
 */
export function floatEquals(
  a: number,
  b: number,
  epsilon: number = DEFAULT_EPSILON
): boolean {
  return Math.abs(a - b) < epsilon;
}

/**
 * Checks if a number is close to zero within epsilon tolerance
 * @param value The number to check
 * @param epsilon Tolerance value (default: DEFAULT_EPSILON)
 * @returns True if number is close to zero
 */
export function isNearZero(
  value: number,
  epsilon: number = DEFAULT_EPSILON
): boolean {
  return Math.abs(value) < epsilon;
}

/**
 * Rounds a degree value to a reasonable precision (4 decimal places)
 * This prevents accumulation of floating-point errors in calculations
 * @param degrees The degree value to round
 * @returns Rounded degree value
 */
export function roundDegrees(degrees: number): number {
  return Math.round(degrees * 10000) / 10000;
}

/**
 * Compares two degree values with appropriate epsilon for astrological calculations
 * @param deg1 First degree value
 * @param deg2 Second degree value
 * @param epsilon Tolerance in degrees (default: 0.0001°)
 * @returns True if degrees are equal within tolerance
 */
export function degreeEquals(
  deg1: number,
  deg2: number,
  epsilon: number = DEFAULT_EPSILON
): boolean {
  return floatEquals(deg1, deg2, epsilon);
}

/**
 * Checks if a planet is exactly on a house cusp within floating-point precision
 * @param planetDegree Planet's degree position
 * @param cuspDegree House cusp degree
 * @param epsilon Tolerance in degrees (default: 0.001° = about 3.6 arc-seconds)
 * @returns True if planet is on the cusp within tolerance
 */
export function isOnCusp(
  planetDegree: number,
  cuspDegree: number,
  epsilon = 0.001
): boolean {
  return degreeEquals(planetDegree, cuspDegree, epsilon);
}

/**
 * Checks if an aspect is exact within floating-point precision
 * @param actualOrb The actual orb of the aspect
 * @param epsilon Tolerance in degrees (default: 0.1° = 6 arc-minutes)
 * @returns True if aspect is exact within tolerance
 */
export function isExactAspect(
  actualOrb: number,
  epsilon = 0.1
): boolean {
  return isNearZero(actualOrb, epsilon);
}
