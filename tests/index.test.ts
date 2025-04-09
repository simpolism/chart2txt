import { chart2txt, ChartData } from '../src/index';

describe('chart2txt', () => {
  describe('sign formatting', () => {
    test('formats planets in signs correctly', () => {
      const data: ChartData = {
        planets: [
          { name: 'Sun', longitude: 35 }, // 5° Taurus
          { name: 'Moon', longitude: 120 }, // 0° Leo
          { name: 'Mercury', longitude: 75 }, // 15° Gemini
        ],
      };

      const result = chart2txt(data);

      expect(result).toContain('Sun is at 5° Taurus');
      expect(result).toContain('Moon is at 0° Leo');
      expect(result).toContain('Mercury is at 15° Gemini');
    });
  });

  describe('house formatting', () => {
    test('includes house positions when ascendant is provided', () => {
      const data: ChartData = {
        planets: [
          { name: 'Sun', longitude: 35 }, // 5° Taurus
          { name: 'Moon', longitude: 120 }, // 0° Leo
        ],
        ascendant: 30, // 0° Taurus
      };

      const result = chart2txt(data);

      expect(result).toContain('Sun is in house 1');
      expect(result).toContain('Moon is in house 4');
    });
  });

  describe('aspect formatting', () => {
    test('calculates and includes aspects between planets', () => {
      const data: ChartData = {
        planets: [
          { name: 'Sun', longitude: 0 }, // 0° Aries
          { name: 'Moon', longitude: 90 }, // 0° Cancer (square to Sun)
          { name: 'Venus', longitude: 60 }, // 0° Gemini (sextile to Sun)
        ],
      };

      const result = chart2txt(data);

      expect(result).toContain('Sun is in square with Moon');
      expect(result).toContain('Sun is in sextile with Venus');
    });
  });

  describe('location and date tests', () => {
    test('displays header when no date or location provided', () => {
      const data: ChartData = {
        planets: [
          { name: 'Sun', longitude: 35 }, // 5° Taurus
        ],
      };

      const result = chart2txt(data);

      expect(result).toContain('Astrology Chart:');
    });

    test('displays timestamp when provided', () => {
      const data: ChartData = {
        planets: [
          { name: 'Sun', longitude: 35 }, // 5° Taurus
        ],
        timestamp: new Date(1),
      };

      const result = chart2txt(data);

      expect(result).toContain('Astrology Chart ');
      expect(result).toContain('at: 1970-01-01T00:00:00.001Z');
    });

    test('displays location when provided', () => {
      const data: ChartData = {
        planets: [
          { name: 'Sun', longitude: 35 }, // 5° Taurus
        ],
        location: 'San Francisco',
      };

      const result = chart2txt(data);

      expect(result).toContain('Astrology Chart ');
      expect(result).toContain('location: San Francisco');
    });

    test('displays location and date when provided', () => {
      const data: ChartData = {
        planets: [
          { name: 'Sun', longitude: 35 }, // 5° Taurus
        ],
        timestamp: new Date(1),
        location: 'San Francisco',
      };

      const result = chart2txt(data);

      expect(result).toContain('Astrology Chart ');
      expect(result).toContain('location: San Francisco, at: 1970-01-01T00:00:00.001Z');
    });
  });
});
