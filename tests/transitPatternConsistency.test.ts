import { chart2txt, ChartData } from '../src/index';

describe('Multi-Chart Transit Bug', () => {
  test('should generate transit aspect patterns for ALL charts, not just the last one', () => {
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
        { name: 'Mars', degree: 30 }, // 0° Taurus
        { name: 'Venus', degree: 210 }, // 0° Scorpio (opposition)
      ],
      houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
    };

    const chart3: ChartData = {
      name: 'Charlie',
      planets: [
        { name: 'Jupiter', degree: 60 }, // 0° Gemini
        { name: 'Saturn', degree: 240 }, // 0° Sagittarius (opposition)
      ],
      houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
    };

    const transitChart: ChartData = {
      name: 'Current Transits',
      chartType: 'transit',
      planets: [
        { name: 'Pluto', degree: 90 }, // 0° Cancer - forms T-Square with Alice's Sun-Moon opposition
      ],
      houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
    };

    const result = chart2txt([chart1, chart2, chart3, transitChart], {
      includeAspectPatterns: true,
    });

    // The key fix: should have transit aspect pattern sections for ALL charts, even if empty
    expect(result).toContain('[ASPECT PATTERNS: Transit to Alice]');
    expect(result).toContain('[ASPECT PATTERNS: Transit to Bob]'); 
    expect(result).toContain('[ASPECT PATTERNS: Transit to Charlie]');

    // Verify that empty sections show "No aspect patterns detected" for consistency
    const aliceTransitStart = result.indexOf('[ASPECT PATTERNS: Transit to Alice]');
    if (aliceTransitStart !== -1) {
      const nextSectionStart = result.indexOf('[TRANSIT ASPECTS: Bob]', aliceTransitStart);
      const aliceTransitSection = result.substring(aliceTransitStart, nextSectionStart);
      if (!aliceTransitSection.includes('T-Square:') && !aliceTransitSection.includes('Grand Trine:')) {
        expect(aliceTransitSection).toContain('No aspect patterns detected.');
      }
    }
  });

  test('should generate transit aspect patterns for both charts, not just the last one', () => {
    // Simpler test with just 2 charts to make it easier to debug
    const natal1: ChartData = {
      name: 'Person1',
      planets: [
        { name: 'Sun', degree: 0 }, // 0° Aries
        { name: 'Moon', degree: 180 }, // 0° Libra - opposition to Sun
      ],
      houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
    };

    const natal2: ChartData = {
      name: 'Person2',
      planets: [
        { name: 'Mars', degree: 0 }, // 0° Aries (same as Person1 Sun for identical T-Square)
        { name: 'Venus', degree: 180 }, // 0° Libra (same as Person1 Moon for identical T-Square)
      ],
      houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
    };

    const transit: ChartData = {
      name: 'Transit',
      chartType: 'transit',
      planets: [
        { name: 'Pluto', degree: 90 }, // 0° Cancer - squares both oppositions, creating T-Squares
      ],
      houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
    };

    const result = chart2txt([natal1, natal2, transit], {
      includeAspectPatterns: true,
    });

    // The bug: only the last chart (Person2) should have transit aspect patterns
    // This should FAIL until we fix the bug
    expect(result).toContain('[ASPECT PATTERNS: Transit to Person1]');
    expect(result).toContain('[ASPECT PATTERNS: Transit to Person2]');
  });
});