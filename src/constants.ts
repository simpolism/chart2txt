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
  { name: 'conjunction', angle: 0, orb: 5 },
  { name: 'opposition', angle: 180, orb: 5 },
  { name: 'trine', angle: 120, orb: 5 },
  { name: 'square', angle: 90, orb: 5 },
  { name: 'sextile', angle: 60, orb: 3 },
]

export const DEFAULT_SETTINGS: Settings = {
  // sign settings
  includeSignDegree: true,
  omitSigns: false,

  // house settings
  houseSystem: 'equal',
  includeHouseDegree: false,
  omitHouses: false,

  // point settings
  includeAscendant: true,
  omitPoints: false,

  // orb + aspect settings
  aspectDefinitions: DEFAULT_ASPECTS,
  omitAspects: false,
}