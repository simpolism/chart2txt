import {
  chart2txt,
  formatChartToJson,
  formatReportToText,
  ChartData,
  AstrologicalReport,
} from '../src/index';
import { ChartSettings } from '../src/config/ChartSettings';

describe('Aspects', () => {
  describe('Analysis Logic', () => {
    test('calculates aspects between planets', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 0 }, // 0° Aries
          { name: 'Moon', degree: 92 }, // 2° Cancer (square to Sun)
          { name: 'Venus', degree: 60 }, // 0° Gemini (sextile to Sun)
        ],
      };

      const report = formatChartToJson(data);
      const aspects = report.chartAnalyses[0].aspects;

      expect(
        aspects.some(
          (a) =>
            a.aspectType === 'square' &&
            a.planetA === 'Sun' &&
            a.planetB === 'Moon'
        )
      ).toBe(true);
      expect(
        aspects.some(
          (a) =>
            a.aspectType === 'sextile' &&
            a.planetA === 'Sun' &&
            a.planetB === 'Venus'
        )
      ).toBe(true);
    });

    test('filters out-of-sign aspects by default', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 28 }, // 28° Aries
          { name: 'Moon', degree: 32 }, // 2° Taurus (4° from Sun - close conjunction but different signs)
        ],
      };

      const report = formatChartToJson(data);
      const aspects = report.chartAnalyses[0].aspects;
      expect(aspects.length).toBe(0);
    });

    test('includes out-of-sign aspects when skipOutOfSignAspects is false', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 28 }, // 28° Aries
          { name: 'Moon', degree: 32 }, // 2° Taurus (4° from Sun - close conjunction but different signs)
        ],
      };

      const report = formatChartToJson(data, { skipOutOfSignAspects: false });
      const aspects = report.chartAnalyses[0].aspects;
      expect(aspects.length).toBe(1);
      expect(aspects[0].aspectType).toBe('conjunction');
    });

    test('correctly identifies applying vs separating aspects', () => {
      const applyingData: ChartData = {
        name: 'applying',
        planets: [
          { name: 'Sun', degree: 0.0, speed: 1.0 },
          { name: 'Moon', degree: 117.0, speed: 13.0 },
        ],
      };
      const separatingData: ChartData = {
        name: 'separating',
        planets: [
          { name: 'Sun', degree: 0.0, speed: 1.0 },
          { name: 'Moon', degree: 123.0, speed: 13.0 },
        ],
      };

      const applyingReport = formatChartToJson(applyingData, {
        skipOutOfSignAspects: false,
      });
      const separatingReport = formatChartToJson(separatingData, {
        skipOutOfSignAspects: false,
      });

      const applyingAspect = applyingReport.chartAnalyses[0].aspects.find(
        (a) => a.aspectType === 'trine'
      );
      const separatingAspect = separatingReport.chartAnalyses[0].aspects.find(
        (a) => a.aspectType === 'trine'
      );

      expect(applyingAspect?.application).toBe('applying');
      expect(separatingAspect?.application).toBe('separating');
    });

    test('correctly handles retrograde planets in aspect application', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 0.0, speed: 1.0 }, // 0° Aries, direct
          { name: 'Mars', degree: 93.0, speed: -0.5 }, // 3° Cancer, retrograde
        ],
      };

      const report = formatChartToJson(data, { skipOutOfSignAspects: false });
      const aspect = report.chartAnalyses[0].aspects.find(
        (a) => a.aspectType === 'square'
      );
      expect(aspect?.application).toBe('applying');
    });

    test('calculates aspects to Ascendant and Midheaven', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 0.0 },
          { name: 'Moon', degree: 90.0 },
        ],
        ascendant: 180.0,
        midheaven: 270.0,
      };

      const report = formatChartToJson(data);
      const aspects = report.chartAnalyses[0].aspects;

      expect(
        aspects.some(
          (a) =>
            a.planetA === 'Sun' &&
            a.planetB === 'Ascendant' &&
            a.aspectType === 'opposition'
        )
      ).toBe(true);
      expect(
        aspects.some(
          (a) =>
            a.planetA === 'Moon' &&
            a.planetB === 'Ascendant' &&
            a.aspectType === 'square'
        )
      ).toBe(true);
      expect(
        aspects.some(
          (a) =>
            a.planetA === 'Sun' &&
            a.planetB === 'Midheaven' &&
            a.aspectType === 'square'
        )
      ).toBe(true);
      expect(
        aspects.some(
          (a) =>
            a.planetA === 'Ascendant' &&
            a.planetB === 'Midheaven' &&
            a.aspectType === 'square'
        )
      ).toBe(true);
    });
  });

  describe('Formatting Logic', () => {
    test('formats a report with aspects correctly', () => {
      const report: AstrologicalReport = {
        settings: new ChartSettings(),
        chartAnalyses: [
          {
            chart: {
              name: 'test',
              planets: [
                { name: 'Sun', degree: 0 },
                { name: 'Moon', degree: 90 },
              ],
            },
            placements: {
              planets: [
                { name: 'Sun', degree: 0, sign: 'Aries', house: 1 },
                { name: 'Moon', degree: 90, sign: 'Cancer', house: 4 },
              ],
            },
            aspects: [
              {
                planetA: 'Sun',
                planetB: 'Moon',
                aspectType: 'square',
                orb: 0,
                p1ChartName: 'test',
                p2ChartName: 'test',
              },
            ],
            patterns: [],
            stelliums: [],
            signDistributions: { elements: {}, modalities: {}, polarities: {} },
            dispositors: {},
          },
        ],
        pairwiseAnalyses: [],
        transitAnalyses: [],
      };

      const result = formatReportToText(report);
      expect(result).toContain('[ASPECTS]');
      expect(result).toContain('Sun square Moon');
    });

    test('formats a report with no aspects correctly', () => {
      const report: AstrologicalReport = {
        settings: new ChartSettings(),
        chartAnalyses: [
          {
            chart: {
              name: 'test',
              planets: [
                { name: 'Sun', degree: 0 },
                { name: 'Moon', degree: 45 },
              ],
            },
            placements: {
              planets: [
                { name: 'Sun', degree: 0, sign: 'Aries', house: 1 },
                { name: 'Moon', degree: 45, sign: 'Taurus', house: 2 },
              ],
            },
            aspects: [],
            patterns: [],
            stelliums: [],
            signDistributions: { elements: {}, modalities: {}, polarities: {} },
            dispositors: {},
          },
        ],
        pairwiseAnalyses: [],
        transitAnalyses: [],
      };

      const result = formatReportToText(report);
      expect(result).toContain('[ASPECTS]');
      expect(result).toContain('None');
    });
  });

  // Keep one or two end-to-end tests for integration purposes
  describe('Integration Tests', () => {
    test('handles complex out-of-sign case correctly from end-to-end', () => {
      const data: ChartData = {
        name: 'Saturn-Venus Bug Test',
        planets: [
          { name: 'Venus', degree: 54.17 }, // 24° Taurus
          { name: 'Saturn', degree: 329.99 }, // 29° Aquarius
        ],
      };

      const result = chart2txt(data, {
        skipOutOfSignAspects: false, // Ensure it's not skipped for this test
        aspectDefinitions: [{ name: 'square', angle: 90, orb: 6 }],
        aspectCategories: [{ name: 'WIDE', maxOrb: 6 }],
      });

      expect(result).toContain('[ASPECTS]');
      expect(result).toMatch(/(?:Saturn square Venus|Venus square Saturn)/);
    });
  });
});
