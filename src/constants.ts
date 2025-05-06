import { Aspect, Settings, HouseSystem, AspectCategory } from './types';

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
  omitSigns: false, // Legacy, may not be used directly in the new structured output

  // house settings
  houseSystem: 'whole_sign', // As per example output
  includeHouseDegree: false, // New format shows "House X", not degree in house for planets list
  omitHouses: false, // Legacy

  // point settings
  includeAscendant: true, // Legacy, ASC/MC now have dedicated [ANGLES] section
  omitPoints: false, // Whether to process ChartData.points (if any)

  // orb + aspect settings
  aspectDefinitions: DEFAULT_ASPECTS,
  omitAspects: false, // Legacy, aspects now have dedicated [ASPECTS] section
  aspectCategories: DEFAULT_ASPECT_CATEGORIES,
  dateFormat: 'MM/DD/YYYY', // As per example output
};
