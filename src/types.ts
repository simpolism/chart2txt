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

export interface Aspect {
  name: string;
  angle: number; // 0-360 degrees
  orb: number; // Maximum allowable orb for this aspect type
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

export interface PlanetPosition {
  name: string;
  degree: number;
  sign: string;
  house?: number;
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
  oppositions: [[PlanetPosition, PlanetPosition], [PlanetPosition, PlanetPosition]];
  averageOrb: number;
}

export interface Kite {
  type: 'Kite';
  grandTrine: [PlanetPosition, PlanetPosition, PlanetPosition];
  opposition: PlanetPosition;
  averageOrb: number;
}

export type AspectPattern = TSquare | GrandTrine | Stellium | GrandCross | Yod | MysticRectangle | Kite;

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
  
  // pattern settings
  includeAspectPatterns: boolean; // Whether to detect and display aspect patterns
  
  dateFormat: string; // e.g., "MM/DD/YYYY", "YYYY-MM-DD"
}

export type PartialSettings = Partial<Settings>;
