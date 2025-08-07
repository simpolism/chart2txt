import { chart2txt, ChartData } from '../src/index';

describe('Synastry and Multi-Chart Tests', () => {
  describe('synastry and multi-chart formatting', () => {
    test('formats 2-chart synastry with house overlays', () => {
      const chart1: ChartData = {
        name: 'Alice',
        planets: [
          { name: 'Sun', degree: 120 }, // 0° Leo
          { name: 'Moon', degree: 180 }, // 0° Libra
          { name: 'Mercury', degree: 210 }, // 0° Scorpio
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const chart2: ChartData = {
        name: 'Bob',
        planets: [
          { name: 'Sun', degree: 90 }, // 0° Cancer
          { name: 'Moon', degree: 240 }, // 0° Sagittarius
          { name: 'Venus', degree: 150 }, // 0° Virgo
        ],
        houseCusps: [15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345],
      };

      const result = chart2txt([chart1, chart2], {
        includeAspectPatterns: true,
      });

      // Should have individual chart sections
      expect(result).toContain('[CHART: Alice]');
      expect(result).toContain('[CHART: Bob]');

      // Should have synastry section
      expect(result).toContain('[SYNASTRY: Alice-Bob]');
      expect(result).toContain('[PLANET-PLANET ASPECTS]');

      // Should have house overlays with new format
      expect(result).toContain('[HOUSE OVERLAYS]');
      expect(result).toContain("Alice's planets in Bob's houses:");
      expect(result).toContain('- Sun: 4th');
      expect(result).toContain('- Moon: 6th');
      expect(result).toContain('- Mercury: 7th');
      expect(result).toContain("Bob's planets in Alice's houses:");
      expect(result).toContain('- Sun: 4th');
      expect(result).toContain('- Moon: 9th');
      expect(result).toContain('- Venus: 6th');
    });

    test('formats 3-chart group synastry', () => {
      const chart1: ChartData = {
        name: 'Alice',
        planets: [
          { name: 'Sun', degree: 0 }, // 0° Aries
          { name: 'Moon', degree: 90 }, // 0° Cancer
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const chart2: ChartData = {
        name: 'Bob',
        planets: [
          { name: 'Sun', degree: 120 }, // 0° Leo
          { name: 'Moon', degree: 180 }, // 0° Libra
        ],
        houseCusps: [30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 0],
      };

      const chart3: ChartData = {
        name: 'Charlie',
        planets: [
          { name: 'Sun', degree: 240 }, // 0° Sagittarius
          { name: 'Moon', degree: 300 }, // 0° Aquarius
        ],
        houseCusps: [60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 0, 30],
      };

      const result = chart2txt([chart1, chart2, chart3], {
        includeAspectPatterns: true,
      });

      // Should have individual chart sections
      expect(result).toContain('[CHART: Alice]');
      expect(result).toContain('[CHART: Bob]');
      expect(result).toContain('[CHART: Charlie]');

      // Should have pairwise synastry sections
      expect(result).toContain('[SYNASTRY: Alice-Bob]');
      expect(result).toContain('[SYNASTRY: Alice-Charlie]');
      expect(result).toContain('[SYNASTRY: Bob-Charlie]');

      // Should have multiple house overlay sections
      expect(result).toContain("Alice's planets in Bob's houses:");
      expect(result).toContain("Bob's planets in Alice's houses:");
      expect(result).toContain("Alice's planets in Charlie's houses:");
      expect(result).toContain("Charlie's planets in Alice's houses:");
      expect(result).toContain("Bob's planets in Charlie's houses:");
      expect(result).toContain("Charlie's planets in Bob's houses:");
    });

    test('formats synastry with transit chart', () => {
      const natalChart: ChartData = {
        name: 'Alice',
        chartType: 'natal',
        planets: [
          { name: 'Sun', degree: 150 }, // 0° Virgo
          { name: 'Moon', degree: 60 }, // 0° Gemini
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const transitChart: ChartData = {
        name: 'Current Transits',
        chartType: 'transit',
        planets: [
          { name: 'Sun', degree: 300 }, // 0° Aquarius
          { name: 'Mars', degree: 210 }, // 0° Scorpio
        ],
        location: 'New York',
        timestamp: new Date(2024, 0, 15, 12, 0, 0),
      };

      const result = chart2txt([natalChart, transitChart], {
        includeAspectPatterns: true,
      });

      // Should have natal chart section
      expect(result).toContain('[CHART: Alice]');

      // Should have transit chart info
      expect(result).toContain('[TRANSIT: Current Transits]');
      expect(result).toContain('[DATETIME]');

      // Should have transit aspects
      expect(result).toContain('[TRANSIT ASPECTS: Alice]');
    });

    test('formats synastry with event chart', () => {
      const natalChart: ChartData = {
        name: 'Alice',
        chartType: 'natal',
        planets: [
          { name: 'Sun', degree: 30 }, // 0° Taurus
          { name: 'Moon', degree: 270 }, // 0° Capricorn
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const eventChart: ChartData = {
        name: 'Wedding',
        chartType: 'event',
        planets: [
          { name: 'Sun', degree: 180 }, // 0° Libra
          { name: 'Venus', degree: 210 }, // 0° Scorpio
        ],
        houseCusps: [15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345],
        location: 'Paris',
        timestamp: new Date(2024, 5, 21, 14, 30, 0),
      };

      const result = chart2txt([natalChart, eventChart], {
        includeAspectPatterns: true,
      });

      // Should have both chart sections
      expect(result).toContain('[CHART: Alice]');
      expect(result).toContain('[CHART: Wedding]');

      // Should have natal-event relationship
      expect(result).toContain('[NATAL_EVENT: Alice-Wedding]');

      // Should have house overlays
      expect(result).toContain('[HOUSE OVERLAYS]');
      expect(result).toContain("Alice's planets in Wedding's houses:");
      expect(result).toContain("Wedding's planets in Alice's houses:");
    });

    test('handles missing house cusps in overlays', () => {
      const chart1: ChartData = {
        name: 'Alice',
        planets: [
          { name: 'Sun', degree: 120 }, // 0° Leo
        ],
        // No house cusps provided
      };

      const chart2: ChartData = {
        name: 'Bob',
        planets: [
          { name: 'Moon', degree: 180 }, // 0° Libra
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const result = chart2txt([chart1, chart2], {
        includeAspectPatterns: true,
      });

      expect(result).toContain('[HOUSE OVERLAYS]');
      expect(result).toContain("Alice's planets in Bob's houses:");
      expect(result).toContain('- Sun: 5th');
      expect(result).toContain(
        "Bob's planets in Alice's houses: (Alice house cusps not available)"
      );
    });

    test('works in synastry with angles from both charts', () => {
      const chart1: ChartData = {
        name: 'Person A',
        planets: [
          { name: 'Sun', degree: 30.0 }, // 0° Taurus
        ],
        ascendant: 0.0, // 0° Aries
      };

      const chart2: ChartData = {
        name: 'Person B',
        planets: [
          { name: 'Moon', degree: 60.0 }, // 0° Gemini
        ],
        midheaven: 90.0, // 0° Cancer
      };

      const result = chart2txt([chart1, chart2], {
        aspectCategories: [{ name: 'WIDE', maxOrb: 10 }],
      });

      expect(result).toContain('[SYNASTRY: Person A-Person B]');
      expect(result).toContain('[PLANET-PLANET ASPECTS]');
      // Check for cross-chart angle aspects with proper chart name formatting
      expect(result).toContain("Person A's Sun sextile Person B's Midheaven"); // Sun (30°) sextile MC (90°) = 60°
      expect(result).toContain("Person A's Ascendant sextile Person B's Moon"); // ASC (0°) sextile Moon (60°) = 60°
      expect(result).toContain(
        "Person A's Ascendant square Person B's Midheaven"
      ); // ASC (0°) square MC (90°) = 90°
    });
  });
});
