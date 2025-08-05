import { Point } from '../../../types';
import { 
  analyzeSignDistributions, 
  formatElementDistribution, 
  formatModalityDistribution, 
  formatPolarityDistribution 
} from '../../../core/signDistributions';

/**
 * Generates the [ELEMENT DISTRIBUTION] section of the chart output.
 * @param planets Array of planet points.
 * @param chartName Optional chart name for the header.
 * @param ascendant Optional ascendant degree to include in analysis.
 * @returns An array of strings for the output.
 */
export function generateElementDistributionOutput(
  planets: Point[], 
  chartName?: string, 
  ascendant?: number
): string[] {
  const header = chartName ? `[ELEMENT DISTRIBUTION: ${chartName}]` : '[ELEMENT DISTRIBUTION]';
  const output: string[] = [header];

  if (planets.length === 0) {
    output.push('No planets available for element analysis.');
    return output;
  }

  const distributions = analyzeSignDistributions(planets, ascendant);
  const formattedElements = formatElementDistribution(distributions.elements);
  
  output.push(...formattedElements);
  
  return output;
}

/**
 * Generates the [MODALITY DISTRIBUTION] section of the chart output.
 * @param planets Array of planet points.
 * @param chartName Optional chart name for the header.
 * @param ascendant Optional ascendant degree to include in analysis.
 * @returns An array of strings for the output.
 */
export function generateModalityDistributionOutput(
  planets: Point[], 
  chartName?: string, 
  ascendant?: number
): string[] {
  const header = chartName ? `[MODALITY DISTRIBUTION: ${chartName}]` : '[MODALITY DISTRIBUTION]';
  const output: string[] = [header];

  if (planets.length === 0) {
    output.push('No planets available for modality analysis.');
    return output;
  }

  const distributions = analyzeSignDistributions(planets, ascendant);
  const formattedModalities = formatModalityDistribution(distributions.modalities);
  
  output.push(...formattedModalities);
  
  return output;
}

/**
 * Generates the [POLARITY] section of the chart output.
 * @param planets Array of planet points.
 * @param chartName Optional chart name for the header.
 * @param ascendant Optional ascendant degree to include in analysis.
 * @returns An array of strings for the output.
 */
export function generatePolarityOutput(
  planets: Point[], 
  chartName?: string, 
  ascendant?: number
): string[] {
  const header = chartName ? `[POLARITY: ${chartName}]` : '[POLARITY]';
  const output: string[] = [header];

  if (planets.length === 0) {
    output.push('No planets available for polarity analysis.');
    return output;
  }

  const distributions = analyzeSignDistributions(planets, ascendant);
  const formattedPolarities = formatPolarityDistribution(distributions.polarities);
  
  output.push(...formattedPolarities);
  
  return output;
}