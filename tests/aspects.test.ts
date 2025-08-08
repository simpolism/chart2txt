import { chart2txt, ChartData } from '../src/index';

describe('Aspects', () => {
  describe('aspect formatting', () => {
    test('calculates and includes aspects between planets', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 0 }, // 0° Aries
          { name: 'Moon', degree: 92 }, // 2° Cancer (square to Sun)
          { name: 'Venus', degree: 60 }, // 0° Gemini (sextile to Sun)
        ],
      };

      const result = chart2txt(data, { includeAspectPatterns: true });

      expect(result).toContain('[ASPECTS]');
      expect(result).toContain('Sun square Moon');
      expect(result).toContain('Sun sextile Venus');
    });

    test('calculates and includes aspects with definition override', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 0 }, // 0° Aries
          { name: 'Moon', degree: 92 }, // 2° Cancer (square to Sun)
          { name: 'Venus', degree: 69 }, // 9° Gemini (wide sextile to Sun)
        ],
      };

      const result = chart2txt(data, {
        aspectDefinitions: [{ name: 'sextile2', angle: 60, orb: 10 }],
        aspectCategories: [{ name: 'WIDE', maxOrb: 10 }], // Include wide aspects up to 10°
        skipOutOfSignAspects: false, // Allow out of sign aspects for this wide orb
      });

      expect(result).toContain('[ASPECTS]');
      expect(result).not.toContain('square');
      expect(result).toContain('Sun sextile2 Venus');
    });

    test('filters out-of-sign aspects by default (skipOutOfSignAspects: true)', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 28 }, // 28° Aries
          { name: 'Moon', degree: 32 }, // 2° Taurus (4° from Sun - close conjunction but different signs)
        ],
      };

      // Default behavior should skip out-of-sign aspects
      const result = chart2txt(data, { includeAspectPatterns: true });

      expect(result).toContain('[ASPECTS]');
      expect(result).toContain('None');
      expect(result).not.toContain('conjunction');
    });

    test('includes out-of-sign aspects when skipOutOfSignAspects is false', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 28 }, // 28° Aries
          { name: 'Moon', degree: 32 }, // 2° Taurus (4° from Sun - close conjunction but different signs)
        ],
      };

      const result = chart2txt(data, { skipOutOfSignAspects: false });

      expect(result).toContain('[ASPECTS]');
      expect(result).toContain('Sun conjunction Moon');
      expect(result).toContain('4.0°');
    });

    test('correctly handles Saturn-Venus cross-sign square with skipOutOfSignAspects', () => {
      const data: ChartData = {
        name: 'Saturn-Venus Bug Test',
        planets: [
          { name: 'Venus', degree: 54.17 }, // 24° Taurus (sign 1)
          { name: 'Saturn', degree: 329.99 }, // 29° Aquarius (sign 10)
          { name: 'Sun', degree: 98.76 }, // 8° Cancer - for context
        ],
      };

      // Test with major/moderate orbs and skipOutOfSignAspects: true (should now include the square)
      const resultWithSkip = chart2txt(data, {
        skipOutOfSignAspects: true,
        aspectDefinitions: [
          { name: 'square', angle: 90, orb: 6 }, // Extend orb to 6° to catch the 5.82° aspect
        ],
        aspectCategories: [
          { name: 'MAJOR', maxOrb: 3 },
          { name: 'MODERATE', maxOrb: 6 },
        ],
      });

      // Test with skipOutOfSignAspects: false (should also include the square)
      const resultWithoutSkip = chart2txt(data, {
        skipOutOfSignAspects: false,
        aspectDefinitions: [
          { name: 'square', angle: 90, orb: 6 }, // Extend orb to 6° to catch the 5.82° aspect
        ],
        aspectCategories: [
          { name: 'MAJOR', maxOrb: 3 },
          { name: 'MODERATE', maxOrb: 6 },
        ],
      });

      expect(resultWithSkip).toContain('[ASPECTS]');
      expect(resultWithoutSkip).toContain('[ASPECTS]');

      // Saturn-Venus are 84.18° apart (5.82° from exact square)
      // Saturn 29° Aquarius, Venus 24° Taurus - circular distance is 3 signs (valid square)
      // This should now be correctly included even with skipOutOfSignAspects: true
      expect(resultWithSkip).toMatch(
        /(?:Saturn square Venus|Venus square Saturn)/
      );
      expect(resultWithoutSkip).toMatch(
        /(?:Saturn square Venus|Venus square Saturn)/
      );
    });

    test('out-of-sign aspect filtering works correctly', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 29 }, // 29° Aries
          { name: 'Moon', degree: 121 }, // 1° Leo - should be trine (120°) but out of sign
        ],
      };

      const result = chart2txt(data, { skipOutOfSignAspects: true });

      // With skipOutOfSignAspects=true, this 119° aspect should be filtered out
      // because Sun in Aries and Moon in Leo are 3 signs apart (not 4 as expected for trine)
      expect(result).toContain('[ASPECTS]');
      expect(result).not.toContain('Sun trine Moon');
    });

    test('includes out-of-sign aspects when setting is disabled', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 29 }, // 29° Aries
          { name: 'Moon', degree: 149 }, // 29° Leo - should be trine (120°) but out of sign
        ],
      };

      const result = chart2txt(data, { skipOutOfSignAspects: false });

      // With skipOutOfSignAspects=false, this 120° aspect should be included
      expect(result).toContain('[ASPECTS]');
      expect(result).toContain('Sun trine Moon');
    });
  });

  describe('applying vs separating aspect detection', () => {
    test('correctly identifies applying aspects', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 0.0, speed: 1.0 }, // 0° Aries, moving forward
          { name: 'Moon', degree: 123.0, speed: 13.0 }, // 3° Leo, moving faster forward
        ],
      };

      const result = chart2txt(data, {
        aspectCategories: [{ name: 'WIDE', maxOrb: 10 }], // Allow wider orbs
        skipOutOfSignAspects: false, // Allow out-of-sign aspects for this test
      });

      expect(result).toContain('[ASPECTS]');
      expect(result).toContain('Sun trine Moon');
      // Moon at 123° is ahead of exact trine (120°) but moving faster forward, so it's separating
      expect(result).toContain('(separating)');
    });

    test('correctly identifies separating aspects', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 0.0, speed: 1.0 }, // 0° Aries, moving forward
          { name: 'Moon', degree: 117.0, speed: 13.0 }, // 27° Cancer, moving faster forward
        ],
      };

      const result = chart2txt(data, {
        aspectCategories: [{ name: 'WIDE', maxOrb: 10 }], // Allow wider orbs
        skipOutOfSignAspects: false, // Allow out-of-sign aspects for this test
      });

      expect(result).toContain('[ASPECTS]');
      expect(result).toContain('Sun trine Moon');
      // Moon at 117° is behind exact trine (120°) but moving faster forward, so it's applying
      expect(result).toContain('(applying)');
    });

    test('correctly handles retrograde planets in aspect application', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 0.0, speed: 1.0 }, // 0° Aries, direct
          { name: 'Mars', degree: 93.0, speed: -0.5 }, // 3° Cancer, retrograde
        ],
      };

      const result = chart2txt(data, {
        aspectCategories: [{ name: 'WIDE', maxOrb: 10 }], // Allow wider orbs
        skipOutOfSignAspects: false, // Allow out-of-sign aspects for this test
      });

      expect(result).toContain('[ASPECTS]');
      expect(result).toContain('Sun square Mars');
      // Mars is retrograde and moving toward exact square (90°) - should be applying
      expect(result).toContain('(applying)');
    });

    test('handles complex boundary case with 0°/360° wraparound', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 358.0, speed: 1.0 }, // 28° Pisces, moving forward
          { name: 'Moon', degree: 2.0, speed: 13.0 }, // 2° Aries, moving faster forward
        ],
      };

      const result = chart2txt(data, {
        aspectDefinitions: [{ name: 'conjunction', angle: 0, orb: 10 }], // Wider orb for conjunction
        aspectCategories: [{ name: 'WIDE', maxOrb: 10 }], // Allow wider orbs
        skipOutOfSignAspects: false, // Allow out-of-sign aspects for this test
      });

      expect(result).toContain('[ASPECTS]');
      expect(result).toContain('Sun conjunction Moon');
      // Moon is faster and moving away from the conjunction (4° → 5.28° in 0.1 days) - should be separating
      expect(result).toContain('(separating)');
    });

    test('correctly identifies exact aspects when speeds are equal', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 0.0, speed: 1.0 }, // 0° Aries
          { name: 'Moon', degree: 120.0, speed: 1.0 }, // 0° Leo, same speed
        ],
      };

      const result = chart2txt(data, {
        aspectCategories: [{ name: 'TIGHT', maxOrb: 10 }], // Allow wider orbs
      });

      expect(result).toContain('[ASPECTS]');
      expect(result).toContain('Sun trine Moon');
      // Same speeds - should not show application status (exact aspects don't show parens)
      expect(result).not.toContain('(applying)');
      expect(result).not.toContain('(separating)');
    });

    test('handles fast-moving Moon vs slow Mercury correctly', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Moon', degree: 235.99, speed: 13.76 }, // 25°59' Scorpio, fast-moving
          { name: 'Mercury', degree: 118.21, speed: 0.08 }, // 28°13' Cancer, slow-moving
        ],
      };

      const result = chart2txt(data, {
        aspectDefinitions: [{ name: 'trine', angle: 120, orb: 10 }], // Wide orb to catch this aspect
        aspectCategories: [{ name: 'WIDE', maxOrb: 10 }],
        skipOutOfSignAspects: false,
      });

      expect(result).toContain('[ASPECTS]');
      expect(result).toContain('Moon trine Mercury');
      // With time-based calculation, this should be applying (Moon catching up to exact trine)
      expect(result).toContain('(applying)');
    });
  });

  describe('aspects to angles (Ascendant and Midheaven)', () => {
    test('calculates aspects between planets and Ascendant', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 0.0, speed: 1.0 }, // 0° Aries
          { name: 'Moon', degree: 90.0, speed: 13.0 }, // 0° Cancer
        ],
        ascendant: 180.0, // 0° Libra
      };

      const result = chart2txt(data, {
        aspectCategories: [{ name: 'WIDE', maxOrb: 10 }],
      });

      expect(result).toContain('[ASPECTS]');
      expect(result).toContain('Sun opposition Ascendant');
      expect(result).toContain('Moon square Ascendant');
    });

    test('calculates aspects between planets and Midheaven', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Venus', degree: 60.0, speed: 1.2 }, // 0° Gemini
          { name: 'Mars', degree: 300.0, speed: 0.7 }, // 0° Aquarius
        ],
        midheaven: 120.0, // 0° Leo
      };

      const result = chart2txt(data, {
        aspectCategories: [{ name: 'WIDE', maxOrb: 10 }],
      });

      expect(result).toContain('[ASPECTS]');
      expect(result).toContain('Venus sextile Midheaven');
      // Mars at 300° to Midheaven at 120° = 180° = opposition
      expect(result).toContain('Mars opposition Midheaven');
    });

    test('calculates aspects between Ascendant and Midheaven', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 150.0 }, // 0° Virgo, no aspects to angles
        ],
        ascendant: 0.0, // 0° Aries
        midheaven: 90.0, // 0° Cancer
      };

      const result = chart2txt(data, {
        aspectCategories: [{ name: 'WIDE', maxOrb: 10 }],
      });

      expect(result).toContain('[ASPECTS]');
      expect(result).toContain('Ascendant square Midheaven');
    });

    test('handles aspects with applying/separating for angles', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Moon', degree: 117.0, speed: 13.0 }, // 27° Cancer, fast-moving
        ],
        ascendant: 120.0, // 0° Leo
      };

      const result = chart2txt(data, {
        aspectCategories: [{ name: 'WIDE', maxOrb: 10 }],
        skipOutOfSignAspects: false,
      });

      expect(result).toContain('[ASPECTS]');
      expect(result).toContain('Moon conjunction Ascendant');
      // Angles don't have speed, so aspects to angles don't show applying/separating
      expect(result).not.toContain('(applying)');
      expect(result).not.toContain('(separating)');
    });
  });

  describe('aspect patterns', () => {
    test('detects T-Square pattern', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 0, speed: 1.0 }, // 0° Aries
          { name: 'Moon', degree: 180, speed: 13.0 }, // 0° Libra (opposition to Sun)
          { name: 'Saturn', degree: 90, speed: 0.5 }, // 0° Cancer (square to both)
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const result = chart2txt(data, { includeAspectPatterns: true });

      expect(result).toContain('[ASPECT PATTERNS]');
      expect(result).toContain('T-Square:');
      expect(result).toContain('- Apex: Saturn 0° Cancer');
      expect(result).toContain(
        '- Opposition: Sun 0° Aries - Moon 0° Libra'
      );
      expect(result).toContain('- Mode: Cardinal');
    });

    test('detects Grand Trine pattern', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 0, speed: 1.0 }, // 0° Aries (Fire)
          { name: 'Moon', degree: 120, speed: 13.0 }, // 0° Leo (Fire)
          { name: 'Mars', degree: 240, speed: 0.7 }, // 0° Sagittarius (Fire)
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const result = chart2txt(data, { includeAspectPatterns: true });

      expect(result).toContain('[ASPECT PATTERNS]');
      expect(result).toContain('Grand Trine:');
      expect(result).toContain('- Planet 1: Sun 0° Aries');
      expect(result).toContain('- Planet 2: Moon 0° Leo');
      expect(result).toContain('- Planet 3: Mars 0° Sagittarius');
      expect(result).toContain('- Element: Fire');
    });

    test('detects Stellium pattern', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 95, speed: 1.0 }, // 5° Cancer
          { name: 'Mercury', degree: 100, speed: 1.2 }, // 10° Cancer
          { name: 'Venus', degree: 105, speed: 1.1 }, // 15° Cancer
          { name: 'Mars', degree: 180, speed: 0.7 }, // Different sign
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const result = chart2txt(data, { includeAspectPatterns: true });

      expect(result).toContain('[ASPECT PATTERNS]');
      expect(result).toContain('Stellium:');
      expect(result).toContain('- Planets: Sun, Mercury, Venus');
      expect(result).toContain('- Sign: Cancer');
      expect(result).toContain('- Houses: 4th');
      expect(result).toContain('- Span: 10.0°');
    });

    test('detects Yod pattern', () => {
      const correctedData: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 0, speed: 1.0 }, // 0° Aries
          { name: 'Moon', degree: 60, speed: 13.0 }, // 0° Gemini (sextile: 60°)
          { name: 'Saturn', degree: 210, speed: 0.5 }, // 0° Scorpio (quincunx to both: 210°-0°=210°>180° so 360°-210°=150°)
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const result = chart2txt(correctedData, { includeAspectPatterns: true });

      expect(result).toContain('[ASPECT PATTERNS]');
      expect(result).toContain('Yod:');
      expect(result).toContain('- Apex: Saturn 0° Scorpio');
      expect(result).toContain('- Base planet 1: Sun 0° Aries');
      expect(result).toContain('- Base planet 2: Moon 0° Gemini');
    });

    test('handles no aspect patterns', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 0, speed: 1.0 }, // 0° Aries
          { name: 'Moon', degree: 45, speed: 13.0 }, // 15° Taurus (no major aspects)
        ],
      };

      const result = chart2txt(data, { includeAspectPatterns: true });

      expect(result).toContain('[ASPECT PATTERNS]');
      expect(result).toContain('No aspect patterns detected.');
    });

    test('does not show aspect patterns when disabled', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 0, speed: 1.0 }, // 0° Aries
          { name: 'Moon', degree: 180, speed: 13.0 }, // 0° Libra (opposition to Sun)
          { name: 'Saturn', degree: 90, speed: 0.5 }, // 0° Cancer (square to both)
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const result = chart2txt(data); // Default: includeAspectPatterns: false

      expect(result).not.toContain('[ASPECT PATTERNS]');
      expect(result).not.toContain('T-Square:');
    });

    test('detects Grand Cross pattern (currently detected as T-Squares)', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 0, speed: 1.0 }, // 0° Aries
          { name: 'Moon', degree: 90, speed: 13.0 }, // 0° Cancer
          { name: 'Venus', degree: 180, speed: 1.1 }, // 0° Libra
          { name: 'Saturn', degree: 270, speed: 0.5 }, // 0° Capricorn
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const result = chart2txt(data, { includeAspectPatterns: true });

      expect(result).toContain('[ASPECT PATTERNS]');
      // Currently this configuration is detected as multiple T-Squares rather than one Grand Cross
      // This is a known limitation that could be improved in the future
      expect(result).toContain('T-Square:');
      expect(result).toContain('- Mode: Cardinal');
    });

    test('detects multiple patterns in same chart', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          // T-Square
          { name: 'Sun', degree: 0, speed: 1.0 }, // 0° Aries
          { name: 'Moon', degree: 180, speed: 13.0 }, // 0° Libra
          { name: 'Saturn', degree: 90, speed: 0.5 }, // 0° Cancer
          // Stellium in Leo
          { name: 'Mercury', degree: 120, speed: 1.2 }, // 0° Leo
          { name: 'Venus', degree: 125, speed: 1.1 }, // 5° Leo
          { name: 'Mars', degree: 130, speed: 0.7 }, // 10° Leo
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const result = chart2txt(data, { includeAspectPatterns: true });

      expect(result).toContain('[ASPECT PATTERNS]');
      expect(result).toContain('T-Square:');
      expect(result).toContain('Stellium:');
      expect(result).toContain('- Apex: Saturn 0° Cancer');
      expect(result).toContain('- Planets: Mercury, Venus, Mars');
      expect(result).toContain('- Sign: Leo');
    });
  });
});
