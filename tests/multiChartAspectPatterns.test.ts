import {
  chart2txt,
  formatChartToJson,
  ChartData,
  AspectPattern,
  TSquare,
} from '../src/index';

describe('MultiChart Aspect Pattern Detection', () => {
  describe('Analysis Logic', () => {
    it('should detect T-Square patterns in synastry', () => {
      const chart1: ChartData = {
        name: 'Person A',
        planets: [
          { name: 'Sun', degree: 0 },
          { name: 'Moon', degree: 180 },
        ],
      };
      const chart2: ChartData = {
        name: 'Person B',
        planets: [{ name: 'Mars', degree: 90 }],
      };

      const report = formatChartToJson([chart1, chart2], {
        includeAspectPatterns: true,
      });
      const compositePatterns = report.pairwiseAnalyses[0]?.compositePatterns;

      expect(compositePatterns).toBeDefined();
      expect(compositePatterns.length).toBe(1);
      const tSquare = compositePatterns[0] as TSquare;
      expect(tSquare.type).toBe('T-Square');
      expect(tSquare.apex.name).toBe('Mars');
      expect(tSquare.apex.chartName).toBe('Person B');
    });

    it('should detect Grand Trine patterns across three charts', () => {
      const chart1: ChartData = {
        name: 'Person A',
        planets: [{ name: 'Sun', degree: 0 }],
      };
      const chart2: ChartData = {
        name: 'Person B',
        planets: [{ name: 'Moon', degree: 120 }],
      };
      const chart3: ChartData = {
        name: 'Person C',
        planets: [{ name: 'Jupiter', degree: 240 }],
      };

      const report = formatChartToJson([chart1, chart2, chart3], {
        includeAspectPatterns: true,
      });
      const globalPatterns = report.globalAnalysis?.patterns;

      expect(globalPatterns).toBeDefined();
      if (globalPatterns) {
        expect(globalPatterns.length).toBe(1);
        expect(globalPatterns[0].type).toBe('Grand Trine');
      }
    });

    it('should detect T-Square patterns with transits', () => {
      const natalChart: ChartData = {
        name: 'Natal',
        planets: [
          { name: 'Sun', degree: 0 },
          { name: 'Moon', degree: 180 },
        ],
      };
      const transitChart: ChartData = {
        name: 'Transit',
        chartType: 'transit',
        planets: [{ name: 'Pluto', degree: 90 }],
      };

      const report = formatChartToJson([natalChart, transitChart], {
        includeAspectPatterns: true,
      });
      const transitPatterns = report.transitAnalyses[0]?.patterns;

      expect(transitPatterns).toBeDefined();
      expect(transitPatterns.length).toBe(1);
      const tSquare = transitPatterns[0] as TSquare;
      expect(tSquare.type).toBe('T-Square');
      expect(tSquare.apex.name).toBe('Pluto');
      expect(tSquare.apex.chartName).toBe('Transit');
    });
  });

  // Keep a few end-to-end tests for integration validation
  describe('Integration Tests', () => {
    it('should format a synastry T-Square correctly', () => {
      const chart1: ChartData = {
        name: 'Person A',
        planets: [
          { name: 'Sun', degree: 0 },
          { name: 'Moon', degree: 180 },
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };
      const chart2: ChartData = {
        name: 'Person B',
        planets: [{ name: 'Mars', degree: 90 }],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const result = chart2txt([chart1, chart2], {
        includeAspectPatterns: true,
      });

      expect(result).toContain(
        '[ASPECT PATTERNS: Person A-Person B Composite]'
      );
      expect(result).toContain('T-Square:');
      expect(result).toContain("Apex: Person B's Mars 0° Cancer");
    });

    it('should format a global Grand Trine correctly', () => {
      const chart1: ChartData = {
        name: 'Person A',
        planets: [{ name: 'Sun', degree: 0 }],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };
      const chart2: ChartData = {
        name: 'Person B',
        planets: [{ name: 'Moon', degree: 120 }],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };
      const chart3: ChartData = {
        name: 'Person C',
        planets: [{ name: 'Jupiter', degree: 240 }],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const result = chart2txt([chart1, chart2, chart3], {
        includeAspectPatterns: true,
      });

      expect(result).toContain(
        '[ASPECT PATTERNS: Person A-Person B-Person C Global Composite]'
      );
      expect(result).toContain('Grand Trine:');
      expect(result).toContain("Planet 1: Person A's Sun 0° Aries");
    });
  });
});
