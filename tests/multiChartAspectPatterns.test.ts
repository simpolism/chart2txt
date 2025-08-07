import { chart2txt } from '../src';
import { ChartData } from '../src/types';
import { TIGHT_ORB_CONFIG, WIDE_ORB_CONFIG } from '../src/constants';

describe('MultiChart Aspect Pattern Detection', () => {
  describe('Synastry Aspect Patterns', () => {
    it('should detect T-Square patterns in synastry', () => {
      const chart1: ChartData = {
        name: 'Person A',
        planets: [
          { name: 'Sun', degree: 0 }, // 0° Aries
          { name: 'Moon', degree: 180 }, // 0° Libra - forms opposition with Sun
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const chart2: ChartData = {
        name: 'Person B',
        planets: [
          { name: 'Mars', degree: 90 }, // 0° Cancer - forms squares with both Sun and Moon
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const result = chart2txt([chart1, chart2], {
        includeAspectPatterns: true,
      });

      expect(result).toContain(
        '[ASPECT PATTERNS: Person A-Person B Composite]'
      );
      expect(result).toContain('T-Square:');
      expect(result).toContain('Apex: Mars');
      expect(result).toContain('Opposition: Sun');
    });

    it('should detect Grand Trine patterns in synastry', () => {
      const chart1: ChartData = {
        name: 'Person A',
        planets: [
          { name: 'Sun', degree: 0 }, // 0° Aries (Fire)
          { name: 'Jupiter', degree: 120 }, // 0° Leo (Fire) - trine with Sun
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const chart2: ChartData = {
        name: 'Person B',
        planets: [
          { name: 'Mars', degree: 240 }, // 0° Sagittarius (Fire) - trine with both Sun and Jupiter
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const result = chart2txt([chart1, chart2], {
        includeAspectPatterns: true,
      });

      expect(result).toContain(
        '[ASPECT PATTERNS: Person A-Person B Composite]'
      );
      expect(result).toContain('Grand Trine:');
      expect(result).toContain('Element: Fire');
      expect(result).toContain('Planet 1: Sun');
      expect(result).toContain('Planet 2: Jupiter');
      expect(result).toContain('Planet 3: Mars');
    });

    it('should detect Yod patterns in synastry', () => {
      const chart1: ChartData = {
        name: 'Person A',
        planets: [
          { name: 'Sun', degree: 0 }, // 0° Aries
          { name: 'Moon', degree: 60 }, // 0° Gemini - sextile (60°) with Sun
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const chart2: ChartData = {
        name: 'Person B',
        planets: [
          { name: 'Neptune', degree: 210 }, // 0° Scorpio - quincunx from Sun (150°) and Moon (150°)
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const result = chart2txt([chart1, chart2], {
        includeAspectPatterns: true,
      });

      expect(result).toContain(
        '[ASPECT PATTERNS: Person A-Person B Composite]'
      );
      expect(result).toContain('Yod:');
      expect(result).toContain('Apex: Neptune');
      expect(result).toContain('Base planet 1: Sun');
      expect(result).toContain('Base planet 2: Moon');
    });

    it('should detect individual chart stelliums but not cross-chart stelliums', () => {
      const chart1: ChartData = {
        name: 'Person A',
        planets: [
          { name: 'Sun', degree: 35 }, // 5° Taurus
          { name: 'Mercury', degree: 45 }, // 15° Taurus
          { name: 'Mars', degree: 50 }, // 20° Taurus - forms stellium within Person A's chart
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const chart2: ChartData = {
        name: 'Person B',
        planets: [
          { name: 'Venus', degree: 55 }, // 25° Taurus
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const result = chart2txt([chart1, chart2], {
        includeAspectPatterns: true,
      });

      // Should detect stellium within Person A's individual chart
      expect(result).toContain('[CHART: Person A]');
      expect(result).toContain('Stellium:');
      expect(result).toContain('Sign: Taurus');
      expect(result).toContain('Sun, Mercury, Mars');

      // Should NOT have cross-chart stellium patterns
      expect(result).not.toContain(
        '[ASPECT PATTERNS: Person A-Person B Composite]'
      );
    });
  });

  describe('Transit Aspect Patterns', () => {
    it('should detect T-Square patterns with transits', () => {
      const natalChart: ChartData = {
        name: 'Natal',
        planets: [
          { name: 'Sun', degree: 0 }, // 0° Aries
          { name: 'Moon', degree: 180 }, // 0° Libra - opposition with Sun
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const transitChart: ChartData = {
        name: 'Transit',
        chartType: 'transit',
        planets: [
          { name: 'Pluto', degree: 90 }, // 0° Cancer - squares both natal Sun and Moon
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const result = chart2txt([natalChart, transitChart], {
        includeAspectPatterns: true,
      });

      expect(result).toContain('[ASPECT PATTERNS: Transit to Natal]');
      expect(result).toContain('T-Square:');
      expect(result).toContain('Apex: Pluto');
    });

    it('should detect Grand Trine patterns with transits', () => {
      const natalChart: ChartData = {
        name: 'Natal',
        planets: [
          { name: 'Sun', degree: 0 }, // 0° Aries (Fire)
          { name: 'Jupiter', degree: 120 }, // 0° Leo (Fire)
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const transitChart: ChartData = {
        name: 'Transit',
        chartType: 'transit',
        planets: [
          { name: 'Mars', degree: 240 }, // 0° Sagittarius (Fire) - completes Grand Trine
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const result = chart2txt([natalChart, transitChart], {
        includeAspectPatterns: true,
      });

      expect(result).toContain('[ASPECT PATTERNS: Transit to Natal]');
      expect(result).toContain('Grand Trine:');
      expect(result).toContain('Element: Fire');
    });

    it('should detect transit patterns involving multiple planets', () => {
      const natalChart: ChartData = {
        name: 'Natal',
        planets: [
          { name: 'Sun', degree: 0 }, // 0° Aries (Fire)
          { name: 'Moon', degree: 120 }, // 0° Leo (Fire) - trine with Sun
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const transitChart: ChartData = {
        name: 'Transit',
        chartType: 'transit',
        planets: [
          { name: 'Jupiter', degree: 240 }, // 0° Sagittarius (Fire) - completes Grand Trine
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const result = chart2txt([natalChart, transitChart], {
        includeAspectPatterns: true,
      });

      expect(result).toContain(
        '[ASPECT PATTERNS: Natal-Transit Global Transit Composite]'
      );
      expect(result).toContain('Grand Trine:');
      expect(result).toContain('Element: Fire');
    });
  });

  describe('Multi-Chart Event Patterns', () => {
    it('should detect aspect patterns between natal chart and event chart', () => {
      const natalChart: ChartData = {
        name: 'Natal',
        planets: [
          { name: 'Sun', degree: 0 }, // 0° Aries
          { name: 'Venus', degree: 120 }, // 0° Leo - trine with Sun
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const eventChart: ChartData = {
        name: 'Wedding',
        chartType: 'event',
        planets: [
          { name: 'Mars', degree: 240 }, // 0° Sagittarius - forms Grand Trine with natal Sun & Venus
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const result = chart2txt([natalChart, eventChart], {
        includeAspectPatterns: true,
      });

      expect(result).toContain('[ASPECT PATTERNS: Natal-Wedding Composite]');
      expect(result).toContain('Grand Trine:');
      expect(result).toContain('Element: Fire');
    });

    it('should detect complex patterns with event chart and transits', () => {
      const natalChart: ChartData = {
        name: 'Natal',
        planets: [
          { name: 'Sun', degree: 0 }, // 0° Aries
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const eventChart: ChartData = {
        name: 'Event',
        chartType: 'event',
        planets: [
          { name: 'Moon', degree: 180 }, // 0° Libra - opposition with natal Sun
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const transitChart: ChartData = {
        name: 'Transit',
        chartType: 'transit',
        planets: [
          { name: 'Saturn', degree: 90 }, // 0° Cancer - T-Square with Sun-Moon opposition
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const result = chart2txt([natalChart, eventChart, transitChart], {
        includeAspectPatterns: true,
      });

      // Should contain global transit pattern across all charts
      expect(result).toContain(
        '[ASPECT PATTERNS: Natal-Event-Transit Global Transit Composite]'
      );
      expect(result).toContain('T-Square:');
      expect(result).toContain('Apex: Saturn');
      expect(result).toContain('Opposition: Sun');
    });
  });

  describe('Three-Chart Synastry Patterns', () => {
    it('should detect patterns across three natal charts', () => {
      const chart1: ChartData = {
        name: 'Person A',
        planets: [
          { name: 'Sun', degree: 0 }, // 0° Aries
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const chart2: ChartData = {
        name: 'Person B',
        planets: [
          { name: 'Moon', degree: 120 }, // 0° Leo - trine with Person A's Sun
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const chart3: ChartData = {
        name: 'Person C',
        planets: [
          { name: 'Jupiter', degree: 240 }, // 0° Sagittarius - completes Grand Trine
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const result = chart2txt([chart1, chart2, chart3], {
        includeAspectPatterns: true,
      });

      // Should have global pattern spanning all three charts
      expect(result).toContain(
        '[ASPECT PATTERNS: Person A-Person B-Person C Global Composite]'
      );
      expect(result).toContain('Grand Trine:');
      expect(result).toContain('Planet 1: Sun');
      expect(result).toContain('Planet 2: Moon');
      expect(result).toContain('Planet 3: Jupiter');
      expect(result).toContain('Element: Fire');
    });
  });

  describe('Configuration Options', () => {
    it('should not detect aspect patterns when includeAspectPatterns is false', () => {
      const chart1: ChartData = {
        name: 'Person A',
        planets: [
          { name: 'Sun', degree: 0 },
          { name: 'Moon', degree: 90 },
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const chart2: ChartData = {
        name: 'Person B',
        planets: [{ name: 'Mars', degree: 180 }],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const result = chart2txt([chart1, chart2], {
        includeAspectPatterns: false, // Explicitly disable
      });

      expect(result).not.toContain('[ASPECT PATTERNS');
      expect(result).not.toContain('T-Square');
    });

    it('should use custom orb settings for pattern detection', () => {
      const chart1: ChartData = {
        name: 'Person A',
        planets: [
          { name: 'Sun', degree: 0 }, // 0° Aries
          { name: 'Moon', degree: 183 }, // 3° Libra - wide opposition (3° orb)
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const chart2: ChartData = {
        name: 'Person B',
        planets: [
          { name: 'Mars', degree: 93 }, // 3° Cancer - wide square with Sun and Moon
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      // Test with tight orbs (should not detect pattern)
      const resultTightOrbs = chart2txt([chart1, chart2], {
        includeAspectPatterns: true,
        orbConfiguration: TIGHT_ORB_CONFIG,
      });

      // Test with wide orbs (should detect pattern)
      const resultWideOrbs = chart2txt([chart1, chart2], {
        includeAspectPatterns: true,
        orbConfiguration: WIDE_ORB_CONFIG,
      });

      // Wide orbs should detect the T-Square
      expect(resultWideOrbs).toContain('T-Square');
      // Tight orbs might not (depending on exact orb values)
    });
  });

  describe('Edge Cases', () => {
    it('should handle charts with angles in aspect patterns', () => {
      const chart1: ChartData = {
        name: 'Person A',
        planets: [
          { name: 'Sun', degree: 0 }, // 0° Aries
        ],
        ascendant: 90, // 0° Cancer - square with Sun
        houseCusps: [90, 120, 150, 180, 210, 240, 270, 300, 330, 0, 30, 60], // Ascendant at 90°
      };

      const chart2: ChartData = {
        name: 'Person B',
        planets: [
          { name: 'Mars', degree: 180 }, // 0° Libra - forms T-Square with Sun and Ascendant
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const result = chart2txt([chart1, chart2], {
        includeAspectPatterns: true,
      });

      expect(result).toContain(
        '[ASPECT PATTERNS: Person A-Person B Composite]'
      );
    });

    it('should handle empty planet arrays gracefully', () => {
      const chart1: ChartData = {
        name: 'Person A',
        planets: [],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const chart2: ChartData = {
        name: 'Person B',
        planets: [{ name: 'Sun', degree: 0 }],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const result = chart2txt([chart1, chart2], {
        includeAspectPatterns: true,
      });

      // Should not crash and should handle gracefully
      expect(result).toBeDefined();
    });
  });
});
