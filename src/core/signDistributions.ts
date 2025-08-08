import { Point } from '../types';
import { getSign } from '../utils/formatting';
import { ZODIAC_SIGN_DATA } from '../constants';

export function calculateSignDistributions(
  planets: Point[],
  ascendant?: number
) {
  const points = [...planets];
  if (ascendant !== undefined) {
    points.push({ name: 'Ascendant', degree: ascendant });
  }

  const elements: { [key: string]: string[] } = {
    Fire: [],
    Earth: [],
    Air: [],
    Water: [],
  };
  const modalities: { [key: string]: number } = {
    Cardinal: 0,
    Fixed: 0,
    Mutable: 0,
  };
  const polarities: { [key: string]: number } = { Masculine: 0, Feminine: 0 };

  for (const point of points) {
    const sign = getSign(point.degree);
    const signInfo = ZODIAC_SIGN_DATA.find((s) => s.name === sign);
    if (signInfo) {
      elements[signInfo.element].push(point.name);
      modalities[signInfo.modality]++;
      polarities[signInfo.polarity]++;
    }
  }

  return { elements, modalities, polarities };
}

export function formatElementDistribution(elements: {
  [key: string]: string[];
}): string[] {
  return Object.entries(elements).map(([element, planets]) => {
    if (planets.length === 0) {
      return `${element}: 0`;
    }
    return `${element}: ${planets.length} (${planets.join(', ')})`;
  });
}

export function formatModalityDistribution(modalities: {
  [key: string]: number;
}): string[] {
  return Object.entries(modalities).map(
    ([modality, count]) => `${modality}: ${count}`
  );
}

export function formatPolarityDistribution(polarities: {
  [key: string]: number;
}): string[] {
  return Object.entries(polarities).map(
    ([polarity, count]) => `${polarity}: ${count}`
  );
}
