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

export type UnionedPoint = [Point, string]; // [Point, chartName]

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

export type AspectStrength = 'tight' | 'moderate' | 'wide';

export interface AspectStrengthThresholds {
  tight: number; // Orb threshold for tight aspects (e.g., 2.0 degrees)
  moderate: number; // Orb threshold for moderate aspects (e.g., 4.0 degrees)
  // Aspects with orb > moderate threshold are classified as 'wide'
}

export interface AspectData {
  planetA: string;
  planetB: string;
  p1ChartName?: string; // Optional: for multi-chart contexts
  p2ChartName?: string; // Optional: for multi-chart contexts
  aspectType: string;
  orb: number; // Actual orb of the aspect
  application?: 'applying' | 'separating' | 'exact'; // Optional: whether aspect is applying or separating
}

// Removed complex OrbConfiguration - replaced with simple aspect-based orbs and strength classification

export interface PlanetPosition {
  name: string;
  degree: number;
  sign: string;
  speed?: number;
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

export interface ChartAnalysis {
  chart: ChartData;
  placements: {
    planets: PlanetPosition[];
    [key: string]: any; // Allow for other placements
  };
  aspects: AspectData[];
  groupedAspects?: Map<string, AspectData[]>;
  patterns: AspectPattern[];
  stelliums: Stellium[];
  signDistributions: {
    elements: { [key: string]: string[] };
    modalities: { [key: string]: number };
    polarities: { [key: string]: number };
  };
  dispositors: { [key: string]: string };
}

export interface PairwiseAnalysis {
  chart1: ChartData;
  chart2: ChartData;
  synastryAspects: AspectData[];
  groupedSynastryAspects?: Map<string, AspectData[]>;
  compositePatterns: AspectPattern[];
  houseOverlays: {
    chart1InChart2Houses: { [key: string]: number };
    chart2InChart1Houses: { [key: string]: number };
  };
}

export interface GlobalAnalysis {
  charts: ChartData[];
  patterns: AspectPattern[];
}

export interface TransitAnalysis {
  natalChart: ChartData;
  transitChart: ChartData;
  aspects: AspectData[];
  groupedAspects?: Map<string, AspectData[]>;
  patterns: AspectPattern[];
}

export interface AstrologicalReport {
  settings: Settings;
  chartAnalyses: ChartAnalysis[];
  pairwiseAnalyses: PairwiseAnalysis[];
  globalAnalysis?: GlobalAnalysis;
  transitAnalyses: TransitAnalysis[];
  globalTransitAnalysis?: GlobalAnalysis;
}

export interface AnalysisSettings {
  aspectDefinitions?: Aspect[] | 'traditional' | 'modern' | 'tight' | 'wide';
  skipOutOfSignAspects?: boolean;
  includeAspectPatterns?: boolean;
  includeSignDistributions?: boolean;
}

export interface GroupingSettings {
  aspectStrengthThresholds?: AspectStrengthThresholds;
}

export interface FormattingSettings {
  dateFormat?: string;
  houseSystemName?: string;
}

export interface Settings
  extends AnalysisSettings,
    GroupingSettings,
    FormattingSettings {}

export type PartialSettings = Partial<Settings>;

// Utility type for internal use
export type ChartDataWithInfo = {
  data: ChartData;
  index: number;
};
