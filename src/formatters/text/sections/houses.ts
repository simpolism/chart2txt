import { Point } from '../../../types';
import { ChartSettings } from '../../../config/ChartSettings';
import { getDegreeSign, formatDegreeConditional, formatZodiacSign, formatPlanetName, formatHouseNumber } from '../../../core/astrology';

function getHouseForPoint(pointDegree: number, houseCusps: number[]): number {
  if (!houseCusps || houseCusps.length !== 12) {
    return 0;
  }

  for (let i = 0; i < 12; i++) {
    const cuspStart = houseCusps[i];
    const cuspEnd = houseCusps[(i + 1) % 12];

    if (cuspStart < cuspEnd) {
      if (pointDegree >= cuspStart && pointDegree < cuspEnd) {
        return i + 1;
      }
    } else {
      if (pointDegree >= cuspStart || pointDegree < cuspEnd) {
        return i + 1;
      }
    }
  }
  return 0;
}

function getDegreesWithinHouse(pointDegree: number, houseCusps: number[], houseNumber: number): number {
  if (!houseCusps || houseCusps.length !== 12 || houseNumber < 1 || houseNumber > 12) {
    return 0;
  }

  const cuspStart = houseCusps[houseNumber - 1];
  let degreeFromCusp: number;

  if (houseNumber === 12) {
    const cuspEnd = houseCusps[0];
    if (cuspStart < cuspEnd) {
      degreeFromCusp = pointDegree >= cuspStart ? pointDegree - cuspStart : (360 - cuspStart) + pointDegree;
    } else {
      degreeFromCusp = pointDegree - cuspStart;
      if (degreeFromCusp < 0) degreeFromCusp += 360;
    }
  } else {
    const cuspEnd = houseCusps[houseNumber];
    if (cuspStart <= cuspEnd) {
      degreeFromCusp = pointDegree - cuspStart;
    } else {
      degreeFromCusp = pointDegree >= cuspStart ? pointDegree - cuspStart : (360 - cuspStart) + pointDegree;
    }
  }

  return degreeFromCusp;
}

/**
 * Generates the [HOUSES] section of the chart output.
 * @param houseCusps Array of 12 house cusp degrees.
 * @param planets Array of planet points.
 * @param settings The chart settings.
 * @returns An array of strings for the output.
 */
export function generateHousesOutput(
  houseCusps: number[] | undefined,
  planets: Point[],
  settings: ChartSettings
): string[] {
  const output: string[] = ['[HOUSES]'];

  if (!houseCusps || houseCusps.length !== 12) {
    output.push('House cusps not available.');
    return output;
  }

  for (let i = 0; i < 12; i++) {
    const houseNumber = i + 1;
    const cuspDegree = houseCusps[i];
    const sign = getDegreeSign(cuspDegree);
    const formattedDegree = formatDegreeConditional(cuspDegree, settings.useDegreesOnly);
    const formattedSign = formatZodiacSign(sign, settings.displayMode);
    const formattedHouse = formatHouseNumber(houseNumber, settings.displayMode);
    
    output.push(`${formattedHouse}: ${formattedDegree} ${formattedSign}`);
    
    const planetsInHouse = planets.filter(planet => 
      getHouseForPoint(planet.degree, houseCusps) === houseNumber
    );
    
    if (planetsInHouse.length > 0) {
      planetsInHouse.forEach(planet => {
        const degreesWithin = getDegreesWithinHouse(planet.degree, houseCusps, houseNumber);
        const formattedDegreesWithin = formatDegreeConditional(degreesWithin, settings.useDegreesOnly);
        const formattedPlanet = formatPlanetName(planet.name, settings.displayMode);
        output.push(`  ${formattedPlanet}: ${formattedDegreesWithin} into house`);
      });
    }
  }

  return output;
}