import {
  analyzeCharts,
  formatReportToText,
  groupAspects,
  ChartData,
  AstrologicalReport,
  AspectData,
  Settings,
} from '../src/index';
import { ChartSettings } from '../src/config/ChartSettings';

describe('Aspects', () => {
  describe('Analysis Logic (analyzeCharts)', () => {
    it('calculates aspects between planets', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 0 },
          { name: 'Moon', degree: 92 },
        ],
      };
      const report = analyzeCharts(data);
      const aspects = report.chartAnalyses[0].aspects;
      expect(aspects.some((a) => a.aspectType === 'square')).toBe(true);
    });

    it('filters out-of-sign aspects by default', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 28 },
          { name: 'Moon', degree: 32 },
        ],
      };
      const report = analyzeCharts(data);
      expect(report.chartAnalyses[0].aspects.length).toBe(0);
    });

    it('includes out-of-sign aspects when skipOutOfSignAspects is false', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 28 },
          { name: 'Moon', degree: 32 },
        ],
      };
      const report = analyzeCharts(data, { skipOutOfSignAspects: false });
      expect(report.chartAnalyses[0].aspects.length).toBe(1);
    });
  });

  describe('Grouping Logic (groupAspects)', () => {
    it('groups aspects using default categories', () => {
      const aspects: AspectData[] = [
        {
          planetA: 'Sun',
          planetB: 'Moon',
          aspectType: 'conjunction',
          orb: 1.5,
          p1ChartName: 'test',
          p2ChartName: 'test',
          application: 'applying',
        },
        {
          planetA: 'Sun',
          planetB: 'Mars',
          aspectType: 'square',
          orb: 3.5,
          p1ChartName: 'test',
          p2ChartName: 'test',
          application: 'applying',
        },
        {
          planetA: 'Sun',
          planetB: 'Venus',
          aspectType: 'trine',
          orb: 5.5,
          p1ChartName: 'test',
          p2ChartName: 'test',
          application: 'applying',
        },
      ];
      const settings = new ChartSettings();
      const grouped = groupAspects(aspects, settings as Settings);

      expect(grouped.has('[TIGHT ASPECTS: orb under 2.0°]')).toBe(true);
      expect(grouped.has('[MODERATE ASPECTS: orb 2.0-4.0°]')).toBe(true);
      expect(grouped.has('[WIDE ASPECTS: orb over 4.0°]')).toBe(true);

      expect(grouped.get('[TIGHT ASPECTS: orb under 2.0°]')?.[0].planetB).toBe(
        'Moon'
      );
      expect(grouped.get('[MODERATE ASPECTS: orb 2.0-4.0°]')?.[0].planetB).toBe(
        'Mars'
      );
      expect(grouped.get('[WIDE ASPECTS: orb over 4.0°]')?.[0].planetB).toBe(
        'Venus'
      );
    });
  });

  describe('Formatting Logic (formatReportToText)', () => {
    it('formats a report with pre-grouped aspects correctly', () => {
      const analysis = analyzeCharts({ name: 'test', planets: [] });
      const grouped = new Map<string, AspectData[]>();
      grouped.set('[MY CUSTOM CATEGORY]', [
        {
          planetA: 'Sun',
          planetB: 'Moon',
          aspectType: 'square',
          orb: 0,
          p1ChartName: 'test',
          p2ChartName: 'test',
          application: 'exact',
        },
      ]);
      analysis.chartAnalyses[0].groupedAspects = grouped;

      const result = formatReportToText(analysis);
      expect(result).toContain('[MY CUSTOM CATEGORY]');
      expect(result).toContain('Sun square Moon');
    });
  });
});
