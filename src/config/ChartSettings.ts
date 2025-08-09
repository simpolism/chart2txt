import {
  Settings,
  PartialSettings,
  Aspect,
  AspectStrengthThresholds,
} from '../types';
import {
  DEFAULT_SETTINGS,
  SIMPLE_TRADITIONAL_ORBS,
  SIMPLE_MODERN_ORBS,
  SIMPLE_TIGHT_ORBS,
  SIMPLE_WIDE_ORBS,
} from '../constants';

export class ChartSettings implements Settings {
  // Properties from Settings interface
  houseSystemName!: string;
  skipOutOfSignAspects!: boolean;
  aspectDefinitions!: Aspect[] | 'traditional' | 'modern' | 'tight' | 'wide';
  aspectStrengthThresholds!: AspectStrengthThresholds;
  includeAspectPatterns!: boolean;
  includeSignDistributions!: boolean;
  dateFormat!: string;

  constructor(customSettings: PartialSettings = {}) {
    const mergedSettings = { ...DEFAULT_SETTINGS, ...customSettings };
    Object.assign(this, mergedSettings);
  }

  /**
   * Gets the resolved aspect definitions (handles preset strings)
   */
  get resolvedAspectDefinitions(): Aspect[] {
    if (Array.isArray(this.aspectDefinitions)) {
      return this.aspectDefinitions;
    }

    // Handle preset strings
    switch (this.aspectDefinitions) {
      case 'traditional':
        return SIMPLE_TRADITIONAL_ORBS;
      case 'modern':
        return SIMPLE_MODERN_ORBS;
      case 'tight':
        return SIMPLE_TIGHT_ORBS;
      case 'wide':
        return SIMPLE_WIDE_ORBS;
      default:
        return DEFAULT_SETTINGS.aspectDefinitions as Aspect[];
    }
  }

  /**
   * Returns a plain JSON object representation of the settings.
   */
  toJSON(): Settings {
    return {
      houseSystemName: this.houseSystemName,
      skipOutOfSignAspects: this.skipOutOfSignAspects,
      aspectDefinitions: this.aspectDefinitions,
      aspectStrengthThresholds: this.aspectStrengthThresholds,
      includeAspectPatterns: this.includeAspectPatterns,
      includeSignDistributions: this.includeSignDistributions,
      dateFormat: this.dateFormat,
    };
  }
}
