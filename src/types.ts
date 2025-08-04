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
}

export interface AspectCategory {
  name: string; // e.g., "MAJOR", "MODERATE"
  minOrb?: number; // Minimum orb for this category (exclusive, e.g. 2 for 2-4°)
  maxOrb: number; // Maximum orb for this category (inclusive)
}

export type DisplayMode = 'words' | 'symbols' | 'both';

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
  dateFormat: string; // e.g., "MM/DD/YYYY", "YYYY-MM-DD"
  
  // dignity settings
  includePlanetaryDignities: boolean;
  
  // degree formatting settings
  useDegreesOnly: boolean; // If true, show only degrees (e.g., "15°"), if false show degrees/minutes/seconds (e.g., "15°42'30")
  
  // symbol display settings
  displayMode: DisplayMode; // Whether to show symbols, words, or both
}

export type PartialSettings = Partial<Settings>;
