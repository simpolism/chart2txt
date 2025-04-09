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

    test('formats planets in signs correctly without degrees', () => {
      const data: ChartData = {
        planets: [
          { name: 'Sun', longitude: 35 }, // 5° Taurus
          { name: 'Moon', longitude: 120 }, // 0° Leo
        ],
      };

      const result = chart2txt(data, { includeSignDegree: false });

      expect(result).toContain('Sun is in Taurus');
      expect(result).toContain('Moon is in Leo');
    });

    test('omits signs when disabled via settings', () => {
      const data: ChartData = {
        planets: [
          { name: 'Sun', longitude: 35 }, // 5° Taurus
          { name: 'Moon', longitude: 120 }, // 0° Leo
        ],
      };

      const result = chart2txt(data, { omitSigns: true });

      expect(result).not.toContain('Taurus');
      expect(result).not.toContain('Leo');
    });
  });

  describe('house formatting', () => {
    test('includes equal house positions', () => {
      const data: ChartData = {
        planets: [
          { name: 'Sun', longitude: 35 }, // 5° Taurus
          { name: 'Moon', longitude: 120 }, // 0° Leo
        ],
        ascendant: 6, // 6° Aries
      };

      const result = chart2txt(data, { houseSystem: 'equal' });

      expect(result).toContain('Sun is in house 1');
      expect(result).toContain('Moon is in house 4');
    });

    test('includes whole sign house positions', () => {
      const data: ChartData = {
        planets: [
          { name: 'Sun', longitude: 35 }, // 5° Taurus
          { name: 'Moon', longitude: 120 }, // 0° Leo
        ],
        ascendant: 6, // 6° Aries
      };

      const result = chart2txt(data, { houseSystem: 'whole_sign' });

      expect(result).toContain('Sun is in house 2');
      expect(result).toContain('Moon is in house 5');
    });

    test('includes equal house positions correctly with degree', () => {
      const data: ChartData = {
        planets: [
          { name: 'Sun', longitude: 35 }, // 5° Taurus
          { name: 'Moon', longitude: 120 }, // 0° Leo
        ],
        ascendant: 6, // 6° Aries
      };

      const result = chart2txt(data, { includeHouseDegree: true });

      expect(result).toContain('Sun is at 29° in house 1');
      expect(result).toContain('Moon is at 24° in house 4');
    });

    test('includes whole sign house positions correctly with degree', () => {
      const data: ChartData = {
        planets: [
          { name: 'Sun', longitude: 35 }, // 5° Taurus
          { name: 'Moon', longitude: 120 }, // 0° Leo
        ],
        ascendant: 6, // 6° Aries
      };

      const result = chart2txt(data, { includeHouseDegree: true });

      expect(result).toContain('Sun is at 5° in house 2');
      expect(result).toContain('Moon is at 0° in house 5');
    });

    test('omits house positions when disabled via settings', () => {
      const data: ChartData = {
        planets: [
          { name: 'Sun', longitude: 35 }, // 5° Taurus
          { name: 'Moon', longitude: 120 }, // 0° Leo
        ],
        ascendant: 6, // 6° Aries
      };

      const result = chart2txt(data, { omitHouses: true });

      expect(result).not.toContain('house');
    });
  });

  describe('point formatting', () => {
    test('formats ascendant correctly', () => {
      const data: ChartData = {
        planets: [
          { name: 'Sun', longitude: 35 }, // 5° Taurus
        ],
        ascendant: 6, // 6° Aries
      };

      const result = chart2txt(data);

      expect(result).toContain('Ascendant is at 6° Aries');
    });

    test('omits ascendant when disabled via settings', () => {
      const data: ChartData = {
        planets: [
          { name: 'Sun', longitude: 35 }, // 5° Taurus
        ],
        ascendant: 6, // 6° Aries
      };

      const result = chart2txt(data, { includeAscendant: false });

      expect(result).not.toContain('Ascendant');
    });

    test('formats points in houses correctly', () => {
      const data: ChartData = {
        planets: [
          { name: 'Sun', longitude: 35 }, // 5° Taurus
        ],
        ascendant: 6, // 6° Aries
        points: [
          { name: 'MC', longitude: 120 }, // 0° Leo
          { name: 'IC', longitude: 240 }, // 0° Aquarius
        ],
      };

      const result = chart2txt(data);

      expect(result).toContain('MC is at 0° Leo');
      expect(result).toContain('IC is at 0° Aquarius');
    });

    test('formats points in signs correctly', () => {
      const data: ChartData = {
        planets: [
          { name: 'Sun', longitude: 35 }, // 5° Taurus
        ],
        ascendant: 6, // 6° Aries
        points: [
          { name: 'MC', longitude: 120 }, // 0° Leo
          { name: 'IC', longitude: 240 }, // 0° Aquarius
        ],
      };

      const result = chart2txt(data, { houseSystem: 'equal' });

      expect(result).toContain('MC is in house 4');
      expect(result).toContain('IC is in house 10');
    });

    test('omits points when disabled via settings', () => {
      const data: ChartData = {
        planets: [
          { name: 'Sun', longitude: 35 }, // 5° Taurus
        ],
        ascendant: 6, // 6° Aries
        points: [
          { name: 'MC', longitude: 120 }, // 0° Leo
          { name: 'IC', longitude: 240 }, // 0° Aquarius
        ],
      };

      const result = chart2txt(data, { omitPoints: true });

      expect(result).not.toContain('MC');
      expect(result).not.toContain('IC');
    });
  });

  describe('aspect formatting', () => {
    test('calculates and includes aspects between planets', () => {
      const data: ChartData = {
        planets: [
          { name: 'Sun', longitude: 0 }, // 0° Aries
          { name: 'Moon', longitude: 92 }, // 0° Cancer (square to Sun)
          { name: 'Venus', longitude: 60 }, // 0° Gemini (sextile to Sun)
        ],
      };

      const result = chart2txt(data);

      expect(result).toContain('Sun is in square with Moon');
      expect(result).toContain('Sun is in sextile with Venus');
    });

    test('calculates and includes aspects with definition override', () => {
      const data: ChartData = {
        planets: [
          { name: 'Sun', longitude: 0 }, // 0° Aries
          { name: 'Moon', longitude: 92 }, // 0° Cancer (square to Sun)
          { name: 'Venus', longitude: 69 }, // 0° Gemini (sextile to Sun)
        ],
      };

      const result = chart2txt(data, { aspectDefinitions: [
        { name: 'sextile2', angle: 60, orb: 10 },
      ]});

      expect(result).not.toContain('square');
      expect(result).toContain('Sun is in sextile2 with Venus');
    });

    test('omit aspects when disabled via settings', () => {
      const data: ChartData = {
        planets: [
          { name: 'Sun', longitude: 0 }, // 0° Aries
          { name: 'Moon', longitude: 92 }, // 0° Cancer (square to Sun)
          { name: 'Venus', longitude: 60 }, // 0° Gemini (sextile to Sun)
        ],
      };

      const result = chart2txt(data, { omitAspects: true });

      expect(result).not.toContain('square');
      expect(result).not.toContain('sextile');
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
