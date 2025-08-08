import { chart2txt, formatChartToJson, ChartData } from '../src/index';

describe('Transit Pattern Consistency', () => {
  describe('Analysis Logic', () => {
    it('should generate transit aspect patterns for all applicable charts', () => {
      const natal1: ChartData = {
        name: 'Person1',
        planets: [
          { name: 'Sun', degree: 0 },
          { name: 'Moon', degree: 180 },
        ],
      };
      const natal2: ChartData = {
        name: 'Person2',
        planets: [{ name: 'Mars', degree: 30 }],
      }; // No patterns with transit
      const transit: ChartData = {
        name: 'Transit',
        chartType: 'transit',
        planets: [{ name: 'Pluto', degree: 90 }],
      };

      const report = formatChartToJson([natal1, natal2, transit], {
        includeAspectPatterns: true,
      });

      // Should be one transit analysis for each natal chart
      expect(report.transitAnalyses.length).toBe(2);

      const transitToP1 = report.transitAnalyses.find(
        (t) => t.natalChart.name === 'Person1'
      );
      const transitToP2 = report.transitAnalyses.find(
        (t) => t.natalChart.name === 'Person2'
      );

      // Person 1 should have a T-Square pattern with the transit
      expect(transitToP1).toBeDefined();
      expect(transitToP1?.patterns.length).toBe(1);
      expect(transitToP1?.patterns[0].type).toBe('T-Square');

      // Person 2 should have a transit analysis, but no patterns
      expect(transitToP2).toBeDefined();
      expect(transitToP2?.patterns.length).toBe(0);
    });
  });

  describe('Integration Test', () => {
    it('should format a report with multiple transit sections correctly', () => {
      const natal1: ChartData = {
        name: 'Person1',
        planets: [
          { name: 'Sun', degree: 0 },
          { name: 'Moon', degree: 180 },
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };
      const natal2: ChartData = {
        name: 'Person2',
        planets: [{ name: 'Mars', degree: 30 }],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };
      const transit: ChartData = {
        name: 'Transit',
        chartType: 'transit',
        planets: [{ name: 'Pluto', degree: 90 }],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const result = chart2txt([natal1, natal2, transit], {
        includeAspectPatterns: true,
      });

      // Check for the presence of both transit aspect sections
      expect(result).toContain('[ASPECT PATTERNS: Transit to Person1]');
      expect(result).toContain('[ASPECT PATTERNS: Transit to Person2]');

      // Check content of Person1's transit section
      const p1SectionStart = result.indexOf(
        '[ASPECT PATTERNS: Transit to Person1]'
      );
      const p1SectionEnd = result.indexOf(
        '[ASPECT PATTERNS: Transit to Person2]'
      );
      const p1Section = result.substring(p1SectionStart, p1SectionEnd);
      expect(p1Section).toContain('T-Square:');

      // Check content of Person2's transit section
      const p2SectionStart = result.indexOf(
        '[ASPECT PATTERNS: Transit to Person2]'
      );
      const p2Section = result.substring(p2SectionStart);
      expect(p2Section).toContain('No aspect patterns detected.');
    });
  });
});
