import { chart2txt, formatChartToJson, ChartData } from '../src/index';

describe('Aspect Pattern Separation', () => {
  describe('Analysis Logic', () => {
    it('composite patterns should not include single-chart patterns', () => {
      const alice: ChartData = {
        name: 'Alice',
        planets: [
          { name: 'Mercury', degree: 25 },
          { name: 'Mars', degree: 207 },
          { name: 'Saturn', degree: 117 },
        ],
      };
      const jake: ChartData = {
        name: 'Jake',
        planets: [
          { name: 'Sun', degree: 0 },
          { name: 'Moon', degree: 60 },
          { name: 'Venus', degree: 120 },
        ],
      };

      const report = formatChartToJson([jake, alice], {
        includeAspectPatterns: true,
      });

      // Alice's individual analysis should have the T-Square
      const aliceAnalysis = report.chartAnalyses.find(
        (c) => c.chart.name === 'Alice'
      );
      expect(aliceAnalysis?.patterns.some((p) => p.type === 'T-Square')).toBe(
        true
      );

      // The pairwise composite analysis should NOT have any patterns
      const compositePatterns = report.pairwiseAnalyses[0]?.compositePatterns;
      expect(compositePatterns).toBeDefined();
      expect(compositePatterns.length).toBe(0);
    });

    it('global patterns should only include patterns spanning 3+ charts', () => {
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

      const report = formatChartToJson([chart1, chart2, chart3], {
        includeAspectPatterns: true,
      });

      // There should be a global analysis section
      expect(report.globalAnalysis).toBeDefined();

      // All patterns in the global section should involve at least 3 charts
      report.globalAnalysis?.patterns.forEach((pattern) => {
        const chartNames = new Set();
        // Simplified check; assumes pattern structure has planets with chartName
        JSON.stringify(pattern, (key, value) => {
          if (key === 'chartName' && value) {
            chartNames.add(value);
          }
          return value;
        });
        expect(chartNames.size).toBeGreaterThanOrEqual(3);
      });
    });
  });

  describe('Integration Test', () => {
    it('should correctly separate individual and composite patterns in text output', () => {
      const alice: ChartData = {
        name: 'Alice',
        planets: [
          { name: 'Mercury', degree: 25 },
          { name: 'Mars', degree: 207 },
          { name: 'Saturn', degree: 117 },
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };
      const jake: ChartData = {
        name: 'Jake',
        planets: [{ name: 'Sun', degree: 0 }],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const result = chart2txt([jake, alice], { includeAspectPatterns: true });

      // Alice's individual section should have the T-Square
      const aliceSection = result.substring(
        result.indexOf('[CHART: Alice]'),
        result.indexOf('[SYNASTRY: Jake-Alice]')
      );
      expect(aliceSection).toContain('T-Square:');

      // The composite section should not exist if there are no composite patterns
      expect(result).not.toContain('Jake-Alice Composite');
    });
  });
});
