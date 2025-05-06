export interface Point {
  name: string;
  degree: number; // 0-360 degrees
  speed?: number; // Optional: positive for direct, negative for retrograde, 0 for stationary
}

export interface ChartData {
  name?: string; // the name of the chart's person or event
  planets: Point[]; // the set of points that may aspect other planets
  ascendant?: number; // 0-360 degrees, optional
  midheaven?: number; // 0-360 degrees, optional for Midheaven
  points?: Point[]; // a set of unaspected points e.g. midheaven, lots, etc
  houseCusps?: number[]; // Optional: Array of 12 degrees (0-360) for house cusps 1-12
  houseSystemName?: string; // Optional: Name of the house system used (e.g., "Placidus")
  timestamp?: Date; // the time for the chart, optional
  location?: string; // the location of the chart, optional
}

export interface MultiChartData {
  chart1: ChartData;
  chart2?: ChartData;
  transit?: ChartData;
}

export function isMultiChartData(
  obj: ChartData | MultiChartData
): obj is MultiChartData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (obj as any).chart1 !== undefined;
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

export interface Settings {
  // sign settings
  includeSignDegree: boolean; // For planets list, if degree in sign is shown

  // point settings
  includeAscendant: boolean; // Legacy, angles now have their own section

  // house settings
  includeHouseDegree: boolean; // For planets list, if degree in house is shown (legacy)

  // orb + aspect settings
  aspectDefinitions: Aspect[];
  aspectCategories: AspectCategory[];
  dateFormat: string; // e.g., "MM/DD/YYYY", "YYYY-MM-DD"
}

export type PartialSettings = Partial<Settings>;
