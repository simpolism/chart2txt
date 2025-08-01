import { Settings, PartialSettings, AspectCategory, Aspect } from '../types';
import {
  DEFAULT_SETTINGS,
  DEFAULT_ASPECT_CATEGORIES,
  DEFAULT_ASPECTS,
} from '../constants';

export class ChartSettings implements Settings {
  // Properties from Settings interface
  includeSignDegree: boolean;
  includeAscendant: boolean;
  houseSystemName: string;
  includeHouseDegree: boolean;
  skipOutOfSignAspects: boolean;
  aspectDefinitions: Aspect[];
  aspectCategories: AspectCategory[];
  dateFormat: string;

  constructor(customSettings: PartialSettings = {}) {
    const mergedSettings = { ...DEFAULT_SETTINGS, ...customSettings };

    this.includeSignDegree = mergedSettings.includeSignDegree;
    this.includeAscendant = mergedSettings.includeAscendant;
    this.houseSystemName = mergedSettings.houseSystemName;
    this.includeHouseDegree = mergedSettings.includeHouseDegree;
    this.aspectDefinitions =
      mergedSettings.aspectDefinitions || DEFAULT_ASPECTS; // Ensure array is not undefined
    this.aspectCategories =
      mergedSettings.aspectCategories || DEFAULT_ASPECT_CATEGORIES; // Ensure array is not undefined
    this.skipOutOfSignAspects = mergedSettings.skipOutOfSignAspects;
    this.dateFormat = mergedSettings.dateFormat;
  }
}
