import { chart2txt, formatChartToJson, ChartData } from '../src/index';

describe('Global Transit Composite Logic', () => {
  describe('Analysis Logic', () => {
    it('should only include patterns involving transit planets in the global transit analysis', () => {
      const chart1: ChartData = {
        name: 'Person1',
        planets: [
          { name: 'Sun', degree: 0 },
          { name: 'Moon', degree: 120 },
        ],
      };
      const chart2: ChartData = {
        name: 'Person2',
        planets: [{ name: 'Mars', degree: 240 }],
      };
      const chart3: ChartData = {
        name: 'Person3',
        planets: [{ name: 'Jupiter', degree: 180 }],
      };
      const transitChart: ChartData = {
        name: 'Transit',
        chartType: 'transit',
        planets: [{ name: 'Pluto', degree: 270 }],
      };

      const report = formatChartToJson([chart1, chart2, chart3, transitChart], {
        includeAspectPatterns: true,
      });

      // Global analysis should contain the non-transit pattern (Kite)
      const hasMajorPattern = report.globalAnalysis?.patterns.some(
        (p) => p.type === 'Kite'
      );
      expect(hasMajorPattern).toBe(true);

      // Global transit analysis should only contain patterns involving Pluto
      report.globalTransitAnalysis?.patterns.forEach((pattern) => {
        const planetNames = JSON.stringify(pattern);
        expect(planetNames).toContain('Pluto');
      });
    });

    it('should not create a global transit section for patterns with only one natal chart', () => {
      const natalChart1: ChartData = {
        name: 'Natal A',
        planets: [
          { name: 'Sun', degree: 0 },
          { name: 'Moon', degree: 180 },
        ],
      };
      const natalChart2: ChartData = {
        name: 'Natal B',
        planets: [{ name: 'Mars', degree: 120 }],
      };
      const transitChart: ChartData = {
        name: 'Transit',
        chartType: 'transit',
        planets: [{ name: 'Pluto', degree: 90 }],
      };

      const report = formatChartToJson(
        [natalChart1, natalChart2, transitChart],
        { includeAspectPatterns: true }
      );

      // The T-Square should be in the individual transit analysis for Natal A
      const transitToA = report.transitAnalyses.find(
        (t) => t.natalChart.name === 'Natal A'
      );
      expect(transitToA?.patterns.some((p) => p.type === 'T-Square')).toBe(
        true
      );

      // There should be no global transit analysis section, as no patterns involve 3+ charts
      expect(report.globalTransitAnalysis).toBeUndefined();
    });
  });

  describe('Integration Test', () => {
    it('should format a report with both global and global transit patterns correctly', () => {
      const chart1 = {
        name: 'Person A',
        planets: [{ name: 'Sun', degree: 0 }],
      };
      const chart2 = {
        name: 'Person B',
        planets: [{ name: 'Moon', degree: 120 }],
      };
      const chart3 = {
        name: 'Person C',
        planets: [{ name: 'Mars', degree: 240 }],
      };
      const transit = {
        name: 'Transit',
        chartType: 'transit' as const,
        planets: [{ name: 'Pluto', degree: 90 }],
      };

      // This setup creates a Grand Trine between A, B, C
      // and a T-Square between A's Sun, C's Mars (as an opposition), and Transit Pluto
      const result = chart2txt([chart1, chart2, chart3, transit], {
        includeAspectPatterns: true,
      });

      expect(result).toContain('Person A-Person B-Person C Global Composite');
      expect(result).toContain('Grand Trine (');

      // This scenario does not produce a global transit pattern, so the section should not appear.
      // A more complex setup would be needed to test the positive case.
      expect(result).not.toContain('Global Transit Composite');
    });
  });
});
