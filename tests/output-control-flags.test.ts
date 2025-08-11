import { chart2txt, ChartData } from '../src/index';

describe('Output Control Flags', () => {
  const sampleData: ChartData = {
    name: 'test',
    planets: [
      { name: 'Sun', degree: 120 }, // 0° Leo - final dispositor
      { name: 'Moon', degree: 90 }, // 0° Cancer - final dispositor
      { name: 'Mercury', degree: 35 }, // 5° Taurus - disposed by Venus
      { name: 'Venus', degree: 120 }, // 0° Leo - disposed by Sun
      { name: 'Mars', degree: 0 }, // 0° Aries - forms aspects
      { name: 'Jupiter', degree: 180 }, // 0° Libra - opposition to Mars
    ],
    ascendant: 6,
    houseCusps: [6, 36, 66, 96, 126, 156, 186, 216, 246, 276, 306, 336],
  };

  const sampleSynastryData: ChartData[] = [
    {
      name: 'Person A',
      planets: [
        { name: 'Sun', degree: 0 }, // 0° Aries
        { name: 'Moon', degree: 90 }, // 0° Cancer
      ],
      ascendant: 0,
      houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
    },
    {
      name: 'Person B',
      planets: [
        { name: 'Sun', degree: 30 }, // 0° Taurus
        { name: 'Moon', degree: 120 }, // 0° Leo
      ],
      ascendant: 30,
      houseCusps: [30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 0],
    },
  ];

  describe('includeAspectPatterns flag', () => {
    test('confirms existing includeAspectPatterns=false disables aspect patterns', () => {
      const result = chart2txt(sampleData, { 
        includeAspectPatterns: false,
        aspectDefinitions: 'wide' // Use wide orbs to ensure aspects are found
      });

      expect(result).not.toContain('[ASPECT PATTERNS]');
      expect(result).toContain('[ASPECTS]'); // Aspects should still be included
    });

    test('confirms existing includeAspectPatterns=true enables aspect patterns', () => {
      const result = chart2txt(sampleData, { 
        includeAspectPatterns: true,
        aspectDefinitions: 'wide' // Use wide orbs to ensure aspects are found
      });

      expect(result).toContain('[ASPECT PATTERNS]');
      expect(result).toContain('[ASPECTS]');
    });
  });

  describe('includeDispositors flag', () => {
    test('includeDispositors=false disables dispositor tree output', () => {
      const result = chart2txt(sampleData, { includeDispositors: false });

      expect(result).not.toContain('[DISPOSITOR TREE]');
      expect(result).not.toContain('Sun → (final)');
    });

    test('includeDispositors=true includes full dispositor tree output (default)', () => {
      const result = chart2txt(sampleData, { includeDispositors: true });

      expect(result).toContain('[DISPOSITOR TREE]');
      expect(result).toContain('Sun → (final)');
      expect(result).toContain('Moon → (final)');
      expect(result).toContain('Mercury → Venus → Sun → (final)');
      expect(result).toContain('Venus → Sun → (final)');
    });

    test('includeDispositors="finals" uses single line format for finals and cycles', () => {
      const dataWithCycle: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 120 }, // 0° Leo - final
          { name: 'Venus', degree: 210 }, // 0° Scorpio - disposed by Mars
          { name: 'Mars', degree: 30 }, // 0° Taurus - disposed by Venus (cycle)
          { name: 'Mercury', degree: 35 }, // 5° Taurus - disposed by Venus (not final/cycle)
        ],
      };

      const result = chart2txt(dataWithCycle, { includeDispositors: 'finals' });

      // Should use single line format
      expect(result).not.toContain('[DISPOSITOR TREE]');
      expect(result).toContain('[DISPOSITORS] Final dispositors: Sun; Cycles: Mars → Venus → Mars');
      
      // Should NOT contain the old format
      expect(result).not.toContain('Sun → (final)');
      expect(result).not.toContain('Venus → Mars → Venus (cycle)');
      expect(result).not.toContain('Mars → Venus → Mars (cycle)');
      expect(result).not.toContain('Mercury → Venus');
    });

    test('finals mode shows single line format with only final dispositors and cycles', () => {
      const dataWithFinalDispositorChain: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 120 }, // 0° Leo - final dispositor
          { name: 'Venus', degree: 120 }, // 0° Leo - disposed by Sun (final)
          { name: 'Mercury', degree: 120 }, // 0° Leo - disposed by Sun (final)
          { name: 'Mars', degree: 30 }, // 0° Taurus - disposed by Venus → Sun (final)
        ],
      };

      const result = chart2txt(dataWithFinalDispositorChain, { includeDispositors: 'finals' });

      // Should use single line format, not the full dispositor tree
      expect(result).not.toContain('[DISPOSITOR TREE]');
      expect(result).toContain('[DISPOSITORS] Final dispositors: Sun');
      
      // Should NOT contain any of the full chains
      expect(result).not.toContain('Sun → (final)');
      expect(result).not.toContain('Venus → Sun → (final)');
      expect(result).not.toContain('Mercury → Sun → (final)');
      expect(result).not.toContain('Mars → Venus → Sun → (final)');
    });

    test('default behavior includes dispositors (backward compatibility)', () => {
      const result = chart2txt(sampleData);

      expect(result).toContain('[DISPOSITOR TREE]');
      expect(result).toContain('Sun → (final)');
    });
  });

  describe('includeHouseOverlays flag', () => {
    test('includeHouseOverlays=false disables house overlays in synastry', () => {
      const result = chart2txt(sampleSynastryData, { 
        includeHouseOverlays: false 
      });

      expect(result).not.toContain('[HOUSE OVERLAYS]');
      expect(result).not.toContain("Person A's planets in Person B's houses");
      expect(result).not.toContain("Person B's planets in Person A's houses");
    });

    test('includeHouseOverlays=true includes house overlays in synastry (default)', () => {
      const result = chart2txt(sampleSynastryData, { 
        includeHouseOverlays: true 
      });

      expect(result).toContain('[HOUSE OVERLAYS]');
      expect(result).toContain("Person A's planets in Person B's houses:");
      expect(result).toContain("Person B's planets in Person A's houses:");
    });

    test('default behavior includes house overlays (backward compatibility)', () => {
      const result = chart2txt(sampleSynastryData);

      expect(result).toContain('[HOUSE OVERLAYS]');
      expect(result).toContain("Person A's planets in Person B's houses:");
    });

    test('house overlays flag has no effect on single chart', () => {
      const resultDisabled = chart2txt(sampleData, { includeHouseOverlays: false });
      const resultEnabled = chart2txt(sampleData, { includeHouseOverlays: true });

      // Neither should contain house overlays for single chart
      expect(resultDisabled).not.toContain('[HOUSE OVERLAYS]');
      expect(resultEnabled).not.toContain('[HOUSE OVERLAYS]');
    });
  });
});