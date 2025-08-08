import { Point, PlanetPosition } from '../types';
import { ZODIAC_SIGNS } from '../constants';

function normalizeDegree(degree: number): number {
  return (degree % 360 + 360) % 360;
}

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

export function getSign(degree: number): string {
  const signIndex = Math.floor(degree / 30);
  return ZODIAC_SIGNS[signIndex];
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

export function getPlanetPositions(planets: Point[], houseCusps?: number[]): PlanetPosition[] {
    return planets.map(planet => {
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
