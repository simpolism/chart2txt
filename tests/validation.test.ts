import { chart2txt, ChartData } from '../src/index';

describe('Validation and Edge Cases', () => {
  // Tests for critical bug fixes
  describe('degree normalization fixes', () => {
    test('handles negative degrees correctly', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: -30 }, // Should normalize to 330° (0° Pisces)
          { name: 'Moon', degree: -90 }, // Should normalize to 270° (0° Capricorn)
        ],
      };

      const result = chart2txt(data);

      expect(result).toContain('Sun: 0° Pisces'); // -30° + 360° = 330° = 0° Pisces
      expect(result).toContain('Moon: 0° Capricorn'); // -90° + 360° = 270° = 0° Capricorn
    });

    test('handles degrees >= 360 correctly', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 390 }, // Should normalize to 30° (0° Taurus)
          { name: 'Moon', degree: 450 }, // Should normalize to 90° (0° Cancer)
        ],
      };

      const result = chart2txt(data);

      expect(result).toContain('Sun: 0° Taurus');
      expect(result).toContain('Moon: 0° Cancer');
    });

    test('handles extreme degree values correctly', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 1080 }, // Multiple rotations: should normalize to 0° (0° Aries)
          { name: 'Moon', degree: -720 }, // Multiple negative rotations: should normalize to 0° (0° Aries)
        ],
      };

      const result = chart2txt(data);

      expect(result).toContain('Sun: 0° Aries');
      expect(result).toContain('Moon: 0° Aries');
    });
  });

  describe('input validation fixes', () => {
    test('throws error for NaN degree values', () => {
      const data: ChartData = {
        name: 'test',
        planets: [{ name: 'Sun', degree: NaN }],
      };

      expect(() => chart2txt(data)).toThrow('Invalid chart data');
      expect(() => chart2txt(data)).toThrow('invalid degree value');
    });

    test('throws error for Infinity degree values', () => {
      const data: ChartData = {
        name: 'test',
        planets: [{ name: 'Sun', degree: Infinity }],
      };

      expect(() => chart2txt(data)).toThrow('Invalid chart data');
      expect(() => chart2txt(data)).toThrow('invalid degree value');
    });

    test('throws error for empty planet names', () => {
      const data: ChartData = {
        name: 'test',
        planets: [{ name: '', degree: 30 }],
      };

      expect(() => chart2txt(data)).toThrow('Invalid chart data');
      expect(() => chart2txt(data)).toThrow('non-empty string');
    });

    test('throws error for invalid house cusps array length', () => {
      const data: ChartData = {
        name: 'test',
        planets: [{ name: 'Sun', degree: 30 }],
        houseCusps: [0, 30, 60, 90, 120], // Only 5 cusps instead of 12
      };

      expect(() => chart2txt(data)).toThrow('Invalid chart data');
      expect(() => chart2txt(data)).toThrow('exactly 12 values');
    });

    test('throws error for invalid house cusp values', () => {
      const data: ChartData = {
        name: 'test',
        planets: [{ name: 'Sun', degree: 30 }],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, NaN],
      };

      expect(() => chart2txt(data)).toThrow('Invalid chart data');
      expect(() => chart2txt(data)).toThrow('invalid value');
    });

    test('throws error for duplicate planet names', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 30 },
          { name: 'Sun', degree: 60 }, // Duplicate name
        ],
      };

      expect(() => chart2txt(data)).toThrow('Invalid chart data');
      expect(() => chart2txt(data)).toThrow('Duplicate point names');
    });

    test('validates invalid speed values', () => {
      const data: ChartData = {
        name: 'test',
        planets: [{ name: 'Sun', degree: 30, speed: NaN }],
      };

      expect(() => chart2txt(data)).toThrow('Invalid chart data');
      expect(() => chart2txt(data)).toThrow('invalid speed value');
    });
  });

  describe('house calculation consistency fixes', () => {
    test('handles planets exactly on house cusps consistently', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 30.0 }, // Exactly on 2nd house cusp
          { name: 'Moon', degree: 60.0 }, // Exactly on 3rd house cusp
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const result = chart2txt(data);

      // Planets exactly on cusps should be assigned to the house starting at that cusp
      expect(result).toContain('Sun: 0° Taurus [Ruler: Venus], 2nd house');
      expect(result).toContain('Moon: 0° Gemini [Ruler: Mercury], 3rd house');
    });

    test('handles house wraparound at 0°/360° boundary consistently', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 350 }, // Should be in 1st house
          { name: 'Moon', degree: 10 }, // Should be in 2nd house
          { name: 'Mercury', degree: 320 }, // Should be in 12th house
        ],
        houseCusps: [340, 10, 40, 70, 100, 130, 160, 190, 220, 250, 280, 310],
      };

      const result = chart2txt(data);

      expect(result).toContain('Sun: 20° Pisces [Ruler: Jupiter], 1st house');
      expect(result).toContain('Moon: 10° Aries [Ruler: Mars], 2nd house');
      expect(result).toContain(
        'Mercury: 20° Aquarius [Ruler: Saturn], 12th house'
      );
    });
  });

  describe('dignity mapping fixes', () => {
    test('shows Mercury as having both detriment and fall in Pisces', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Mercury', degree: 330 }, // 0° Pisces
        ],
      };

      const result = chart2txt(data);

      // Mercury should show both detriment and fall in Pisces
      expect(result).toContain(
        'Mercury: 0° Pisces [Detriment, Fall | Ruler: Jupiter]'
      );
    });

    test('handles signs with no fall values correctly', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 60 }, // 0° Gemini (no fall planet defined)
          { name: 'Moon', degree: 240 }, // 0° Sagittarius (no fall planet defined)
        ],
      };

      const result = chart2txt(data);

      // Should not show fall information for signs that don't have it
      expect(result).toContain('Sun: 0° Gemini [Ruler: Mercury]');
      expect(result).toContain('Moon: 0° Sagittarius [Ruler: Jupiter]');
      expect(result).not.toContain('Fall:');
    });
  });

  describe('floating point precision fixes', () => {
    test('handles very precise degree values correctly', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 29.999999 }, // Very close to 30°
          { name: 'Moon', degree: 30.000001 }, // Very close to 30°
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const result = chart2txt(data);

      // Both should be handled consistently despite tiny differences
      expect(result).toContain('Sun: 29° Aries');
      expect(result).toContain('Moon: 0° Taurus');
      // House assignments should be consistent
      expect(result).toContain('1st house');
      expect(result).toContain('2nd house');
    });

    test('handles aspects with very tight orbs consistently', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 0.0 },
          { name: 'Moon', degree: 120.0001 }, // Trine with tiny orb
        ],
      };

      const result = chart2txt(data);

      expect(result).toContain('[ASPECTS]');
      expect(result).toContain('Sun trine Moon');
      // Should show very small orb (0.0°)
      expect(result).toContain('0.0°');
    });
  });
});
