import { getDegreeSign, getDegreeInSign } from '../../../core/astrology';
import { getOrdinal } from '../../../utils/formatting';

/**
 * Generates the [HOUSE CUSPS] section of the chart output.
 * @param houseCusps Array of 12 house cusp degrees (0-360), or undefined if not available.
 * @returns An array of strings for the output.
 */
export function generateHousesOutput(houseCusps?: number[]): string[] {
  const output: string[] = ['[HOUSE CUSPS]'];

  if (!houseCusps || houseCusps.length !== 12) {
    output.push('House cusps not available');
    return output;
  }

  // Format houses in two columns: 1-6 and 7-12
  for (let i = 0; i < 6; i++) {
    const leftHouseIndex = i;
    const rightHouseIndex = i + 6;
    
    const leftCusp = houseCusps[leftHouseIndex];
    const rightCusp = houseCusps[rightHouseIndex];
    
    const leftSign = getDegreeSign(leftCusp);
    const leftDegInSign = Math.floor(getDegreeInSign(leftCusp));
    const leftHouseLabel = getOrdinal(leftHouseIndex + 1) + ' house';
    
    const rightSign = getDegreeSign(rightCusp);
    const rightDegInSign = Math.floor(getDegreeInSign(rightCusp));
    const rightHouseLabel = getOrdinal(rightHouseIndex + 1) + ' house';
    
    // Pad the left side to align columns
    const leftPart = `${leftHouseLabel}: ${leftDegInSign}° ${leftSign}`;
    const paddedLeftPart = leftPart.padEnd(24); // Adjust padding as needed
    const rightPart = `${rightHouseLabel}: ${rightDegInSign}° ${rightSign}`;
    
    output.push(`${paddedLeftPart} ${rightPart}`);
  }

  return output;
}