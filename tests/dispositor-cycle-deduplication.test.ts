import { chart2txt, ChartData } from '../src/index';

describe('Dispositor Cycle Deduplication', () => {
  describe('default behavior (includeDispositors: true)', () => {
    test('shows both directions of Venus-Mars mutual reception', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 120 }, // 0° Leo - final
          { name: 'Venus', degree: 210 }, // 0° Scorpio - disposed by Mars
          { name: 'Mars', degree: 30 }, // 0° Taurus - disposed by Venus
        ],
      };

      const result = chart2txt(data, { includeDispositors: true });

      expect(result).toContain('[DISPOSITOR TREE]');
      expect(result).toContain('Sun → (final)');
      
      // Should show both directions of the cycle
      const cycleLines = result.split('\n').filter(line => line.trim().endsWith('(cycle)'));
      expect(cycleLines).toHaveLength(2);
      
      // Should contain both cycle directions
      expect(result).toContain('Venus → Mars → Venus (cycle)');
      expect(result).toContain('Mars → Venus → Mars (cycle)');
    });

    test('shows both planets in multi-planet cycles', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Venus', degree: 210 }, // 0° Scorpio - disposed by Mars
          { name: 'Mars', degree: 30 }, // 0° Taurus - disposed by Venus
        ],
      };

      const result = chart2txt(data, { includeDispositors: true });

      // Should show both directions of the cycle
      const cycleLines = result.split('\n').filter(line => line.includes('(cycle)'));
      expect(cycleLines).toHaveLength(2);
      
      expect(result).toContain('Venus → Mars → Venus (cycle)');
      expect(result).toContain('Mars → Venus → Mars (cycle)');
    });
  });

  describe('finals mode single line format (includeDispositors: "finals")', () => {
    test('shows single line format for Venus-Mars mutual reception', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 120 }, // 0° Leo - final
          { name: 'Venus', degree: 210 }, // 0° Scorpio - disposed by Mars
          { name: 'Mars', degree: 30 }, // 0° Taurus - disposed by Venus
        ],
      };

      const result = chart2txt(data, { includeDispositors: 'finals' });

      // Should use single line format
      expect(result).not.toContain('[DISPOSITOR TREE]');
      expect(result).toContain('[DISPOSITORS] Final dispositors: Sun; Cycles: Mars → Venus → Mars');
      
      // Should NOT contain the old format
      expect(result).not.toContain('Sun → (final)');
      expect(result).not.toContain('Venus → Mars → Venus (cycle)');
      expect(result).not.toContain('Mars → Venus → Mars (cycle)');
    });

    test('shows single line format for three-planet cycle', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Mercury', degree: 0 }, // 0° Aries - disposed by Mars
          { name: 'Venus', degree: 60 }, // 0° Gemini - disposed by Mercury  
          { name: 'Mars', degree: 180 }, // 0° Libra - disposed by Venus
        ],
      };

      const result = chart2txt(data, { includeDispositors: 'finals' });

      // Should use single line format with correct cycle representation
      expect(result).not.toContain('[DISPOSITOR TREE]');
      expect(result).toContain('[DISPOSITORS] Cycles: Mars → Venus → Mercury → Mars');
      
      // Should NOT contain old tree format with separate lines
      expect(result).not.toContain('Mercury → Mars → Venus (cycle)');
      expect(result).not.toContain('Venus → Mercury → Mars (cycle)');
      expect(result).not.toContain('Mars → Venus → Mercury (cycle)');
      expect(result).not.toContain('[DISPOSITOR TREE]');
    });
  });

  describe('mixed final dispositors and cycles', () => {
    test('shows final dispositors and all cycle chains in default mode', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 120 }, // 0° Leo - final
          { name: 'Moon', degree: 90 }, // 0° Cancer - final
          { name: 'Venus', degree: 210 }, // 0° Scorpio - disposed by Mars
          { name: 'Mars', degree: 30 }, // 0° Taurus - disposed by Venus (cycle)
          { name: 'Mercury', degree: 35 }, // 5° Taurus - disposed by Venus (leads to cycle)
        ],
      };

      const result = chart2txt(data, { includeDispositors: true });

      expect(result).toContain('[DISPOSITOR TREE]');
      
      // Should show both finals
      expect(result).toContain('Sun → (final)');
      expect(result).toContain('Moon → (final)');
      
      // Should show Mercury's chain leading to the cycle
      expect(result).toContain('Mercury → Venus');
      
      // Should show both directions of the Venus-Mars cycle
      const cycleLines = result.split('\n').filter(line => line.includes('(cycle)'));
      expect(cycleLines.length).toBeGreaterThanOrEqual(2); // Venus and Mars cycles, plus Mercury leads to it
    });
  });

  describe('includeDispositors="finals" mode with cycles', () => {
    test('uses single line format for finals and cycles', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 120 }, // 0° Leo - final
          { name: 'Venus', degree: 210 }, // 0° Scorpio - disposed by Mars (cycle)
          { name: 'Mars', degree: 30 }, // 0° Taurus - disposed by Venus (cycle)
          { name: 'Mercury', degree: 35 }, // 5° Taurus - disposed by Venus (not final/cycle)
        ],
      };

      const result = chart2txt(data, { includeDispositors: 'finals' });

      // Should use single line format
      expect(result).not.toContain('[DISPOSITOR TREE]');
      expect(result).toContain('[DISPOSITORS] Final dispositors: Sun; Cycles: Mars → Venus → Mars');
      
      // Should NOT contain old format
      expect(result).not.toContain('Sun → (final)');
      expect(result).not.toContain('(cycle)');
      expect(result).not.toContain('Mercury → Venus → Mars');
    });
  });

  describe('backward compatibility', () => {
    test('maintains the same behavior for final dispositors', () => {
      const data: ChartData = {
        name: 'test',
        planets: [
          { name: 'Sun', degree: 120 }, // 0° Leo - final
          { name: 'Moon', degree: 90 }, // 0° Cancer - final
          { name: 'Mercury', degree: 35 }, // 5° Taurus - disposed by Venus (not in chart)
        ],
      };

      const result = chart2txt(data);

      expect(result).toContain('[DISPOSITOR TREE]');
      expect(result).toContain('Sun → (final)');
      expect(result).toContain('Moon → (final)');
      expect(result).toContain('Mercury → Venus (not in chart)');
    });
  });
});