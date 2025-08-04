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

export const PLANETARY_DIGNITIES: Record<string, {
  rulership: string[];
  exaltation: string[];
  detriment: string[];
  fall: string[];
}> = {
  Sun: { rulership: ['Leo'], exaltation: ['Aries'], detriment: ['Aquarius'], fall: ['Libra'] },
  Moon: { rulership: ['Cancer'], exaltation: ['Taurus'], detriment: ['Capricorn'], fall: ['Scorpio'] },
  Mercury: { rulership: ['Gemini', 'Virgo'], exaltation: ['Virgo'], detriment: ['Sagittarius', 'Pisces'], fall: ['Pisces'] },
  Venus: { rulership: ['Taurus', 'Libra'], exaltation: ['Pisces'], detriment: ['Aries', 'Scorpio'], fall: ['Virgo'] },
  Mars: { rulership: ['Aries', 'Scorpio'], exaltation: ['Capricorn'], detriment: ['Libra', 'Taurus'], fall: ['Cancer'] },
  Jupiter: { rulership: ['Sagittarius', 'Pisces'], exaltation: ['Cancer'], detriment: ['Gemini', 'Virgo'], fall: ['Capricorn'] },
  Saturn: { rulership: ['Capricorn', 'Aquarius'], exaltation: ['Libra'], detriment: ['Cancer', 'Leo'], fall: ['Aries'] },
  Uranus: { rulership: ['Aquarius'], exaltation: [], detriment: ['Leo'], fall: [] },
  Neptune: { rulership: ['Pisces'], exaltation: [], detriment: ['Virgo'], fall: [] },
  Pluto: { rulership: ['Scorpio'], exaltation: [], detriment: ['Taurus'], fall: [] }
};

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
  houseSystemName: 'whole_sign',
  includeHouseDegree: true, // Show degree in house for planets list

  // point settings
  includeAscendant: true, // Legacy, ASC/MC now have dedicated [ANGLES] section

  // orb + aspect settings
  aspectDefinitions: DEFAULT_ASPECTS,
  aspectCategories: DEFAULT_ASPECT_CATEGORIES,
  skipOutOfSignAspects: true,
  dateFormat: 'MM/DD/YYYY', // As per example output
  
  // dignity settings
  includePlanetaryDignities: true, // Show planetary dignities by default
  
  // degree formatting settings
  useDegreesOnly: false, // Use full degrees/minutes/seconds by default
};
