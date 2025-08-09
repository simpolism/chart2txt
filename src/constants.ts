import {
  Aspect,
  Settings,
  AspectCategory,
  AspectClassification,
  AspectStrengthThresholds,
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

// Simple Orb Presets - generous orbs for detection, classification handled separately
export const SIMPLE_TRADITIONAL_ORBS: Aspect[] = [
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
];

export const SIMPLE_MODERN_ORBS: Aspect[] = [
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
];

export const SIMPLE_TIGHT_ORBS: Aspect[] = [
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
    orb: 4,
    classification: AspectClassification.Major,
  },
  {
    name: 'square',
    angle: 90,
    orb: 4,
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

export const SIMPLE_WIDE_ORBS: Aspect[] = [
  {
    name: 'conjunction',
    angle: 0,
    orb: 12,
    classification: AspectClassification.Major,
  },
  {
    name: 'opposition',
    angle: 180,
    orb: 12,
    classification: AspectClassification.Major,
  },
  {
    name: 'trine',
    angle: 120,
    orb: 10,
    classification: AspectClassification.Major,
  },
  {
    name: 'square',
    angle: 90,
    orb: 10,
    classification: AspectClassification.Major,
  },
  {
    name: 'sextile',
    angle: 60,
    orb: 8,
    classification: AspectClassification.Minor,
  },
  {
    name: 'quincunx',
    angle: 150,
    orb: 6,
    classification: AspectClassification.Minor,
  },
  {
    name: 'semi-sextile',
    angle: 30,
    orb: 4,
    classification: AspectClassification.Minor,
  },
];

// Legacy aliases for backwards compatibility
export const TRADITIONAL_ASPECTS = SIMPLE_TRADITIONAL_ORBS;

// Legacy aliases for backwards compatibility
export const MODERN_ASPECTS = SIMPLE_MODERN_ORBS;

export const TIGHT_ASPECTS = SIMPLE_TIGHT_ORBS;

export const WIDE_ASPECTS = SIMPLE_WIDE_ORBS;

export const DEFAULT_ASPECT_CATEGORIES: AspectCategory[] = [
  { name: 'TIGHT ASPECTS', maxOrb: 2 }, // Orb < 2°
  { name: 'MODERATE ASPECTS', minOrb: 2, maxOrb: 4 }, // Orb 2-4°
];

// Default aspect strength thresholds
export const DEFAULT_ASPECT_STRENGTH_THRESHOLDS: AspectStrengthThresholds = {
  tight: 2.0, // Aspects with orb <= 2° are classified as tight
  moderate: 4.0, // Aspects with orb 2-4° are moderate, >4° are wide
};

export const DEFAULT_SETTINGS: Settings = {
  // house settings
  houseSystemName: 'whole_sign',

  // orb + aspect settings
  aspectDefinitions: DEFAULT_ASPECTS,
  aspectCategories: DEFAULT_ASPECT_CATEGORIES,
  skipOutOfSignAspects: true,
  aspectStrengthThresholds: DEFAULT_ASPECT_STRENGTH_THRESHOLDS,

  // pattern settings
  includeAspectPatterns: false, // Aspect patterns disabled by default

  // sign distribution settings
  includeSignDistributions: true, // Sign distributions enabled by default

  dateFormat: 'MM/DD/YYYY', // As per example output
};
