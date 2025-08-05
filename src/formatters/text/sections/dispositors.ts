import { Point } from '../../../types';
import { analyzeDispositors, formatDispositorAnalysis } from '../../../core/dispositors';

/**
 * Generates the [DISPOSITOR TREE] section of the chart output.
 * @param planets Array of planet points.
 * @returns An array of strings for the output.
 */
export function generateDispositorsOutput(planets: Point[]): string[] {
  const output: string[] = ['[DISPOSITOR TREE]'];

  if (planets.length === 0) {
    output.push('No planets available for dispositor analysis.');
    return output;
  }

  const analysis = analyzeDispositors(planets);
  const formattedAnalysis = formatDispositorAnalysis(analysis);
  
  output.push(...formattedAnalysis);
  
  return output;
}