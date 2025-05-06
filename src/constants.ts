import { Aspect, Settings, AspectCategory } from './types';

export const ZODIAC_SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

export const DEFAULT_ASPECTS: Aspect[] = [
  { name: 'conjunction', angle: 0, orb: 5 }, // Max orb for this aspect to be considered
  { name: 'opposition', angle: 180, orb: 5 },
  { name: 'trine', angle: 120, orb: 5 },
  { name: 'square', angle: 90, orb: 5 },
  { name: 'sextile', angle: 60, orb: 3 },
];

export const DEFAULT_ASPECT_CATEGORIES: AspectCategory[] = [
  { name: 'MAJOR', maxOrb: 2 }, // Orb < 2°
  { name: 'MODERATE', minOrb: 2, maxOrb: 4 }, // Orb 2-4°
];

export const DEFAULT_SETTINGS: Settings = {
  // sign settings
  includeSignDegree: true, // For planets list: "Sun: 8° Cancer" vs "Sun: Cancer"

  // house settings
  includeHouseDegree: false, // New format shows "House X", not degree in house for planets list

  // point settings
  includeAscendant: true, // Legacy, ASC/MC now have dedicated [ANGLES] section

  // orb + aspect settings
  aspectDefinitions: DEFAULT_ASPECTS,
  aspectCategories: DEFAULT_ASPECT_CATEGORIES,
  dateFormat: 'MM/DD/YYYY', // As per example output
};
