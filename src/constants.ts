import {
  Aspect,
  Settings,
  AspectCategory,
  AspectClassification,
  PlanetCategory,
  OrbConfiguration,
} from './types';

export const ZODIAC_SIGN_DATA = [
  {
    name: 'Aries',
    element: 'Fire',
    modality: 'Cardinal',
    polarity: 'Masculine',
    ruler: 'Mars',
  },
  {
    name: 'Taurus',
    element: 'Earth',
    modality: 'Fixed',
    polarity: 'Feminine',
    ruler: 'Venus',
  },
  {
    name: 'Gemini',
    element: 'Air',
    modality: 'Mutable',
    polarity: 'Masculine',
    ruler: 'Mercury',
  },
  {
    name: 'Cancer',
    element: 'Water',
    modality: 'Cardinal',
    polarity: 'Feminine',
    ruler: 'Moon',
  },
  {
    name: 'Leo',
    element: 'Fire',
    modality: 'Fixed',
    polarity: 'Masculine',
    ruler: 'Sun',
  },
  {
    name: 'Virgo',
    element: 'Earth',
    modality: 'Mutable',
    polarity: 'Feminine',
    ruler: 'Mercury',
  },
  {
    name: 'Libra',
    element: 'Air',
    modality: 'Fixed',
    polarity: 'Masculine',
    ruler: 'Venus',
  },
  {
    name: 'Scorpio',
    element: 'Water',
    modality: 'Fixed',
    polarity: 'Feminine',
    ruler: 'Mars',
  },
  {
    name: 'Sagittarius',
    element: 'Fire',
    modality: 'Mutable',
    polarity: 'Masculine',
    ruler: 'Jupiter',
  },
  {
    name: 'Capricorn',
    element: 'Earth',
    modality: 'Cardinal',
    polarity: 'Feminine',
    ruler: 'Saturn',
  },
  {
    name: 'Aquarius',
    element: 'Air',
    modality: 'Fixed',
    polarity: 'Masculine',
    ruler: 'Saturn',
  },
  {
    name: 'Pisces',
    element: 'Water',
    modality: 'Mutable',
    polarity: 'Feminine',
    ruler: 'Jupiter',
  },
];

export const ZODIAC_SIGNS = ZODIAC_SIGN_DATA.map((s) => s.name);

export const DEFAULT_ASPECTS: Aspect[] = [
  {
    name: 'conjunction',
    angle: 0,
    orb: 5,
    classification: AspectClassification.Major,
  },
  {
    name: 'opposition',
    angle: 180,
    orb: 5,
    classification: AspectClassification.Major,
  },
  {
    name: 'trine',
    angle: 120,
    orb: 5,
    classification: AspectClassification.Major,
  },
  {
    name: 'square',
    angle: 90,
    orb: 5,
    classification: AspectClassification.Major,
  },
  {
    name: 'sextile',
    angle: 60,
    orb: 3,
    classification: AspectClassification.Minor,
  },
  {
    name: 'quincunx',
    angle: 150,
    orb: 2,
    classification: AspectClassification.Minor,
  },
];

export const TRADITIONAL_ASPECTS: Aspect[] = [
  {
    name: 'conjunction',
    angle: 0,
    orb: 8,
    classification: AspectClassification.Major,
  },
  {
    name: 'opposition',
    angle: 180,
    orb: 8,
    classification: AspectClassification.Major,
  },
  {
    name: 'trine',
    angle: 120,
    orb: 8,
    classification: AspectClassification.Major,
  },
  {
    name: 'square',
    angle: 90,
    orb: 8,
    classification: AspectClassification.Major,
  },
  {
    name: 'sextile',
    angle: 60,
    orb: 6,
    classification: AspectClassification.Minor,
  },
];

export const MODERN_ASPECTS: Aspect[] = [
  {
    name: 'conjunction',
    angle: 0,
    orb: 6,
    classification: AspectClassification.Major,
  },
  {
    name: 'opposition',
    angle: 180,
    orb: 6,
    classification: AspectClassification.Major,
  },
  {
    name: 'trine',
    angle: 120,
    orb: 6,
    classification: AspectClassification.Major,
  },
  {
    name: 'square',
    angle: 90,
    orb: 6,
    classification: AspectClassification.Major,
  },
  {
    name: 'sextile',
    angle: 60,
    orb: 4,
    classification: AspectClassification.Minor,
  },
  {
    name: 'quincunx',
    angle: 150,
    orb: 3,
    classification: AspectClassification.Minor,
  },
  {
    name: 'semi-sextile',
    angle: 30,
    orb: 2,
    classification: AspectClassification.Minor,
  },
  {
    name: 'semi-square',
    angle: 45,
    orb: 2,
    classification: AspectClassification.Minor,
  },
  {
    name: 'sesquiquadrate',
    angle: 135,
    orb: 2,
    classification: AspectClassification.Minor,
  },
];

export const TIGHT_ASPECTS: Aspect[] = [
  {
    name: 'conjunction',
    angle: 0,
    orb: 3,
    classification: AspectClassification.Major,
  },
  {
    name: 'opposition',
    angle: 180,
    orb: 3,
    classification: AspectClassification.Major,
  },
  {
    name: 'trine',
    angle: 120,
    orb: 3,
    classification: AspectClassification.Major,
  },
  {
    name: 'square',
    angle: 90,
    orb: 3,
    classification: AspectClassification.Major,
  },
  {
    name: 'sextile',
    angle: 60,
    orb: 2,
    classification: AspectClassification.Minor,
  },
  {
    name: 'quincunx',
    angle: 150,
    orb: 1,
    classification: AspectClassification.Minor,
  },
];

