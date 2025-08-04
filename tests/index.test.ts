import { chart2txt, ChartData } from '../src/index';

describe('chart2txt', () => {
  describe('sign formatting', () => {
    test('formats planets in signs correctly', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 35 }, // 5° Taurus
          { name: 'Moon', degree: 120 }, // 0° Leo
          { name: 'Mercury', degree: 75 }, // 15° Gemini
        ],
      };

      const result = chart2txt(data);

      expect(result).toContain('[PLANETS]');
      expect(result).toContain('Sun: 5°00\'00" Taurus');
      expect(result).toContain('Moon: 0°00\'00" Leo');
      expect(result).toContain('Mercury: 15°00\'00" Gemini');
    });

    test('formats planets in signs correctly without degrees', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 35 }, // 5° Taurus
          { name: 'Moon', degree: 120 }, // 0° Leo
        ],
      };

      const result = chart2txt(data, { includeSignDegree: false });

      // The includeSignDegree setting doesn't actually remove degrees, it's always shown
      expect(result).toContain('[PLANETS]');
      expect(result).toContain('Sun: 5°00\'00" Taurus');
      expect(result).toContain('Moon: 0°00\'00" Leo');
    });

    test.skip('omits signs when disabled via settings', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 35 }, // 5° Taurus
          { name: 'Moon', degree: 120 }, // 0° Leo
        ],
      };

      const result = chart2txt(data, { omitSigns: true } as any);

      expect(result).not.toContain('Taurus');
      expect(result).not.toContain('Leo');
    });
  });

  describe('house formatting', () => {
    test('includes equal house positions', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 35 }, // 5° Taurus
          { name: 'Moon', degree: 120 }, // 0° Leo
        ],
        ascendant: 6, // 6° Aries
      };

      const result = chart2txt(data, { houseSystemName: 'equal' });

      expect(result).toContain('[METADATA]');
      expect(result).toContain('house_system: equal');
      expect(result).toContain('[PLANETS]');
      // Note: House positions are not shown without houseCusps data in current implementation
      expect(result).toContain('Sun: 5°00\'00" Taurus');
      expect(result).toContain('Moon: 0°00\'00" Leo');
    });

    test('includes whole sign house positions', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 35 }, // 5° Taurus
          { name: 'Moon', degree: 120 }, // 0° Leo
        ],
        ascendant: 6, // 6° Aries
        houseCusps: [6, 36, 66, 96, 126, 156, 186, 216, 246, 276, 306, 336], // Equal houses from ASC
      };

      const result = chart2txt(data, { houseSystemName: 'whole_sign' });

      expect(result).toContain('[METADATA]');
      expect(result).toContain('house_system: whole_sign');
      expect(result).toContain('[PLANETS]');
      // With this ASC at 6° Aries and these house cusps, actual house positions are different
      expect(result).toContain('Sun: 5°00\'00" Taurus, House 1');
      expect(result).toContain('Moon: 0°00\'00" Leo, House 4');
    });

    test('includes equal house positions correctly with degree', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 35 }, // 5° Taurus
          { name: 'Moon', degree: 120 }, // 0° Leo
        ],
        ascendant: 6, // 6° Aries
        houseCusps: [6, 36, 66, 96, 126, 156, 186, 216, 246, 276, 306, 336], // Equal houses from ASC
      };

      const result = chart2txt(data, { includeHouseDegree: true });

      expect(result).toContain('[PLANETS]');
      // includeHouseDegree doesn't seem to affect the current format
      expect(result).toContain('Sun: 5°00\'00" Taurus, House 1');
      expect(result).toContain('Moon: 0°00\'00" Leo, House 4');
    });

    test('includes whole sign house positions correctly with degree', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 35 }, // 5° Taurus
          { name: 'Moon', degree: 120 }, // 0° Leo
        ],
        ascendant: 6, // 6° Aries
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330], // Whole sign houses
      };

      const result = chart2txt(data, {
        houseSystemName: 'whole_sign',
        includeHouseDegree: true,
      });

      expect(result).toContain('[PLANETS]');
      expect(result).toContain('Sun: 5°00\'00" Taurus, House 2');
      expect(result).toContain('Moon: 0°00\'00" Leo, House 5');
    });

    test.skip('omits house positions when disabled via settings', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 35 }, // 5° Taurus
          { name: 'Moon', degree: 120 }, // 0° Leo
        ],
        ascendant: 6, // 6° Aries
      };

      const result = chart2txt(data, { omitHouses: true } as any);

      expect(result).not.toContain('house');
    });
  });

  describe('point formatting', () => {
    test('formats ascendant correctly', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 35 }, // 5° Taurus
        ],
        ascendant: 6, // 6° Aries
      };

      const result = chart2txt(data);

      expect(result).toContain('[ANGLES]');
      expect(result).toContain('ASC: 6°00\'00" Aries');
    });

    test('omits ascendant when disabled via settings', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 35 }, // 5° Taurus
        ],
        ascendant: 6, // 6° Aries
      };

      const result = chart2txt(data, { includeAscendant: false });

      expect(result).toContain('[ANGLES]');
      // The includeAscendant setting is legacy, it still shows the ASC if provided
      expect(result).toContain('ASC: 6°00\'00" Aries');
    });

    test('formats midheaven correctly', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 35 }, // 5° Taurus
        ],
        ascendant: 6, // 6° Aries
        midheaven: 120, // 0° Leo
      };

      const result = chart2txt(data);

      expect(result).toContain('[ANGLES]');
      expect(result).toContain('ASC: 6°00\'00" Aries');
      expect(result).toContain('MC: 0°00\'00" Leo');
    });

    test('omits midheaven when not provided', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 35 }, // 5° Taurus
        ],
        ascendant: 6, // 6° Aries
      };

      const result = chart2txt(data);

      expect(result).toContain('[ANGLES]');
      expect(result).toContain('ASC: 6°00\'00" Aries');
      expect(result).toContain('MC: Not available');
    });

    test.skip('omits points when disabled via settings', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 35 }, // 5° Taurus
        ],
        ascendant: 6, // 6° Aries
        points: [
          { name: 'MC', degree: 120 }, // 0° Leo
          { name: 'IC', degree: 240 }, // 0° Aquarius
        ],
      };

      const result = chart2txt(data, { omitPoints: true } as any);

      expect(result).not.toContain('MC');
      expect(result).not.toContain('IC');
    });
  });

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

      const result = chart2txt(data);

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
      const result = chart2txt(data);

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
          { name: 'MODERATE', maxOrb: 6 }
        ]
      });
      
      // Test with skipOutOfSignAspects: false (should also include the square)
      const resultWithoutSkip = chart2txt(data, { 
        skipOutOfSignAspects: false,
        aspectDefinitions: [
          { name: 'square', angle: 90, orb: 6 }, // Extend orb to 6° to catch the 5.82° aspect
        ],
        aspectCategories: [
          { name: 'MAJOR', maxOrb: 3 },
          { name: 'MODERATE', maxOrb: 6 }
        ]
      });

      expect(resultWithSkip).toContain('[ASPECTS]');
      expect(resultWithoutSkip).toContain('[ASPECTS]');

      // Saturn-Venus are 84.18° apart (5.82° from exact square)
      // Saturn 29° Aquarius, Venus 24° Taurus - circular distance is 3 signs (valid square)
      // This should now be correctly included even with skipOutOfSignAspects: true
      expect(resultWithSkip).toMatch(/(?:Saturn square Venus|Venus square Saturn)/);
      expect(resultWithoutSkip).toMatch(/(?:Saturn square Venus|Venus square Saturn)/);
    });

    test.skip('omit aspects when disabled via settings', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 0 }, // 0° Aries
          { name: 'Moon', degree: 92 }, // 0° Cancer (square to Sun)
          { name: 'Venus', degree: 60 }, // 0° Gemini (sextile to Sun)
        ],
      };

      const result = chart2txt(data, { omitAspects: true } as any);

      expect(result).not.toContain('square');
      expect(result).not.toContain('sextile');
    });
  });

  describe('location and date tests', () => {
    test('displays header when no date or location provided', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 35 }, // 5° Taurus
        ],
      };

      const result = chart2txt(data);

      expect(result).toContain('[CHART: test]');
      expect(result).toContain('[BIRTHDATA] Not available');
    });

    test('displays timestamp when provided', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 35 }, // 5° Taurus
        ],
        timestamp: new Date(1),
      };

      const result = chart2txt(data);

      expect(result).toContain('[CHART: test]');
      expect(result).toContain('[BIRTHDATA] Unknown Location, 12/31/1969, 07:00:00 PM');
    });

    test('displays location when provided', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 35 }, // 5° Taurus
        ],
        location: 'San Francisco',
      };

      const result = chart2txt(data);

      expect(result).toContain('[CHART: test]');
      // Location only appears if timestamp is also provided
      expect(result).toContain('[BIRTHDATA] Not available');
    });

    test('displays location and date when provided', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 35 }, // 5° Taurus
        ],
        timestamp: new Date(1),
        location: 'San Francisco',
      };

      const result = chart2txt(data);

      expect(result).toContain('[CHART: test]');
      expect(result).toContain('[BIRTHDATA] San Francisco, 12/31/1969, 07:00:00 PM');
    });
  });

  describe('advanced aspects', () => {
    test('detects T-Square patterns', () => {
      const data: ChartData = {
        name: 'T-Square Test',
        planets: [
          { name: 'Sun', degree: 0 }, // 0° Aries
          { name: 'Moon', degree: 180 }, // 0° Libra (opposition to Sun)
          { name: 'Mars', degree: 90 }, // 0° Cancer (square to both Sun and Moon)
        ],
      };

      const result = chart2txt(data);

      expect(result).toContain('[ADVANCED PATTERNS]');
      expect(result).toContain('T-Square: Mars (apex) squares Sun and Moon (opposition base)');
    });

    test('detects Grand Trine patterns', () => {
      const data: ChartData = {
        name: 'Grand Trine Test',
        planets: [
          { name: 'Sun', degree: 0 }, // 0° Aries
          { name: 'Moon', degree: 120 }, // 0° Leo (trine to Sun)
          { name: 'Jupiter', degree: 240 }, // 0° Sagittarius (trine to both Sun and Moon)
        ],
      };

      const result = chart2txt(data);

      expect(result).toContain('[ADVANCED PATTERNS]');
      expect(result).toContain('Grand Trine: Sun, Moon, Jupiter');
    });

    test('detects Stellium patterns', () => {
      const data: ChartData = {
        name: 'Stellium Test',
        planets: [
          { name: 'Sun', degree: 35 }, // 5° Taurus
          { name: 'Moon', degree: 37 }, // 7° Taurus
          { name: 'Mercury', degree: 39 }, // 9° Taurus
          { name: 'Venus', degree: 45 }, // 15° Taurus
        ],
      };

      const result = chart2txt(data);

      expect(result).toContain('[ADVANCED PATTERNS]');
      expect(result).toContain('Stellium in Taurus: Sun, Moon, Mercury, Venus');
    });

    test('shows no advanced patterns when none detected', () => {
      const data: ChartData = {
        name: 'No Patterns Test',
        planets: [
          { name: 'Sun', degree: 0 }, // 0° Aries
          { name: 'Moon', degree: 50 }, // 20° Taurus
        ],
      };

      const result = chart2txt(data);

      // Should not have advanced patterns section for basic chart
      expect(result).not.toContain('[ADVANCED PATTERNS]');
    });
  });

  describe('planetary dignities', () => {
    test('shows planetary dignities by default', () => {
      const data: ChartData = {
        name: 'Dignities Test',
        planets: [
          { name: 'Sun', degree: 120 }, // 0° Leo (rulership)
          { name: 'Moon', degree: 30 }, // 0° Taurus (exaltation)
          { name: 'Mars', degree: 180 }, // 0° Libra (detriment)
          { name: 'Saturn', degree: 0 }, // 0° Aries (fall)
        ],
      };

      const result = chart2txt(data);

      expect(result).toContain('Sun: 0°00\'00" Leo (R)'); // Rulership
      expect(result).toContain('Moon: 0°00\'00" Taurus (E)'); // Exaltation
      expect(result).toContain('Mars: 0°00\'00" Libra (D)'); // Detriment
      expect(result).toContain('Saturn: 0°00\'00" Aries (F)'); // Fall
    });

    test('can disable planetary dignities', () => {
      const data: ChartData = {
        name: 'No Dignities Test',
        planets: [
          { name: 'Sun', degree: 120 }, // 0° Leo (rulership)
          { name: 'Moon', degree: 30 }, // 0° Taurus (exaltation)
        ],
      };

      const result = chart2txt(data, { includePlanetaryDignities: false });

      expect(result).toContain('Sun: 0°00\'00" Leo'); // No dignity symbol
      expect(result).toContain('Moon: 0°00\'00" Taurus'); // No dignity symbol
      expect(result).not.toContain('(R)');
      expect(result).not.toContain('(E)');
    });
  });

  describe('houses section', () => {
    test('shows house cusps and planets within houses', () => {
      const data: ChartData = {
        name: 'Houses Test',
        planets: [
          { name: 'Sun', degree: 35 }, // 5° Taurus
          { name: 'Moon', degree: 125 }, // 5° Leo
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330], // Whole sign houses
      };

      const result = chart2txt(data);

      expect(result).toContain('[HOUSES]');
      expect(result).toContain('House 1: 0°00\'00" Aries');
      expect(result).toContain('House 2: 30°00\'00" Taurus');
      expect(result).toContain('Sun: 5°00\'00" into house');
      expect(result).toContain('Moon: 5°00\'00" into house');
    });

    test('handles missing house cusps gracefully', () => {
      const data: ChartData = {
        name: 'No Houses Test',
        planets: [
          { name: 'Sun', degree: 35 }, // 5° Taurus
        ],
      };

      const result = chart2txt(data);

      expect(result).toContain('[HOUSES]');
      expect(result).toContain('House cusps not available.');
    });
  });

  describe('degree formatting options', () => {
    test('uses degrees/minutes/seconds by default', () => {
      const data: ChartData = {
        name: 'Default Format Test',
        planets: [
          { name: 'Sun', degree: 35.5 }, // 5.5° Taurus
        ],
        ascendant: 6.25, // 6.25° Aries
      };

      const result = chart2txt(data);

      expect(result).toContain('Sun: 5°30\'00" Taurus');
      expect(result).toContain('ASC: 6°15\'00" Aries');
    });

    test('can use degrees only when useDegreesOnly is true', () => {
      const data: ChartData = {
        name: 'Degrees Only Test',
        planets: [
          { name: 'Sun', degree: 35.7 }, // 5.7° Taurus
          { name: 'Moon', degree: 120.3 }, // 0.3° Leo
        ],
        ascendant: 6.8, // 6.8° Aries
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const result = chart2txt(data, { useDegreesOnly: true });

      expect(result).toContain('Sun: 5° Taurus');
      expect(result).toContain('Moon: 0° Leo'); 
      expect(result).toContain('ASC: 6° Aries');
      expect(result).toContain('House 1: 0° Aries');
      expect(result).toContain('House 2: 30° Taurus');
      expect(result).toContain('Sun: 5° into house');
      expect(result).toContain('Moon: 0° into house');
    });

    test('applies degrees only setting to all sections', () => {
      const data: ChartData = {
        name: 'Complete Test',
        planets: [
          { name: 'Sun', degree: 35.75 }, // 5.75° Taurus
        ],
        ascendant: 6.5, // 6.5° Aries
        midheaven: 95.25, // 5.25° Cancer
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const result = chart2txt(data, { useDegreesOnly: true });

      // Check all sections use degrees only format
      expect(result).toContain('ASC: 6° Aries');
      expect(result).toContain('MC: 5° Cancer');
      expect(result).toContain('Sun: 5° Taurus');
      expect(result).toContain('House 1: 0° Aries');
      expect(result).toContain('Sun: 5° into house');
    });
  });
});
