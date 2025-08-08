import { chart2txt, formatChartToJson, ChartData } from '../src/index';

describe('Synastry and Multi-Chart Tests', () => {
  describe('Analysis Logic', () => {
    it('calculates house overlays correctly', () => {
      const chart1: ChartData = {
        name: 'Alice',
        planets: [{ name: 'Sun', degree: 120 }], // 0° Leo
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };
      const chart2: ChartData = {
        name: 'Bob',
        planets: [{ name: 'Moon', degree: 180 }], // 0° Libra
        houseCusps: [15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345],
      };

      const report = formatChartToJson([chart1, chart2]);
      const overlays = report.pairwiseAnalyses[0]?.houseOverlays;

      expect(overlays).toBeDefined();
      expect(overlays.chart1InChart2Houses['Sun']).toBe(4); // Alice's Sun in Bob's 4th house
      expect(overlays.chart2InChart1Houses['Moon']).toBe(7); // Bob's Moon in Alice's 7th house
    });

    it('handles missing house cusps in overlay analysis', () => {
      const chart1: ChartData = {
        name: 'Alice',
        planets: [{ name: 'Sun', degree: 120 }],
      }; // No cusps
      const chart2: ChartData = {
        name: 'Bob',
        planets: [{ name: 'Moon', degree: 180 }],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const report = formatChartToJson([chart1, chart2]);
      const overlays = report.pairwiseAnalyses[0]?.houseOverlays;

      expect(overlays).toBeDefined();
      expect(Object.keys(overlays.chart2InChart1Houses).length).toBe(0); // Should be empty
    });

    it('calculates synastry aspects between angles', () => {
      const chart1: ChartData = {
        name: 'Person A',
        planets: [],
        ascendant: 0.0,
      };
      const chart2: ChartData = {
        name: 'Person B',
        planets: [],
        midheaven: 90.0,
      };

      const report = formatChartToJson([chart1, chart2]);
      const synastryAspects = report.pairwiseAnalyses[0]?.synastryAspects;

      expect(synastryAspects).toBeDefined();
      expect(synastryAspects.length).toBeGreaterThan(0);
      const square = synastryAspects.find((a) => a.aspectType === 'square');
      expect(square).toBeDefined();
      expect(square?.planetA).toBe('Ascendant');
      expect(square?.planetB).toBe('Midheaven');
    });
  });

  // Keep one end-to-end test for integration validation
  describe('Integration Test', () => {
    test('formats a 3-chart synastry report correctly', () => {
      const chart1: ChartData = {
        name: 'Alice',
        planets: [{ name: 'Sun', degree: 0 }],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };
      const chart2: ChartData = {
        name: 'Bob',
        planets: [{ name: 'Moon', degree: 120 }],
        houseCusps: [30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 0],
      };
      const chart3: ChartData = {
        name: 'Charlie',
        planets: [{ name: 'Mars', degree: 240 }],
        houseCusps: [60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 0, 30],
      };

      const result = chart2txt([chart1, chart2, chart3]);

      expect(result).toContain('[CHART: Alice]');
      expect(result).toContain('[CHART: Bob]');
      expect(result).toContain('[CHART: Charlie]');
      expect(result).toContain('[SYNASTRY: Alice-Bob]');
      expect(result).toContain('[SYNASTRY: Alice-Charlie]');
      expect(result).toContain('[SYNASTRY: Bob-Charlie]');
      expect(result).toContain("Alice's planets in Bob's houses:");
    });
  });
});