export const WIDE_ASPECTS: Aspect[] = [
  {
    name: 'conjunction',
    angle: 0,
    orb: 10,
    classification: AspectClassification.Major,
  },
  {
    name: 'opposition',
    angle: 180,
    orb: 10,
    classification: AspectClassification.Major,
  },
  {
    name: 'trine',
    angle: 120,
    orb: 8,
    classification: AspectClassification.Major,
  },
  {
    name: 'square',
    angle: 90,
    orb: 8,
    classification: AspectClassification.Major,
  },
  {
    name: 'sextile',
    angle: 60,
    orb: 6,
    classification: AspectClassification.Minor,
  },
  {
    name: 'quincunx',
    angle: 150,
    orb: 4,
    classification: AspectClassification.Minor,
  },
  {
    name: 'semi-sextile',
    angle: 30,
    orb: 3,
    classification: AspectClassification.Minor,
  },
];

export const DEFAULT_ASPECT_CATEGORIES: AspectCategory[] = [
  { name: 'TIGHT ASPECTS', maxOrb: 2 }, // Orb < 2°
  { name: 'MODERATE ASPECTS', minOrb: 2, maxOrb: 4 }, // Orb 2-4°
];

// Orb Configuration Presets

export const TRADITIONAL_ORB_CONFIG: OrbConfiguration = {
  presetName: 'traditional',
  planetCategories: {
    [PlanetCategory.Luminaries]: {
      defaultOrb: 10,
      aspectOrbs: {
        conjunction: 10,
        opposition: 10,
        trine: 8,
        square: 8,
        sextile: 6,
      },
    },
    [PlanetCategory.Personal]: {
      defaultOrb: 6,
    },
    [PlanetCategory.Social]: {
      defaultOrb: 6,
    },
    [PlanetCategory.Outer]: {
      defaultOrb: 3,
    },
    [PlanetCategory.Angles]: {
      defaultOrb: 8,
    },
  },
  aspectClassification: {
    [AspectClassification.Major]: {
      orbMultiplier: 1.0,
    },
    [AspectClassification.Minor]: {
      orbMultiplier: 0.75,
    },
  },
  contextualOrbs: {
    synastry: {
      orbMultiplier: 0.9, // Slightly tighter orbs for synastry
    },
    transits: {
      orbMultiplier: 1.2, // Slightly wider orbs for transits
    },
  },
  globalFallbackOrb: 5,
};

export const MODERN_ORB_CONFIG: OrbConfiguration = {
  presetName: 'modern',
  planetCategories: {
    [PlanetCategory.Luminaries]: {
      defaultOrb: 8,
    },
    [PlanetCategory.Personal]: {
      defaultOrb: 6,
    },
    [PlanetCategory.Social]: {
      defaultOrb: 5,
    },
    [PlanetCategory.Outer]: {
      defaultOrb: 4,
    },
    [PlanetCategory.Angles]: {
      defaultOrb: 6,
    },
  },
  aspectClassification: {
    [AspectClassification.Major]: {
      orbMultiplier: 1.0,
    },
    [AspectClassification.Minor]: {
      orbMultiplier: 0.6,
    },
  },
  contextualOrbs: {
    synastry: {
      orbMultiplier: 0.8,
    },
    transits: {
      orbMultiplier: 1.1,
    },
  },
  globalFallbackOrb: 4,
};

export const TIGHT_ORB_CONFIG: OrbConfiguration = {
  presetName: 'tight',
  planetCategories: {
    [PlanetCategory.Luminaries]: {
      defaultOrb: 5,
    },
    [PlanetCategory.Personal]: {
      defaultOrb: 3,
    },
    [PlanetCategory.Social]: {
      defaultOrb: 3,
    },
    [PlanetCategory.Outer]: {
      defaultOrb: 2,
    },
    [PlanetCategory.Angles]: {
      defaultOrb: 4,
    },
  },
  aspectClassification: {
    [AspectClassification.Major]: {
      orbMultiplier: 1.0,
      maxOrb: 5,
    },
    [AspectClassification.Minor]: {
      orbMultiplier: 0.5,
      maxOrb: 2,
    },
  },
  globalFallbackOrb: 2,
};

export const WIDE_ORB_CONFIG: OrbConfiguration = {
  presetName: 'wide',
  planetCategories: {
    [PlanetCategory.Luminaries]: {
      defaultOrb: 12,
    },
    [PlanetCategory.Personal]: {
      defaultOrb: 8,
    },
    [PlanetCategory.Social]: {
      defaultOrb: 8,
    },
    [PlanetCategory.Outer]: {
      defaultOrb: 6,
    },
    [PlanetCategory.Angles]: {
      defaultOrb: 10,
    },
  },
  aspectClassification: {
    [AspectClassification.Major]: {
      orbMultiplier: 1.0,
    },
    [AspectClassification.Minor]: {
      orbMultiplier: 0.8,
    },
  },
  contextualOrbs: {
    synastry: {
      orbMultiplier: 0.9,
    },
    transits: {
      orbMultiplier: 1.3,
    },
  },
  globalFallbackOrb: 8,
};

export const DEFAULT_SETTINGS: Settings = {
  // house settings
  houseSystemName: 'whole_sign',

  // orb + aspect settings
  aspectDefinitions: DEFAULT_ASPECTS,
  aspectCategories: DEFAULT_ASPECT_CATEGORIES,
  skipOutOfSignAspects: true,

  // pattern settings
  includeAspectPatterns: false, // Aspect patterns disabled by default

  // sign distribution settings
  includeSignDistributions: true, // Sign distributions enabled by default

  dateFormat: 'MM/DD/YYYY', // As per example output
  detailLevel: 'complete',
};
