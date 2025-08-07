import { chart2txt, ChartData } from '../src/index';
import { AspectClassification, PlanetCategory } from '../src/types';
import {
  TRADITIONAL_ORB_CONFIG,
  MODERN_ORB_CONFIG,
  TIGHT_ORB_CONFIG,
  TRADITIONAL_ASPECTS,
} from '../src/constants';
import { OrbResolver } from '../src/core/orbResolver';

describe('Enhanced Orb Configuration System', () => {
  const testData: ChartData = {
    name: 'test',
    planets: [
      { name: 'Sun', degree: 0 }, // 0° Aries (Luminary)
      { name: 'Moon', degree: 6 }, // 6° Aries (Luminary) - 6° orb to Sun
      { name: 'Mercury', degree: 90 }, // 0° Cancer (Personal) - square to Sun
      { name: 'Venus', degree: 60 }, // 0° Gemini (Personal) - sextile to Sun
      { name: 'Mars', degree: 120 }, // 0° Leo (Personal) - trine to Sun
      { name: 'Jupiter', degree: 180 }, // 0° Libra (Social) - opposition to Sun
      { name: 'Saturn', degree: 270 }, // 0° Capricorn (Social) - square to Sun
      { name: 'Uranus', degree: 150 }, // 0° Virgo (Outer) - quincunx to Sun
      { name: 'Neptune', degree: 30 }, // 0° Taurus (Outer) - semi-sextile to Sun
      { name: 'Pluto', degree: 45 }, // 15° Taurus (Outer) - semi-square to Sun
    ],
  };

  describe('OrbResolver class', () => {
    test('resolves luminaries with larger orbs', () => {
      const orbResolver = new OrbResolver(TRADITIONAL_ORB_CONFIG);

      const sunMoonContext = {
        chartType: 'natal' as const,
        planetA: 'Sun',
        planetB: 'Moon',
        aspect: {
          name: 'conjunction',
          angle: 0,
          orb: 5,
          classification: AspectClassification.Major,
        },
      };

      const orb = orbResolver.resolveOrb(sunMoonContext);
      expect(orb).toBe(10); // Luminaries get 10° orb from TRADITIONAL_ORB_CONFIG
    });

    test('applies aspect classification multipliers', () => {
      const orbResolver = new OrbResolver(MODERN_ORB_CONFIG);

      const minorAspectContext = {
        chartType: 'natal' as const,
        planetA: 'Mercury',
        planetB: 'Venus',
        aspect: {
          name: 'sextile',
          angle: 60,
          orb: 4,
          classification: AspectClassification.Minor,
        },
      };

      const orb = orbResolver.resolveOrb(minorAspectContext);
      // Personal planets: 6° base, Minor aspects: 0.6 multiplier = 3.6°
      expect(orb).toBe(3.6);
    });

    test('applies contextual orb multipliers for synastry', () => {
      const orbResolver = new OrbResolver(TRADITIONAL_ORB_CONFIG);

      const synastryContext = {
        chartType: 'synastry' as const,
        planetA: 'Sun',
        planetB: 'Moon',
        aspect: {
          name: 'conjunction',
          angle: 0,
          orb: 5,
          classification: AspectClassification.Major,
        },
      };

      const orb = orbResolver.resolveOrb(synastryContext);
      // Luminaries: 10° base, Synastry: 0.9 multiplier = 9.0°
      expect(orb).toBe(9);
    });

    test('uses planet category mapping correctly', () => {
      const orbResolver = new OrbResolver(TIGHT_ORB_CONFIG);

      expect(orbResolver.getPlanetCategory('Sun')).toBe(
        PlanetCategory.Luminaries
      );
      expect(orbResolver.getPlanetCategory('Mercury')).toBe(
        PlanetCategory.Personal
      );
      expect(orbResolver.getPlanetCategory('Jupiter')).toBe(
        PlanetCategory.Social
      );
      expect(orbResolver.getPlanetCategory('Uranus')).toBe(
        PlanetCategory.Outer
      );
      expect(orbResolver.getPlanetCategory('Ascendant')).toBe(
        PlanetCategory.Angles
      );
    });

    test('handles cache correctly', () => {
      const orbResolver = new OrbResolver(MODERN_ORB_CONFIG);

      const context = {
        chartType: 'natal' as const,
        planetA: 'Sun',
        planetB: 'Mars',
        aspect: {
          name: 'trine',
          angle: 120,
          orb: 6,
          classification: AspectClassification.Major,
        },
      };

      const orb1 = orbResolver.resolveOrb(context);
      const orb2 = orbResolver.resolveOrb(context); // Should hit cache

      expect(orb1).toBe(orb2);
      expect(typeof orb1).toBe('number');
    });
  });

  describe('Traditional Orb Configuration', () => {
    test('uses traditional orbs with Sun-Moon conjunction', () => {
      const result = chart2txt(testData, {
        aspectDefinitions: TRADITIONAL_ASPECTS,
        orbConfiguration: TRADITIONAL_ORB_CONFIG,
        aspectCategories: [{ name: 'WIDE', maxOrb: 15 }], // Allow wide orbs for this test
      });

      // Sun-Moon should have 6° orb, which is within the 10° limit for luminaries
      expect(result).toContain('Sun conjunction Moon');
    });

    test('gives outer planets smaller orbs', () => {
      const result = chart2txt(testData, {
        aspectDefinitions: [
          {
            name: 'semi-sextile',
            angle: 30,
            orb: 6,
            classification: AspectClassification.Minor,
          },
        ],
        orbConfiguration: TRADITIONAL_ORB_CONFIG,
        aspectCategories: [{ name: 'ALL', maxOrb: 15 }], // Allow detection
      });

      // Neptune semi-sextile (30°) to Sun: outer planet gets 3° * 0.75 (minor) = 2.25° max orb
      // But actual orb is 30° - 30° = 0°, so it should be included
      expect(result).toContain('semi-sextile');
    });
  });

  describe('Modern Orb Configuration', () => {
    test('applies minor aspect orb reductions', () => {
      const result = chart2txt(testData, {
        aspectDefinitions: [
          {
            name: 'sextile',
            angle: 60,
            orb: 4,
            classification: AspectClassification.Minor,
          },
        ],
        orbConfiguration: MODERN_ORB_CONFIG,
        aspectCategories: [{ name: 'ALL', maxOrb: 15 }], // Allow detection
      });

      // Venus sextile to Sun: Personal planet (6°) * Minor aspect (0.6) = 3.6° max orb
      // Actual orb is 0°, so should be included
      expect(result).toContain('sextile');
    });
  });

  describe('Tight Orb Configuration', () => {
    test('restricts aspects with tight orbs', () => {
      const result = chart2txt(testData, {
        aspectDefinitions: [
          {
            name: 'conjunction',
            angle: 0,
            orb: 5,
            classification: AspectClassification.Major,
          },
        ],
        orbConfiguration: TIGHT_ORB_CONFIG,
        aspectCategories: [{ name: 'ALL', maxOrb: 15 }], // Allow detection
      });

      // Sun-Moon conjunction with 6° orb should be rejected (luminaries get max 5° in tight config)
      expect(result).not.toContain('Sun conjunction Moon');
    });

    test('applies maximum orb constraints', () => {
      const orbResolver = new OrbResolver(TIGHT_ORB_CONFIG);

      const context = {
        chartType: 'natal' as const,
        planetA: 'Sun',
        planetB: 'Moon',
        aspect: {
          name: 'conjunction',
          angle: 0,
          orb: 8,
          classification: AspectClassification.Major,
        },
      };

      const orb = orbResolver.resolveOrb(context);
      // Should be capped at 5° maximum for major aspects in tight config
      expect(orb).toBeLessThanOrEqual(5);
    });
  });

  describe('Backwards Compatibility', () => {
    test('works with legacy aspect definitions without orb configuration', () => {
      const result = chart2txt(testData, {
        aspectDefinitions: [
          { name: 'conjunction', angle: 0, orb: 8 }, // Legacy format without classification
        ],
        aspectCategories: [{ name: 'LEGACY', maxOrb: 15 }], // Allow detection
      });

      // Should still work with traditional orb from aspect definition
      expect(result).toContain('Sun conjunction Moon');
    });

    test('falls back to aspect orb when no orb configuration provided', () => {
      const result = chart2txt(testData, {
        aspectDefinitions: [
          { name: 'trine', angle: 120, orb: 3 }, // Tight orb in aspect definition
        ],
        // No orbConfiguration provided
      });

      // Should use the 3° orb from the aspect definition, so Mars trine (0° orb) should be included
      expect(result).toContain('trine');
    });
  });

  describe('Synastry and Transit Contexts', () => {
    test('applies different orbs for synastry', () => {
      const chart1: ChartData = {
        name: 'Person 1',
        planets: [{ name: 'Sun', degree: 0 }],
      };

      const chart2: ChartData = {
        name: 'Person 2',
        planets: [{ name: 'Moon', degree: 7 }], // 7° orb
      };

      const result = chart2txt([chart1, chart2], {
        aspectDefinitions: [
          {
            name: 'conjunction',
            angle: 0,
            orb: 5,
            classification: AspectClassification.Major,
          },
        ],
        orbConfiguration: TRADITIONAL_ORB_CONFIG, // Synastry multiplier: 0.9
        aspectCategories: [{ name: 'SYNASTRY', maxOrb: 15 }], // Allow detection
      });

      // Luminaries: 10° * 0.9 = 9° max orb for synastry
      // 7° actual orb should be within limits
      expect(result).toContain('conjunction');
    });

    test('applies different orbs for transits', () => {
      const natalChart: ChartData = {
        name: 'Natal',
        planets: [{ name: 'Sun', degree: 0 }],
      };

      const transitChart: ChartData = {
        name: 'Transits',
        planets: [{ name: 'Mars', degree: 8 }], // 8° orb
        chartType: 'transit',
      };

      const result = chart2txt([natalChart, transitChart], {
        aspectDefinitions: [
          {
            name: 'conjunction',
            angle: 0,
            orb: 5,
            classification: AspectClassification.Major,
          },
        ],
        orbConfiguration: TRADITIONAL_ORB_CONFIG, // Transit multiplier: 1.2
        aspectCategories: [{ name: 'TRANSITS', maxOrb: 15 }], // Allow detection
      });

      // Luminaries: 10° * 1.2 = 12° max orb for transits
      // 8° actual orb should be within limits
      expect(result).toContain('conjunction');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('handles unknown planet names gracefully', () => {
      const orbResolver = new OrbResolver(MODERN_ORB_CONFIG);

      const context = {
        chartType: 'natal' as const,
        planetA: 'UnknownPlanet',
        planetB: 'AnotherUnknown',
        aspect: {
          name: 'conjunction',
          angle: 0,
          orb: 5,
          classification: AspectClassification.Major,
        },
      };

      const orb = orbResolver.resolveOrb(context);
      // Should fall back to aspect orb
      expect(orb).toBe(5);
    });

    test('handles missing orb configuration gracefully', () => {
      const orbResolver = new OrbResolver(); // Empty configuration

      const context = {
        chartType: 'natal' as const,
        planetA: 'Sun',
        planetB: 'Moon',
        aspect: {
          name: 'conjunction',
          angle: 0,
          orb: 6,
          classification: AspectClassification.Major,
        },
      };

      const orb = orbResolver.resolveOrb(context);
      // Should fall back to aspect orb
      expect(orb).toBe(6);
    });

    test('applies global fallback orb when needed', () => {
      const configWithFallback = {
        ...TIGHT_ORB_CONFIG,
        globalFallbackOrb: 2,
      };

      const orbResolver = new OrbResolver(configWithFallback);

      const context = {
        chartType: 'natal' as const,
        planetA: 'UnknownPlanet',
        planetB: 'AnotherUnknown',
        aspect: { name: 'conjunction', angle: 0, orb: 0 }, // Invalid orb
      };

      const orb = orbResolver.resolveOrb(context);
      expect(orb).toBeGreaterThan(0); // Should use fallback
    });
  });
});
