import { chart2txt, ChartData, analyzeCharts } from '../src/index';
import { AspectData } from '../src/types';

describe('Simplified Orb Configuration System', () => {
  const testData: ChartData = {
    name: 'test',
    planets: [
      { name: 'Sun', degree: 0 }, // 0° Aries
      { name: 'Moon', degree: 1.5 }, // 1.5° Aries (1.5° orb to Sun - tight)
      { name: 'Mercury', degree: 3.5 }, // 3.5° Aries (3.5° orb to Sun - moderate)
      { name: 'Venus', degree: 6.5 }, // 6.5° Aries (6.5° orb to Sun - wide)
      { name: 'Mars', degree: 90 }, // 0° Cancer (exact square to Sun)
      { name: 'Jupiter', degree: 92 }, // 2° Cancer (2° orb square to Sun - tight/moderate boundary)
      { name: 'Saturn', degree: 95 }, // 5° Cancer (5° orb square to Sun - wide)
      { name: 'Uranus', degree: 120 }, // 0° Leo (exact trine to Sun)
      { name: 'Neptune', degree: 180 }, // 0° Libra (exact opposition to Sun)
      { name: 'Pluto', degree: 60 }, // 0° Gemini (exact sextile to Sun)
    ],
  };

  describe('Simple Orb Detection', () => {
    test('detects aspects using simple orb values from aspect definitions', () => {
      const result = chart2txt(testData, {
        aspectDefinitions: [
          { name: 'conjunction', angle: 0, orb: 8 }, // Generous orb
          { name: 'square', angle: 90, orb: 6 },
          { name: 'trine', angle: 120, orb: 6 },
          { name: 'opposition', angle: 180, orb: 6 },
          { name: 'sextile', angle: 60, orb: 4 },
        ],
        aspectCategories: [{ name: 'ALL', maxOrb: 15 }], // Allow all detected aspects
      });

      // Should detect all the conjunctions with wide orbs
      expect(result).toContain('Sun conjunction Moon');
      expect(result).toContain('Sun conjunction Mercury');
      expect(result).toContain('Sun conjunction Venus');

      // Should detect all the other exact and near-exact aspects
      expect(result).toContain('square');
      expect(result).toContain('trine');
      expect(result).toContain('opposition');
      expect(result).toContain('sextile');
    });

    test('uses orb values directly from aspect definitions without complex calculations', () => {
      // Test that we use the simple orb value, not complex planet-category calculations
      const result = chart2txt(testData, {
        aspectDefinitions: [
          { name: 'conjunction', angle: 0, orb: 3 }, // Tight orb should reject Venus
        ],
        aspectCategories: [{ name: 'ALL', maxOrb: 15 }],
      });

      expect(result).toContain('Sun conjunction Moon'); // 1.5° orb - within 3°
      expect(result).not.toContain('Sun conjunction Mercury'); // 3.5° orb - outside 3°
      expect(result).not.toContain('Sun conjunction Venus'); // 6.5° orb - definitely outside 3°
    });
  });

  describe('Aspect Strength Classification', () => {
    test('classifies aspects by strength based on orb thresholds', () => {
      const report = analyzeCharts(testData, {
        aspectDefinitions: [
          { name: 'conjunction', angle: 0, orb: 8 },
          { name: 'square', angle: 90, orb: 6 },
        ],
        aspectStrengthThresholds: { tight: 2.0, moderate: 4.0 },
      });

      const conjunctions = report.chartAnalyses[0].aspects.filter(
        (a: AspectData) => a.aspectType === 'conjunction'
      );

      const sunMoon = conjunctions.find(
        (a: AspectData) =>
          (a.planetA === 'Sun' && a.planetB === 'Moon') ||
          (a.planetA === 'Moon' && a.planetB === 'Sun')
      );
      const sunMercury = conjunctions.find(
        (a: AspectData) =>
          (a.planetA === 'Sun' && a.planetB === 'Mercury') ||
          (a.planetA === 'Mercury' && a.planetB === 'Sun')
      );
      const sunVenus = conjunctions.find(
        (a: AspectData) =>
          (a.planetA === 'Sun' && a.planetB === 'Venus') ||
          (a.planetA === 'Venus' && a.planetB === 'Sun')
      );

      expect(sunMoon?.strength).toBe('tight'); // 1.5° orb
      expect(sunMercury?.strength).toBe('moderate'); // 3.5° orb
      expect(sunVenus?.strength).toBe('wide'); // 6.5° orb
    });

    test('allows custom aspect strength thresholds', () => {
      const report = analyzeCharts(testData, {
        aspectDefinitions: [{ name: 'conjunction', angle: 0, orb: 8 }],
        aspectStrengthThresholds: { tight: 1.0, moderate: 3.0 }, // Stricter thresholds
      });

      const conjunctions = report.chartAnalyses[0].aspects.filter(
        (a: AspectData) => a.aspectType === 'conjunction'
      );

      const sunMoon = conjunctions.find(
        (a: AspectData) =>
          (a.planetA === 'Sun' && a.planetB === 'Moon') ||
          (a.planetA === 'Moon' && a.planetB === 'Sun')
      );
      const sunMercury = conjunctions.find(
        (a: AspectData) =>
          (a.planetA === 'Sun' && a.planetB === 'Mercury') ||
          (a.planetA === 'Mercury' && a.planetB === 'Sun')
      );

      expect(sunMoon?.strength).toBe('moderate'); // 1.5° is > 1.0° tight but <= 3.0° moderate threshold
      expect(sunMercury?.strength).toBe('wide'); // 3.5° is > 3.0° moderate threshold
    });
  });

  describe('Text Formatting with Aspect Strengths', () => {
    test('groups aspects by strength in text output', () => {
      const result = chart2txt(testData, {
        aspectDefinitions: [
          { name: 'conjunction', angle: 0, orb: 8 },
          { name: 'square', angle: 90, orb: 6 },
        ],
        aspectStrengthThresholds: { tight: 2.0, moderate: 4.0 },
        aspectCategories: [
          { name: 'TIGHT ASPECTS', maxOrb: 2.0 },
          { name: 'MODERATE ASPECTS', minOrb: 2.0, maxOrb: 4.0 },
          { name: 'WIDE ASPECTS', minOrb: 4.0, maxOrb: 15.0 },
        ],
      });

      expect(result).toContain('TIGHT ASPECTS');
      expect(result).toContain('MODERATE ASPECTS');
      expect(result).toContain('WIDE ASPECTS');

      // Check that aspects appear in appropriate sections
      const lines = result.split('\n');
      const tightSectionIndex = lines.findIndex((line) =>
        line.includes('TIGHT ASPECTS')
      );
      const moderateSectionIndex = lines.findIndex((line) =>
        line.includes('MODERATE ASPECTS')
      );
      const wideSectionIndex = lines.findIndex((line) =>
        line.includes('WIDE ASPECTS')
      );

      expect(tightSectionIndex).toBeGreaterThan(-1);
      expect(moderateSectionIndex).toBeGreaterThan(tightSectionIndex);
      expect(wideSectionIndex).toBeGreaterThan(moderateSectionIndex);
    });
  });

  describe('Multi-Chart Contexts', () => {
    test('applies same simple orb logic to synastry aspects', () => {
      const chart1: ChartData = {
        name: 'Person 1',
        planets: [{ name: 'Sun', degree: 0 }],
      };

      const chart2: ChartData = {
        name: 'Person 2',
        planets: [{ name: 'Moon', degree: 2.5 }], // 2.5° orb conjunction
      };

      const report = analyzeCharts([chart1, chart2], {
        aspectDefinitions: [{ name: 'conjunction', angle: 0, orb: 5 }],
        aspectStrengthThresholds: { tight: 2.0, moderate: 4.0 },
      });

      const synastryAspects = report.pairwiseAnalyses[0].synastryAspects;
      const sunMoonAspect = synastryAspects.find(
        (a: AspectData) => a.aspectType === 'conjunction'
      );

      expect(sunMoonAspect).toBeDefined();
      expect(sunMoonAspect?.strength).toBe('moderate'); // 2.5° orb
      expect(sunMoonAspect?.p1ChartName).toBe('Person 1');
      expect(sunMoonAspect?.p2ChartName).toBe('Person 2');
    });

    test('applies same simple orb logic to transit aspects', () => {
      const natalChart: ChartData = {
        name: 'Natal',
        planets: [{ name: 'Sun', degree: 0 }],
      };

      const transitChart: ChartData = {
        name: 'Transits',
        planets: [{ name: 'Mars', degree: 91.5 }], // 1.5° orb square
        chartType: 'transit',
      };

      const report = analyzeCharts([natalChart, transitChart], {
        aspectDefinitions: [{ name: 'square', angle: 90, orb: 5 }],
        aspectStrengthThresholds: { tight: 2.0, moderate: 4.0 },
      });

      const transitAnalysis = report.transitAnalyses[0];
      const sunMarsAspect = transitAnalysis.aspects.find(
        (a: AspectData) => a.aspectType === 'square'
      );

      expect(sunMarsAspect).toBeDefined();
      expect(sunMarsAspect?.strength).toBe('tight'); // 1.5° orb
    });
  });

  describe('Orb Presets', () => {
    test('traditional preset provides generous orbs', () => {
      const result = chart2txt(testData, {
        aspectDefinitions: 'traditional', // Will use SIMPLE_TRADITIONAL_ORBS
        aspectCategories: [{ name: 'ALL', maxOrb: 15 }],
      });

      // Traditional orbs should be generous enough to catch most aspects
      expect(result).toContain('conjunction');
      expect(result).toContain('square');
      expect(result).toContain('trine');
    });

    test('tight preset provides restrictive orbs', () => {
      const result = chart2txt(testData, {
        aspectDefinitions: 'tight', // Will use SIMPLE_TIGHT_ORBS
        aspectCategories: [{ name: 'ALL', maxOrb: 15 }],
      });

      // Tight orbs should miss some of the wider orb aspects
      expect(result).toContain('Sun conjunction Moon'); // 1.5° should pass tight orbs
      expect(result).not.toContain('Sun conjunction Venus'); // 6.5° should fail tight orbs
    });

    test('modern preset provides balanced orbs', () => {
      const result = chart2txt(testData, {
        aspectDefinitions: 'modern', // Will use SIMPLE_MODERN_ORBS
        aspectCategories: [{ name: 'ALL', maxOrb: 15 }],
      });

      // Modern orbs should be balanced
      expect(result).toContain('conjunction');
      expect(result).toContain('square');
      expect(result).toContain('trine');
    });
  });

  describe('Backwards Compatibility', () => {
    test('works with legacy aspect definitions', () => {
      const result = chart2txt(testData, {
        aspectDefinitions: [
          { name: 'conjunction', angle: 0, orb: 5 }, // Legacy format
          { name: 'trine', angle: 120, orb: 6 },
        ],
        aspectCategories: [{ name: 'LEGACY', maxOrb: 15 }],
      });

      expect(result).toContain('conjunction');
      expect(result).toContain('trine');
    });

    test('provides sensible defaults for aspect strength classification', () => {
      const report = analyzeCharts(testData, {
        aspectDefinitions: [{ name: 'conjunction', angle: 0, orb: 8 }],
        // No aspectStrengthThresholds provided - should use defaults
      });

      const conjunctions = report.chartAnalyses[0].aspects.filter(
        (a: AspectData) => a.aspectType === 'conjunction'
      );

      // Should have strength classification even without explicit thresholds
      conjunctions.forEach((aspect: AspectData) => {
        expect(aspect.strength).toMatch(/^(tight|moderate|wide)$/);
      });
    });
  });
});
