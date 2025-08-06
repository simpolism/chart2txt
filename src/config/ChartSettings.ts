import { Settings, PartialSettings, AspectCategory, Aspect, OrbConfiguration } from '../types';
import {
  DEFAULT_SETTINGS,
  DEFAULT_ASPECT_CATEGORIES,
  DEFAULT_ASPECTS,
} from '../constants';
import { OrbResolver } from '../core/orbResolver';

export class ChartSettings implements Settings {
  // Properties from Settings interface
  includeSignDegree: boolean;
  includeAscendant: boolean;
  houseSystemName: string;
  includeHouseDegree: boolean;
  skipOutOfSignAspects: boolean;
  aspectDefinitions: Aspect[];
  aspectCategories: AspectCategory[];
  orbConfiguration?: OrbConfiguration;
  includeAspectPatterns: boolean;
  dateFormat: string;

  // Derived properties for convenience
  private _orbResolver?: OrbResolver;

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
    this.orbConfiguration = mergedSettings.orbConfiguration;
    this.skipOutOfSignAspects = mergedSettings.skipOutOfSignAspects;
    this.includeAspectPatterns = mergedSettings.includeAspectPatterns;
    this.dateFormat = mergedSettings.dateFormat;

    // Initialize orb resolver if orb configuration is provided
    if (this.orbConfiguration) {
      this._orbResolver = new OrbResolver(this.orbConfiguration);
    }
  }

  /**
   * Gets the orb resolver instance, creating it if needed
   */
  get orbResolver(): OrbResolver | undefined {
    return this._orbResolver;
  }

  /**
   * Updates the orb configuration and reinitializes the orb resolver
   */
  updateOrbConfiguration(orbConfiguration?: OrbConfiguration): void {
    this.orbConfiguration = orbConfiguration;
    if (orbConfiguration) {
      this._orbResolver = new OrbResolver(orbConfiguration);
    } else {
      this._orbResolver = undefined;
    }
  }
}
