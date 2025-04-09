export interface Point {
  name: string;
  longitude: number; // 0-360 degrees
}

export interface ChartData {
  planets: Point[]; // the set of points that may aspect other planets
  ascendant?: number; // 0-360 degrees, optional
  points?: Point[]; // a set of unaspected points e.g. midheaven, lots, etc
  timestamp?: Date; // the time for the chart, optional
  location?: string; // the location of the chart, optional
}

export interface Aspect {
  name: string;
  angle: number; // 0-360 degrees
  orb: number;
}

export interface AspectData {
  planetA: string;
  planetB: string;
  aspectType: string;
  orb: number;
}

export type HouseSystem = 'whole_sign' | 'equal';

export interface Settings {
  // sign settings
  includeSignDegree: boolean;
  omitSigns: boolean;

  // point settings
  includeAscendant: boolean;
  omitPoints: boolean;

  // house settings
  includeHouseDegree: boolean;
  houseSystem: HouseSystem;
  omitHouses: boolean;

  // orb + aspect settings
  aspectDefinitions: Aspect[];
  omitAspects: boolean;
}
