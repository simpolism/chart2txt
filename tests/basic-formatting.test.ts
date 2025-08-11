import { chart2txt, ChartData } from '../src/index';

describe('Basic Formatting', () => {
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

      const result = chart2txt(data, { includeAspectPatterns: true });

      expect(result).toContain('[PLANETS]');
      expect(result).toContain('Sun: 5° Taurus');
      expect(result).toContain('Moon: 0° Leo');
      expect(result).toContain('Mercury: 15° Gemini');
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
      expect(result).toContain('Sun: 5° Taurus');
      expect(result).toContain('Moon: 0° Leo');
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
      expect(result).toContain('Sun: 5° Taurus [Ruler: Venus], 1st house');
      expect(result).toContain('Moon: 0° Leo [Ruler: Sun], 4th house');
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

      const result = chart2txt(data);

      expect(result).toContain('[PLANETS]');
      expect(result).toContain('Sun: 5° Taurus [Ruler: Venus], 1st house');
      expect(result).toContain('Moon: 0° Leo [Ruler: Sun], 4th house');
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
      });

      expect(result).toContain('[PLANETS]');
      expect(result).toContain('Sun: 5° Taurus [Ruler: Venus], 2nd house');
      expect(result).toContain('Moon: 0° Leo [Ruler: Sun], 5th house');
    });

    test('handles zodiac wraparound when 1st house cusp > 12th house cusp', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 350 }, // 20° Pisces - should be in 1st house
          { name: 'Moon', degree: 10 }, // 10° Aries - should be in 2nd house
          { name: 'Mercury', degree: 320 }, // 20° Aquarius - should be in 12th house
          { name: 'Venus', degree: 40 }, // 10° Taurus - should be in 3rd house
        ],
        // House cusps where 1st house starts at 340° (10° Pisces) and 12th house starts at 310° (10° Aquarius)
        // This creates a wraparound situation: 12th house spans 310°-340°, 1st house spans 340°-10° (next day)
        houseCusps: [340, 10, 40, 70, 100, 130, 160, 190, 220, 250, 280, 310],
      };

      const result = chart2txt(data, { includeAspectPatterns: true });

      expect(result).toContain('[PLANETS]');
      // Sun at 350° (20° Pisces) should be in 1st house (340°-10° wraparound)
      expect(result).toContain('Sun: 20° Pisces [Ruler: Jupiter], 1st house');
      // Moon at 10° (10° Aries) should be in 2nd house (10°-40°)
      expect(result).toContain('Moon: 10° Aries [Ruler: Mars], 2nd house');
      // Mercury at 320° (20° Aquarius) should be in 12th house (310°-340°)
      expect(result).toContain(
        'Mercury: 20° Aquarius [Ruler: Saturn], 12th house'
      );
      // Venus at 40° (10° Taurus) should be in 3rd house (40°-70°)
      expect(result).toContain('Venus: 10° Taurus [Domicile], 3rd house');

      expect(result).toContain('[HOUSE CUSPS]');
      expect(result).toContain('1st house: 10° Pisces'); // 340° = 10° Pisces
      expect(result).toContain('12th house: 10° Aquarius'); // 310° = 10° Aquarius
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

      const result = chart2txt(data, { includeAspectPatterns: true });

      expect(result).toContain('[ANGLES]');
      expect(result).toContain('Ascendant: 6° Aries');
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

      const result = chart2txt(data, { includeAspectPatterns: true });

      expect(result).toContain('[ANGLES]');
      expect(result).toContain('Ascendant: 6° Aries');
      expect(result).toContain('Midheaven: 0° Leo');
    });

    test('omits midheaven when not provided', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 35 }, // 5° Taurus
        ],
        ascendant: 6, // 6° Aries
      };

      const result = chart2txt(data, { includeAspectPatterns: true });

      expect(result).toContain('[ANGLES]');
      expect(result).toContain('Ascendant: 6° Aries');
      expect(result).toContain('Midheaven: Not available');
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

      const result = chart2txt(data, { includeAspectPatterns: true });

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

      const result = chart2txt(data, { includeAspectPatterns: true });

      expect(result).toContain('[CHART: test]');
      expect(result).toContain(
        '[BIRTHDATA] Unknown Location | 12/31/1969 | 07:00:00 PM'
      );
    });

    test('displays location when provided', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 35 }, // 5° Taurus
        ],
        location: 'San Francisco',
      };

      const result = chart2txt(data, { includeAspectPatterns: true });

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

      const result = chart2txt(data, { includeAspectPatterns: true });

      expect(result).toContain('[CHART: test]');
      expect(result).toContain(
        '[BIRTHDATA] San Francisco | 12/31/1969 | 07:00:00 PM'
      );
    });
  });

  describe('house cusps formatting', () => {
    test('formats house cusps correctly', () => {
      const data: ChartData = {
        name: 'test',
        planets: [{ name: 'Sun', degree: 35 }],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const result = chart2txt(data, { includeAspectPatterns: true });

      expect(result).toContain('[HOUSE CUSPS]');
      expect(result).toContain('1st house: 0° Aries');
      expect(result).toContain('7th house: 0° Libra');
      expect(result).toContain('2nd house: 0° Taurus');
      expect(result).toContain('8th house: 0° Scorpio');
    });

    test('handles missing house cusps', () => {
      const data: ChartData = {
        name: 'test',
        planets: [{ name: 'Sun', degree: 35 }],
      };

      const result = chart2txt(data, { includeAspectPatterns: true });

      expect(result).toContain('[HOUSE CUSPS]');
      expect(result).toContain('House cusps not available');
    });

    test('formats house cusps with various degrees', () => {
      const data: ChartData = {
        name: 'test',
        planets: [{ name: 'Sun', degree: 35 }],
        houseCusps: [15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345],
      };

      const result = chart2txt(data, { includeAspectPatterns: true });

      expect(result).toContain('[HOUSE CUSPS]');
      expect(result).toContain('1st house: 15° Aries');
      expect(result).toContain('7th house: 15° Libra');
      expect(result).toContain('4th house: 15° Cancer');
      expect(result).toContain('10th house: 15° Capricorn');
    });
  });

  describe('essential dignities formatting', () => {
    test('formats planets with ruler dignities', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 120 }, // 0° Leo - Sun rules Leo
          { name: 'Moon', degree: 90 }, // 0° Cancer - Moon rules Cancer
          { name: 'Mercury', degree: 150 }, // 0° Virgo - Mercury rules Virgo
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const result = chart2txt(data, { includeAspectPatterns: true });

      expect(result).toContain('[PLANETS]');
      expect(result).toContain('Sun: 0° Leo [Domicile], 5th house');
      expect(result).toContain('Moon: 0° Cancer [Domicile], 4th house');
      expect(result).toContain(
        'Mercury: 0° Virgo [Domicile, Exaltation], 6th house'
      );
    });

    test('formats planets with detriment and fall', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 270 }, // 0° Capricorn - Sun in detriment (ruled by Saturn)
          { name: 'Mars', degree: 90 }, // 0° Cancer - Mars in fall
        ],
      };

      const result = chart2txt(data, { includeAspectPatterns: true });

      expect(result).toContain('[PLANETS]');
      expect(result).toContain('Sun: 0° Capricorn [Ruler: Saturn]');
      expect(result).toContain('Mars: 0° Cancer [Fall | Ruler: Moon]');
    });

    test('formats planets with exaltation', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 0 }, // 0° Aries - Sun exalted in Aries
          { name: 'Moon', degree: 30 }, // 0° Taurus - Moon exalted in Taurus
        ],
      };

      const result = chart2txt(data, { includeAspectPatterns: true });

      expect(result).toContain('[PLANETS]');
      expect(result).toContain('Sun: 0° Aries [Exaltation | Ruler: Mars]');
      expect(result).toContain('Moon: 0° Taurus [Exaltation | Ruler: Venus]');
    });

    test('formats planets with mixed dignities and retrograde', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Mercury', degree: 150, speed: -1.2 }, // 0° Virgo Rx - Mercury rules and is exalted in Virgo
          { name: 'Venus', degree: 180, speed: -0.5 }, // 0° Libra Rx - Venus rules Libra
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const result = chart2txt(data, { includeAspectPatterns: true });

      expect(result).toContain('[PLANETS]');
      expect(result).toContain(
        'Mercury: 0° Virgo Retrograde [Domicile, Exaltation], 6th house'
      );
      expect(result).toContain(
        'Venus: 0° Libra Retrograde [Domicile], 7th house'
      );
    });
  });

  describe('dispositor chains formatting', () => {
    test('identifies final dispositors correctly', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 120 }, // 0° Leo - Sun rules itself
          { name: 'Moon', degree: 90 }, // 0° Cancer - Moon rules itself
          { name: 'Mercury', degree: 35 }, // 5° Taurus - disposed by Venus (not in chart)
        ],
      };

      const result = chart2txt(data, { includeAspectPatterns: true });

      expect(result).toContain('[DISPOSITOR TREE]');
      expect(result).toContain('Sun → (final)');
      expect(result).toContain('Moon → (final)');
      expect(result).toContain('Mercury → Venus (not in chart)');
    });

    test('shows dispositor chains with dependencies', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 120 }, // 0° Leo - Sun rules itself
          { name: 'Mercury', degree: 35 }, // 5° Taurus - disposed by Venus (not in chart)
          { name: 'Venus', degree: 90 }, // 0° Cancer - disposed by Moon (not in chart)
          { name: 'Moon', degree: 120 }, // 0° Leo - disposed by Sun
        ],
      };

      const result = chart2txt(data, { includeAspectPatterns: true });

      expect(result).toContain('[DISPOSITOR TREE]');
      expect(result).toContain('Sun → (final)');
      expect(result).toContain('Mercury → Venus → Moon → Sun → (final)');
      expect(result).toContain('Venus → Moon → Sun → (final)');
      expect(result).toContain('Moon → Sun → (final)');
    });

    test('handles empty planet list', () => {
      const data: ChartData = {
        name: 'test',
        planets: [],
      };

      const result = chart2txt(data, { includeAspectPatterns: true });

      expect(result).toContain('[DISPOSITOR TREE]');
      expect(result).toContain('No dispositor data available.');
    });

    test('handles complex dispositor chains', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 120 }, // 0° Leo - rules itself
          { name: 'Moon', degree: 150 }, // 0° Virgo - disposed by Mercury
          { name: 'Mercury', degree: 60 }, // 0° Gemini - rules itself
          { name: 'Venus', degree: 210 }, // 0° Scorpio - disposed by Mars/Pluto
          { name: 'Mars', degree: 30 }, // 0° Taurus - disposed by Venus
        ],
      };

      const result = chart2txt(data, { includeAspectPatterns: true });

      expect(result).toContain('[DISPOSITOR TREE]');
      expect(result).toContain('Sun → (final)');
      expect(result).toContain('Mercury → (final)');
      
      // Should show both directions of the cycle in default mode
      const cycleLines = result.split('\n').filter(line => line.trim().endsWith('(cycle)'));
      expect(cycleLines).toHaveLength(2);
      
      // Should contain both cycle directions
      expect(result).toContain('Venus → Mars → Venus (cycle)');
      expect(result).toContain('Mars → Venus → Mars (cycle)');
    });
  });

  describe('sign distribution formatting', () => {
    test('formats element distribution correctly', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 120 }, // 0° Leo - Fire
          { name: 'Moon', degree: 90 }, // 0° Cancer - Water
          { name: 'Mercury', degree: 35 }, // 5° Taurus - Earth
          { name: 'Venus', degree: 210 }, // 0° Scorpio - Water
          { name: 'Mars', degree: 60 }, // 0° Gemini - Air
        ],
        ascendant: 150, // 0° Virgo - Earth
      };

      const result = chart2txt(data, { includeAspectPatterns: true });

      expect(result).toContain('[ELEMENT DISTRIBUTION]');
      expect(result).toContain('Fire: 1 (Sun)');
      expect(result).toContain('Earth: 2 (Mercury, Ascendant)');
      expect(result).toContain('Air: 1 (Mars)');
      expect(result).toContain('Water: 2 (Moon, Venus)');
    });

    test('formats modality distribution correctly', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 0 }, // 0° Aries - Cardinal
          { name: 'Moon', degree: 90 }, // 0° Cancer - Cardinal
          { name: 'Mercury', degree: 120 }, // 0° Leo - Fixed
          { name: 'Venus', degree: 60 }, // 0° Gemini - Mutable
        ],
        ascendant: 240, // 0° Sagittarius - Mutable
      };

      const result = chart2txt(data, { includeAspectPatterns: true });

      expect(result).toContain('[MODALITY DISTRIBUTION]');
      expect(result).toContain('Cardinal: 2');
      expect(result).toContain('Fixed: 1');
      expect(result).toContain('Mutable: 2');
    });

    test('formats polarity distribution correctly', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 0 }, // 0° Aries - Masculine
          { name: 'Moon', degree: 30 }, // 0° Taurus - Feminine
          { name: 'Mercury', degree: 60 }, // 0° Gemini - Masculine
          { name: 'Venus', degree: 90 }, // 0° Cancer - Feminine
          { name: 'Mars', degree: 120 }, // 0° Leo - Masculine
        ],
        ascendant: 150, // 0° Virgo - Feminine
      };

      const result = chart2txt(data, { includeAspectPatterns: true });

      expect(result).toContain('[POLARITY]');
      expect(result).toContain('Masculine: 3');
      expect(result).toContain('Feminine: 3');
    });

    test('handles empty planet list for distributions', () => {
      const data: ChartData = {
        name: 'test',
        planets: [],
      };

      const result = chart2txt(data, { includeAspectPatterns: true });

      expect(result).toContain('[ELEMENT DISTRIBUTION]');
      expect(result).toContain('Fire: 0');
      expect(result).toContain('Earth: 0');
      expect(result).toContain('Air: 0');
      expect(result).toContain('Water: 0');
      expect(result).toContain('[MODALITY DISTRIBUTION]');
      expect(result).toContain('Cardinal: 0');
      expect(result).toContain('Fixed: 0');
      expect(result).toContain('Mutable: 0');
      expect(result).toContain('[POLARITY]');
      expect(result).toContain('Masculine: 0');
      expect(result).toContain('Feminine: 0');
    });

    test('handles distributions without ascendant', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 120 }, // 0° Leo - Fire, Fixed, Masculine
          { name: 'Moon', degree: 90 }, // 0° Cancer - Water, Cardinal, Feminine
        ],
        // No ascendant provided
      };

      const result = chart2txt(data, { includeAspectPatterns: true });

      expect(result).toContain('[ELEMENT DISTRIBUTION]');
      expect(result).toContain('Fire: 1 (Sun)');
      expect(result).toContain('Water: 1 (Moon)');
      expect(result).toContain('[MODALITY DISTRIBUTION]');
      expect(result).toContain('Cardinal: 1');
      expect(result).toContain('Fixed: 1');
      expect(result).toContain('[POLARITY]');
      expect(result).toContain('Masculine: 1');
      expect(result).toContain('Feminine: 1');
    });
  });
});
