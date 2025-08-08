import {
  formatElementDistribution,
  formatModalityDistribution,
  formatPolarityDistribution,
} from '../../../core/signDistributions';

export function generateElementDistributionOutput(elements: {
  [key: string]: string[];
}): string[] {
  const output: string[] = ['[ELEMENT DISTRIBUTION]'];
  output.push(...formatElementDistribution(elements));
  return output;
}

export function generateModalityDistributionOutput(modalities: {
  [key: string]: number;
}): string[] {
  const output: string[] = ['[MODALITY DISTRIBUTION]'];
  output.push(...formatModalityDistribution(modalities));
  return output;
}

export function generatePolarityOutput(polarities: {
  [key: string]: number;
}): string[] {
  const output: string[] = ['[POLARITY]'];
  output.push(...formatPolarityDistribution(polarities));
  return output;
}
