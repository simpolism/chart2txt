import {
  Settings,
  PartialSettings,
  AspectCategory,
  Aspect,
  OrbConfiguration,
} from '../types';
import { DEFAULT_SETTINGS } from '../constants';
import { OrbResolver } from '../core/orbResolver';

export class ChartSettings implements Settings {
  // Properties from Settings interface are dynamically assigned
  houseSystemName!: string;
  skipOutOfSignAspects!: boolean;
  aspectDefinitions!: Aspect[];
  aspectCategories!: AspectCategory[];
  orbConfiguration?: OrbConfiguration;
  includeAspectPatterns!: boolean;
  includeSignDistributions!: boolean;
  dateFormat!: string;
  detailLevel!: 'complete' | 'standard' | 'summary';

  // Derived properties for convenience
  private _orbResolver?: OrbResolver;

  constructor(customSettings: PartialSettings = {}) {
    const mergedSettings = { ...DEFAULT_SETTINGS, ...customSettings };
    Object.assign(this, mergedSettings);

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
