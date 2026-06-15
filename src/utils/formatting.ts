import { Point, PlanetPosition } from '../types';
import { getDegreeSign, normalizeDegree } from '../core/astrology';

const MINUTES_PER_DEGREE = 60;
const MINUTES_PER_SIGN = 30 * MINUTES_PER_DEGREE;
// 1e-9 degree-minutes ≈ 3.6 microarcseconds — far below the resolution of any
// astronomical ephemeris, but large enough to absorb double-precision % 30
// rounding error at exact minute boundaries (e.g. 200 + 1/60).
const MINUTE_FLOOR_EPSILON = 1e-9;

/**
 * Converts a number to its ordinal form (1st, 2nd, 3rd, etc.)
 * @param num The number to convert
 * @returns The ordinal string
 */
export function getOrdinal(num: number): string {
  const suffix = ['th', 'st', 'nd', 'rd'];
  const v = num % 100;
  return num + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
}

/**
 * Formats a degree-in-sign value as "DD°MM'" with truncated arcminutes.
 * E.g. 15.3833 -> "15°22'", 0.5 -> "0°30'".
 * Minutes are zero-padded for stable column widths.
 * A tiny epsilon prevents exact minute boundaries from underflowing due to
 * floating-point representation after modulo arithmetic.
 * @param degreeInSign Position within the sign (0-30).
 * @returns Formatted "DD°MM'" string.
 */
export function formatDegMin(degreeInSign: number): string {
  if (!isFinite(degreeInSign)) {
    throw new Error(`Invalid degree-in-sign value: ${degreeInSign}`);
  }

  let normalizedDegreeInSign = degreeInSign % 30;
  if (normalizedDegreeInSign < 0) {
    normalizedDegreeInSign += 30;
  }

  const totalMinutes = Math.min(
    Math.floor(
      normalizedDegreeInSign * MINUTES_PER_DEGREE + MINUTE_FLOOR_EPSILON
    ),
    MINUTES_PER_SIGN - 1
  );
  const deg = Math.floor(totalMinutes / MINUTES_PER_DEGREE);
  const min = totalMinutes % MINUTES_PER_DEGREE;
  return `${deg}°${min.toString().padStart(2, '0')}'`;
}

export function getSign(degree: number): string {
  return getDegreeSign(degree);
}

export function getHouse(degree: number, houseCusps: number[]): number {
  for (let i = 0; i < 12; i++) {
    const cusp1 = houseCusps[i];
    const cusp2 = houseCusps[(i + 1) % 12];
    if (cusp1 < cusp2) {
      if (degree >= cusp1 && degree < cusp2) {
        return i + 1;
      }
    } else {
      if (degree >= cusp1 || degree < cusp2) {
        return i + 1;
      }
    }
  }
  return -1; // Should not happen
}

export function getPlanetPositions(
  planets: Point[],
  houseCusps?: number[]
): PlanetPosition[] {
  return planets.map((planet) => {
    const normalizedDegree = normalizeDegree(planet.degree);
    const position: PlanetPosition = {
      name: planet.name,
      degree: normalizedDegree,
      sign: getSign(normalizedDegree),
      speed: planet.speed,
    };
    if (houseCusps) {
      position.house = getHouse(normalizedDegree, houseCusps);
    }
    return position;
  });
}
