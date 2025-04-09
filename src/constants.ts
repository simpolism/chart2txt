import { Aspect, Settings } from "./types";

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
  { name: 'conjunction', angle: 0, orb: 8 },
  { name: 'opposition', angle: 180, orb: 8 },
  { name: 'trine', angle: 120, orb: 8 },
  { name: 'square', angle: 90, orb: 7 },
  { name: 'sextile', angle: 60, orb: 6 },
]

export const DEFAULT_SETTINGS: Settings = {
  // sign settings
  includeSignDegree: false,
  omitSigns: false,

  // house settings
  includeHouseDegree: false,
  houseSystem: 'equal',
  includeAscendant: true,
  omitHouses: false,

  // orb + aspect settings
  aspectDefinitions: DEFAULT_ASPECTS,
  omitAspects: false,
}