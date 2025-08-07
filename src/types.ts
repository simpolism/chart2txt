export interface Point {
  name: string;
  degree: number; // 0-360 degrees
  speed?: number; // Optional: positive for direct, negative for retrograde, 0 for stationary
}

export interface ChartData {
  name: string; // the name of the chart's person or event
  planets: Point[]; // the set of points that may aspect other planets
  ascendant?: number; // 0-360 degrees, optional
  midheaven?: number; // 0-360 degrees, optional for Midheaven
  points?: Point[]; // a set of unaspected points e.g. midheaven, lots, etc
  houseCusps?: number[]; // Optional: Array of 12 degrees (0-360) for house cusps 1-12
  houseSystemName?: string; // Optional: Name of the house system used (e.g., "Placidus")
  timestamp?: Date; // the time for the chart, optional
  location?: string; // the location of the chart, optional
  chartType?: 'natal' | 'event' | 'transit'; // type of chart, optional, defaults to natal
}

export type MultiChartData = ChartData[];

export function isMultiChartData(
  obj: ChartData | MultiChartData
): obj is MultiChartData {
  return Array.isArray(obj);
}

export enum AspectClassification {
  Major = 'major',
  Minor = 'minor',
  Esoteric = 'esoteric',
}

export enum PlanetCategory {
  Luminaries = 'luminaries',
  Personal = 'personal',
  Social = 'social',
  Outer = 'outer',
  Angles = 'angles',
}

export interface Aspect {
  name: string;
  angle: number; // 0-360 degrees
  orb: number; // Maximum allowable orb for this aspect type (legacy/fallback)
  classification?: AspectClassification; // Major, minor, or esoteric aspect
}

export interface AspectData {
  planetA: string;
  planetB: string;
  aspectType: string;
  orb: number; // Actual orb of the aspect
  application?: 'applying' | 'separating' | 'exact'; // Optional: whether aspect is applying or separating
}

export interface AspectCategory {
  name: string; // e.g., "MAJOR", "MODERATE"
  minOrb?: number; // Minimum orb for this category (exclusive, e.g. 2 for 2-4°)
  maxOrb: number; // Maximum orb for this category (inclusive)
}

export interface PlanetOrbRules {
  defaultOrb?: number; // Default orb for this planet category
  aspectOrbs?: { [aspectName: string]: number }; // Specific aspect orbs for this category
}

export interface OrbClassificationRules {
  orbMultiplier?: number; // Multiplier applied to base orbs for this classification
  minOrb?: number; // Minimum orb regardless of calculation
  maxOrb?: number; // Maximum orb regardless of calculation
}

export interface ContextualOrbRules {
  orbMultiplier?: number; // Multiplier applied to calculated orbs for this context
  aspectMultipliers?: { [aspectName: string]: number }; // Per-aspect multipliers
}

export interface OrbConfiguration {
  presetName?: string; // Name of preset being used (for reference)
  planetCategories?: {
    [key in PlanetCategory]?: PlanetOrbRules;
  };
  aspectClassification?: {
    [key in AspectClassification]?: OrbClassificationRules;
  };
  contextualOrbs?: {
    synastry?: ContextualOrbRules;
    transits?: ContextualOrbRules;
    composite?: ContextualOrbRules;
  };
  planetMapping?: { [planetName: string]: PlanetCategory }; // Override default planet categorization
  globalFallbackOrb?: number; // Ultimate fallback orb if all else fails
}

export interface PlanetPosition {
  name: string;
  degree: number;
  sign: string;
  house?: number;
  chartName?: string; // Optional chart ownership for multichart patterns
}

export interface TSquare {
  type: 'T-Square';
  apex: PlanetPosition;
  opposition: [PlanetPosition, PlanetPosition];
  mode: 'Cardinal' | 'Fixed' | 'Mutable';
  averageOrb: number;
}

export interface GrandTrine {
  type: 'Grand Trine';
  planets: [PlanetPosition, PlanetPosition, PlanetPosition];
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  averageOrb: number;
}

export interface Stellium {
  type: 'Stellium';
  planets: PlanetPosition[];
  sign?: string;
  houses: number[];
  span: number;
}

export interface GrandCross {
  type: 'Grand Cross';
  planets: [PlanetPosition, PlanetPosition, PlanetPosition, PlanetPosition];
  mode: 'Cardinal' | 'Fixed' | 'Mutable';
  averageOrb: number;
}

export interface Yod {
  type: 'Yod';
  apex: PlanetPosition;
  base: [PlanetPosition, PlanetPosition];
  averageOrb: number;
}

export interface MysticRectangle {
  type: 'Mystic Rectangle';
  oppositions: [
    [PlanetPosition, PlanetPosition],
    [PlanetPosition, PlanetPosition]
  ];
  averageOrb: number;
}

export interface Kite {
  type: 'Kite';
  grandTrine: [PlanetPosition, PlanetPosition, PlanetPosition];
  opposition: PlanetPosition;
  averageOrb: number;
}

export type AspectPattern =
  | TSquare
  | GrandTrine
  | Stellium
  | GrandCross
  | Yod
  | MysticRectangle
  | Kite;

export interface Settings {
  // sign settings
  includeSignDegree: boolean; // For planets list, if degree in sign is shown

  // point settings
  includeAscendant: boolean; // Legacy, angles now have their own section

  // house settings
  houseSystemName: string; // Name of house system used in computations
  includeHouseDegree: boolean; // For planets list, if degree in house is shown (legacy)

  // orb + aspect settings
  aspectDefinitions: Aspect[];
  aspectCategories: AspectCategory[];
  skipOutOfSignAspects: boolean;
  orbConfiguration?: OrbConfiguration; // New enhanced orb configuration system

  // pattern settings
  includeAspectPatterns: boolean; // Whether to detect and display aspect patterns

  // sign distribution settings
  includeSignDistributions: boolean; // Whether to include element, modality, and polarity distributions

  dateFormat: string; // e.g., "MM/DD/YYYY", "YYYY-MM-DD"
}

export type PartialSettings = Partial<Settings>;
