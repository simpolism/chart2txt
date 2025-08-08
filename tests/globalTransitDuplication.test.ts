import { chart2txt, ChartData } from '../src/index';

describe('Global Transit Composite Duplication Bug', () => {
  test('global transit composite should only include patterns involving transit planets', () => {
    // Create 3 charts that form patterns WITHOUT transit involvement
    const chart1: ChartData = {
      name: 'Person1',
      planets: [
        { name: 'Sun', degree: 0 }, // 0° Aries
        { name: 'Moon', degree: 120 }, // 0° Leo
      ],
      houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
    };

    const chart2: ChartData = {
      name: 'Person2',
      planets: [
        { name: 'Mars', degree: 240 }, // 0° Sagittarius - completes Fire Grand Trine
        { name: 'Venus', degree: 60 }, // 0° Gemini
      ],
      houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
    };

    const chart3: ChartData = {
      name: 'Person3',
      planets: [
        { name: 'Jupiter', degree: 180 }, // 0° Libra
        { name: 'Saturn', degree: 300 }, // 0° Aquarius
      ],
      houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
    };

    // Transit that doesn't participate in the existing Grand Trine pattern
    const transitChart: ChartData = {
      name: 'Transit',
      chartType: 'transit',
      planets: [
        { name: 'Pluto', degree: 270 }, // 0° Capricorn - doesn't aspect the Grand Trine
      ],
      houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
    };

    const result = chart2txt([chart1, chart2, chart3, transitChart], {
      includeAspectPatterns: true,
    });

    // There should be a regular global composite with patterns (e.g., Kite, Mystic Rectangle)
    expect(result).toContain('Person1-Person2-Person3 Global Composite');
    const globalStart = result.indexOf('Person1-Person2-Person3 Global Composite');
    const globalSection = result.substring(globalStart, result.indexOf('Global Transit Composite') || result.length);
    expect(globalSection).toMatch(/(Kite|Mystic Rectangle|Grand Trine):/); // Any significant pattern

    // The global transit composite should NOT repeat patterns that don't involve transit planets
    if (result.includes('Global Transit Composite')) {
      const transitGlobalStart = result.indexOf('Global Transit Composite');
      const transitGlobalSection = result.substring(transitGlobalStart);
      
      // Look for any patterns in the transit global section
      const patterns = transitGlobalSection.match(/(Grand Trine|T-Square|Yod|Kite|Mystic Rectangle):[\s\S]*?(?=(?:Grand Trine|T-Square|Yod|Kite|Mystic Rectangle):|$)/g) || [];
      
      // EVERY pattern in the transit global section should involve the transit chart
      patterns.forEach(pattern => {
        // Each pattern should mention at least one Transit planet
        expect(pattern).toMatch(/Transit['']s/);
      });
    } else {
      // If no Global Transit Composite exists, that's also acceptable (no transit-involving patterns)
      expect(result).not.toContain('Global Transit Composite');
    }
  });

  test('global transit composite should include new patterns formed by transit', () => {
    // Set up charts where transit creates a new pattern
    const chart1: ChartData = {
      name: 'Natal1',
      planets: [
        { name: 'Sun', degree: 0 }, // 0° Aries
        { name: 'Moon', degree: 60 }, // 0° Gemini
      ],
      houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
    };

    const chart2: ChartData = {
      name: 'Natal2', 
      planets: [
        { name: 'Mars', degree: 120 }, // 0° Leo
        { name: 'Venus', degree: 180 }, // 0° Libra
      ],
      houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
    };

    const chart3: ChartData = {
      name: 'Natal3',
      planets: [
        { name: 'Jupiter', degree: 240 }, // 0° Sagittarius 
        { name: 'Saturn', degree: 300 }, // 0° Aquarius
      ],
      houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
    };

    // Transit that creates a new Grand Trine with existing planets
    const transitChart: ChartData = {
      name: 'Transit',
      chartType: 'transit',
      planets: [
        { name: 'Neptune', degree: 0 }, // 0° Aries - same as Natal1 Sun for potential conjunction aspects
      ],
      houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
    };

    const result = chart2txt([chart1, chart2, chart3, transitChart], {
      includeAspectPatterns: true,
    });

    // The global transit composite should exist and contain patterns involving transit
    expect(result).toContain('Global Transit Composite');
    
    const transitGlobalStart = result.indexOf('Global Transit Composite');
    const transitGlobalSection = result.substring(transitGlobalStart);
    
    // Any patterns in the transit global section should involve transit planets
    const patterns = transitGlobalSection.match(/(Grand Trine|T-Square|Yod|Kite|Mystic Rectangle):[\s\S]*?(?=(?:Grand Trine|T-Square|Yod|Kite|Mystic Rectangle):|$)/g) || [];
    
    patterns.forEach(pattern => {
      // Each pattern should mention at least one transit planet
      expect(pattern).toMatch(/Transit['']s/);
    });
  });

  test('global transit composite should not include patterns with only one natal chart', () => {
    const natalChart1: ChartData = {
      name: 'Natal A',
      planets: [
        { name: 'Sun', degree: 0 }, // 0° Aries
        { name: 'Moon', degree: 180 }, // 0° Libra
      ],
      houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
    };
    const natalChart2: ChartData = {
      name: 'Natal B',
      planets: [
        { name: 'Mars', degree: 120 }, // 0° Leo
      ],
      houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
    };
    const transitChart: ChartData = {
      name: 'Transit',
      chartType: 'transit',
      planets: [
        { name: 'Pluto', degree: 90 }, // 0° Cancer, creates a T-Square with Natal A's Sun/Moon
      ],
      houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
    };

    const result = chart2txt([natalChart1, natalChart2, transitChart], {
      includeAspectPatterns: true,
    });

    // The T-Square involving only Natal A and Transit should be in the individual transit section
    expect(result).toContain('[ASPECT PATTERNS: Transit to Natal A]');
    const transitToASection = result.substring(result.indexOf('[ASPECT PATTERNS: Transit to Natal A]'));
    expect(transitToASection).toContain('T-Square:');
    expect(transitToASection).toContain("Apex: Transit's Pluto");

    // The Global Transit Composite section should NOT be present at all
    expect(result).not.toContain('Global Transit Composite');
  });
});
