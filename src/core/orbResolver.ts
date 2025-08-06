import {
  Aspect,
  AspectClassification,
  PlanetCategory,
  OrbConfiguration,
  Point,
} from '../types';

/**
 * Default planet categorization mapping
 */
const DEFAULT_PLANET_MAPPING: { [planetName: string]: PlanetCategory } = {
  Sun: PlanetCategory.Luminaries,
  Moon: PlanetCategory.Luminaries,
  Mercury: PlanetCategory.Personal,
  Venus: PlanetCategory.Personal,
  Mars: PlanetCategory.Personal,
  Jupiter: PlanetCategory.Social,
  Saturn: PlanetCategory.Social,
  Uranus: PlanetCategory.Outer,
  Neptune: PlanetCategory.Outer,
  Pluto: PlanetCategory.Outer,
  Ascendant: PlanetCategory.Angles,
  Midheaven: PlanetCategory.Angles,
  MC: PlanetCategory.Angles,
  ASC: PlanetCategory.Angles,
};

/**
 * Chart context for orb resolution
 */
export interface OrbResolutionContext {
  chartType?: 'natal' | 'synastry' | 'transit' | 'composite';
  planetA: Point | string;
  planetB: Point | string;
  aspect: Aspect;
}

/**
 * Resolves orbs using hierarchical rules with caching for performance
 */
export class OrbResolver {
  private orbCache = new Map<string, number>();
  private orbConfiguration: OrbConfiguration;
  private planetMapping: { [planetName: string]: PlanetCategory };

  constructor(orbConfiguration: OrbConfiguration = {}) {
    this.orbConfiguration = orbConfiguration;
    this.planetMapping = {
      ...DEFAULT_PLANET_MAPPING,
      ...orbConfiguration.planetMapping,
    };
  }

  /**
   * Resolves the appropriate orb for a given context
   */
  resolveOrb(context: OrbResolutionContext): number {
    const cacheKey = this.generateCacheKey(context);
    
    // Check cache first
    if (this.orbCache.has(cacheKey)) {
      return this.orbCache.get(cacheKey)!;
    }

    const orb = this.calculateOrb(context);
    this.orbCache.set(cacheKey, orb);
    return orb;
  }

  /**
   * Clears the orb cache (useful when configuration changes)
   */
  clearCache(): void {
    this.orbCache.clear();
  }

  /**
   * Gets the planet category for a given planet name
   */
  getPlanetCategory(planetName: string): PlanetCategory | undefined {
    return this.planetMapping[planetName];
  }

  private calculateOrb(context: OrbResolutionContext): number {
    let baseOrb = this.getBaseOrb(context);
    
    // Apply aspect classification multipliers
    baseOrb = this.applyClassificationMultipliers(baseOrb, context.aspect);
    
    // Apply contextual multipliers (synastry, transit, etc.)
    baseOrb = this.applyContextualMultipliers(baseOrb, context);
    
    // Ensure minimum constraints
    baseOrb = this.applyConstraints(baseOrb, context.aspect);
    
    // Round to reasonable precision
    return Math.round(baseOrb * 10) / 10;
  }

  private getBaseOrb(context: OrbResolutionContext): number {
    const planetAName = typeof context.planetA === 'string' 
      ? context.planetA 
      : context.planetA.name;
    const planetBName = typeof context.planetB === 'string' 
      ? context.planetB 
      : context.planetB.name;

    // Try to get planet-specific orbs
    const orbA = this.getPlanetSpecificOrb(planetAName, context.aspect);
    const orbB = this.getPlanetSpecificOrb(planetBName, context.aspect);

    // Use the larger of the two planet-specific orbs, or aspect default
    if (orbA !== null && orbB !== null) {
      return Math.max(orbA, orbB);
    } else if (orbA !== null) {
      return orbA;
    } else if (orbB !== null) {
      return orbB;
    }

    // Fall back to aspect's default orb
    return context.aspect.orb;
  }

  private getPlanetSpecificOrb(planetName: string, aspect: Aspect): number | null {
    const planetCategory = this.getPlanetCategory(planetName);
    if (!planetCategory) return null;

    const categoryRules = this.orbConfiguration.planetCategories?.[planetCategory];
    if (!categoryRules) return null;

    // Try aspect-specific orb first
    const aspectOrb = categoryRules.aspectOrbs?.[aspect.name];
    if (aspectOrb !== undefined) return aspectOrb;

    // Fall back to category default orb
    return categoryRules.defaultOrb ?? null;
  }

  private applyClassificationMultipliers(orb: number, aspect: Aspect): number {
    if (!aspect.classification) return orb;

    const classificationRules = this.orbConfiguration.aspectClassification?.[aspect.classification];
    if (!classificationRules?.orbMultiplier) return orb;

    return orb * classificationRules.orbMultiplier;
  }

  private applyContextualMultipliers(orb: number, context: OrbResolutionContext): number {
    if (!context.chartType || context.chartType === 'natal') return orb;

    // Map 'transit' to 'transits' for the configuration key
    const configKey = context.chartType === 'transit' ? 'transits' : context.chartType;
    const contextRules = this.orbConfiguration.contextualOrbs?.[configKey as keyof NonNullable<typeof this.orbConfiguration.contextualOrbs>];
    if (!contextRules) return orb;

    // Apply aspect-specific multiplier if available
    const aspectMultiplier = contextRules.aspectMultipliers?.[context.aspect.name];
    if (aspectMultiplier) {
      return orb * aspectMultiplier;
    }

    // Fall back to general multiplier
    if (contextRules.orbMultiplier) {
      return orb * contextRules.orbMultiplier;
    }

    return orb;
  }

  private applyConstraints(orb: number, aspect: Aspect): number {
    const classificationRules = aspect.classification 
      ? this.orbConfiguration.aspectClassification?.[aspect.classification]
      : undefined;

    let constrainedOrb = orb;

    // Apply minimum constraint
    const minOrb = classificationRules?.minOrb;
    if (minOrb !== undefined && constrainedOrb < minOrb) {
      constrainedOrb = minOrb;
    }

    // Apply maximum constraint
    const maxOrb = classificationRules?.maxOrb;
    if (maxOrb !== undefined && constrainedOrb > maxOrb) {
      constrainedOrb = maxOrb;
    }

    // Global fallback if somehow orb is still invalid
    if (constrainedOrb <= 0) {
      constrainedOrb = this.orbConfiguration.globalFallbackOrb ?? 3;
    }

    return constrainedOrb;
  }

  private generateCacheKey(context: OrbResolutionContext): string {
    const planetAName = typeof context.planetA === 'string' 
      ? context.planetA 
      : context.planetA.name;
    const planetBName = typeof context.planetB === 'string' 
      ? context.planetB 
      : context.planetB.name;

    return `${planetAName}-${planetBName}-${context.aspect.name}-${context.chartType || 'natal'}`;
  }
}