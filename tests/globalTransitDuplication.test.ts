import {
  chart2txt,
  analyzeCharts,
  ChartData,
  AspectPattern,
  TransitAnalysis,
} from '../src/index';

describe('Global Transit Duplication', () => {
  describe('Analysis Logic', () => {
    it('should not duplicate patterns between global transit and individual transit analyses', () => {
      const natalA: ChartData = {
        name: 'Natal A',
        planets: [
          { name: 'Sun', degree: 0 },
          { name: 'Moon', degree: 120 },
        ],
      };
      const natalB: ChartData = {
        name: 'Natal B',
        planets: [{ name: 'Mars', degree: 240 }],
      };
      const transit: ChartData = {
        name: 'Transit',
        chartType: 'transit',
        planets: [
          { name: 'Saturn', degree: 180 }, // Creates a Kite with the Grand Trine
        ],
      };

      const report = analyzeCharts([natalA, natalB, transit], {
        includeAspectPatterns: true,
      });

      // The global transit analysis should contain the Kite
      expect(report.globalTransitAnalysis).toBeDefined();
      expect(report.globalTransitAnalysis?.patterns.length).toBe(1);
      const kite = report.globalTransitAnalysis?.patterns.find(
        (p: AspectPattern) => p.type === 'Kite'
      );
      expect(kite).toBeDefined();

      // The individual transit analyses should NOT contain the Kite
      // because it's a global pattern involving more than 2 charts.
      const transitToA = report.transitAnalyses.find(
        (t: TransitAnalysis) => t.natalChart.name === 'Natal A'
      );
      const transitToB = report.transitAnalyses.find(
        (t: TransitAnalysis) => t.natalChart.name === 'Natal B'
      );
      expect(transitToA?.patterns.length).toBe(0);
      expect(transitToB?.patterns.length).toBe(0);
    });
  });

  describe('Integration Test', () => {
    it('should format the report without duplicating patterns', () => {
      const natalA: ChartData = {
        name: 'Natal A',
        planets: [
          { name: 'Sun', degree: 0 },
          { name: 'Moon', degree: 120 },
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };
      const natalB: ChartData = {
        name: 'Natal B',
        planets: [{ name: 'Mars', degree: 240 }],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };
      const transit: ChartData = {
        name: 'Transit',
        chartType: 'transit',
        planets: [{ name: 'Saturn', degree: 180 }],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const result = chart2txt([natalA, natalB, transit], {
        includeAspectPatterns: true,
      });

      // The global transit section should contain the Kite
      expect(result).toContain(
        '[ASPECT PATTERNS: Natal A-Natal B-Transit Global Transit Composite]'
      );
      expect(result).toContain('Kite (');

      // The individual transit sections should not
      expect(result).toContain('[ASPECT PATTERNS: Transit to Natal A]');
      expect(result).toContain('[ASPECT PATTERNS: Transit to Natal B]');

      const transitToASection = result.substring(
        result.indexOf('[ASPECT PATTERNS: Transit to Natal A]'),
        result.indexOf('[ASPECT PATTERNS: Transit to Natal B]')
      );
      expect(transitToASection).toContain('No T-Squares detected.');
      expect(transitToASection).toContain('No Grand Trines detected.');
    });
  });
});
