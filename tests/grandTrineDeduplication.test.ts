import {
  chart2txt,
  analyzeCharts,
  ChartData,
  AspectPattern,
} from '../src/index';

describe('Grand Trine Deduplication in Kites', () => {
  describe('Analysis Logic', () => {
    it('should detect both Grand Trine and Kite patterns in composite analysis', () => {
      // Create a cross-chart Grand Trine that becomes part of a Kite
      const chart1: ChartData = {
        name: 'Person1',
        planets: [
          { name: 'Sun', degree: 0 }, // 0° Aries
          { name: 'Moon', degree: 120 }, // 0° Leo
        ],
      };
      const chart2: ChartData = {
        name: 'Person2',
        planets: [
          { name: 'Mars', degree: 240 }, // 0° Sagittarius (completes Grand Trine)
          { name: 'Saturn', degree: 180 }, // 0° Libra (opposition to Sun, creates Kite)
        ],
      };

      const report = analyzeCharts([chart1, chart2], {
        includeAspectPatterns: true,
      });

      // The composite analysis should detect both a Grand Trine and a Kite
      const compositePatterns =
        report.pairwiseAnalyses[0]?.compositePatterns || [];

      const grandTrine = compositePatterns.find(
        (p: AspectPattern) => p.type === 'Grand Trine'
      );
      const kite = compositePatterns.find(
        (p: AspectPattern) => p.type === 'Kite'
      );

      expect(grandTrine).toBeDefined();
      expect(kite).toBeDefined();

      // Verify the Grand Trine is Fire element with the expected planets
      expect((grandTrine as any)?.element).toBe('Fire');
      expect((grandTrine as any)?.planets).toHaveLength(3);

      // Verify the Kite uses the same Grand Trine planets
      expect((kite as any)?.grandTrine).toHaveLength(3);
      expect((kite as any)?.opposition.name).toBe('Saturn');
    });
  });

  describe('Formatting Logic', () => {
    it('should not display Grand Trines that are part of Kites in text output', () => {
      // Cross-chart setup where Grand Trine is in composite patterns
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
          { name: 'Mars', degree: 240 }, // 0° Sagittarius (completes Fire Grand Trine)
          { name: 'Saturn', degree: 180 }, // 0° Libra (creates Kite with Sun)
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const result = chart2txt([chart1, chart2], {
        includeAspectPatterns: true,
      });

      // Should contain the Kite pattern
      expect(result).toContain('Kite (Fire');
      expect(result).toContain("Person1's Sun 0° Aries");
      expect(result).toContain("Person1's Moon 0° Leo");
      expect(result).toContain("Person2's Mars 0° Sagittarius");
      expect(result).toContain("Person2's Saturn 0° Libra");

      // Verify the composite section exists and check its contents
      const compositeSectionStart = result.indexOf(
        '[ASPECT PATTERNS: Person1-Person2 Composite]'
      );
      let compositeSectionEnd = result.indexOf('[HOUSE OVERLAYS]');
      if (compositeSectionEnd === -1) {
        compositeSectionEnd = result.length;
      }
      const compositeSection = result.substring(
        compositeSectionStart,
        compositeSectionEnd
      );

      // Count pattern occurrences in the composite section only
      const kiteCount = (compositeSection.match(/Kite \(/g) || []).length;
      const grandTrineCount = (compositeSection.match(/Grand Trine \(/g) || [])
        .length;

      expect(kiteCount).toBe(1);
      expect(grandTrineCount).toBe(0); // Should be filtered out due to deduplication
    });

    it('should still display Grand Trines that are NOT part of Kites', () => {
      // Create a Grand Trine without any opposition to form a Kite
      const chart1: ChartData = {
        name: 'Person1',
        planets: [
          { name: 'Sun', degree: 0 }, // 0° Aries
          { name: 'Moon', degree: 120 }, // 0° Leo
        ],
      };
      const chart2: ChartData = {
        name: 'Person2',
        planets: [
          { name: 'Mars', degree: 240 }, // 0° Sagittarius (completes Grand Trine)
          { name: 'Venus', degree: 90 }, // 0° Cancer (no opposition to any Grand Trine planet)
        ],
      };

      const result = chart2txt([chart1, chart2], {
        includeAspectPatterns: true,
      });

      // Should contain the standalone Grand Trine in composite section
      expect(result).toContain('Grand Trine (Fire');
      expect(result).toContain("Person1's Sun 0° Aries");
      expect(result).toContain("Person1's Moon 0° Leo");
      expect(result).toContain("Person2's Mars 0° Sagittarius");

      // Should NOT contain a Kite (no opposition)
      expect(result).not.toContain('Kite (');
    });

    it('should NOT filter Grand Trines from different analysis contexts', () => {
      // Alice has a natal Grand Trine that becomes part of a composite Kite with Bob
      const alice: ChartData = {
        name: 'Alice',
        planets: [
          { name: 'Sun', degree: 0 }, // 0° Aries
          { name: 'Moon', degree: 120 }, // 0° Leo
          { name: 'Mars', degree: 240 }, // 0° Sagittarius (Alice's natal Grand Trine)
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };
      const bob: ChartData = {
        name: 'Bob',
        planets: [
          { name: 'Saturn', degree: 180 }, // 0° Libra (opposition to Alice\'s Sun = Kite)
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const result = chart2txt([alice, bob], {
        includeAspectPatterns: true,
      });

      // Alice's individual section should contain the Grand Trine
      const aliceSection = result.substring(
        result.indexOf('[CHART: Alice]'),
        result.indexOf('[CHART: Bob]')
      );
      expect(aliceSection).toContain('Grand Trine (Fire');

      // Composite section should contain the Kite
      const compositeSection = result.substring(
        result.indexOf('[ASPECT PATTERNS: Alice-Bob Composite]'),
        result.indexOf('[HOUSE OVERLAYS]')
      );
      expect(compositeSection).toContain('Kite (Fire');

      // Both should be present since they're in different analysis contexts
      expect(result).toContain('Grand Trine (Fire');
      expect(result).toContain('Kite (Fire');
    });

    it('should filter Grand Trines that become Kites in same context', () => {
      // This test verifies our deduplication is working by checking the complex output from above
      const chart1: ChartData = {
        name: 'Person1',
        planets: [
          { name: 'Sun', degree: 0 }, // 0° Aries
          { name: 'Moon', degree: 120 }, // 0° Leo
          { name: 'Mercury', degree: 60 }, // 0° Gemini
        ],
      };
      const chart2: ChartData = {
        name: 'Person2',
        planets: [
          { name: 'Mars', degree: 240 }, // 0° Sagittarius
          { name: 'Jupiter', degree: 180 }, // 0° Libra
          { name: 'Venus', degree: 300 }, // 0° Aquarius
        ],
      };

      const result = chart2txt([chart1, chart2], {
        includeAspectPatterns: true,
      });

      // Should contain Kite patterns (both Fire and Air)
      expect(result).toContain('Kite (Fire');
      expect(result).toContain('Kite (Air');

      // Should NOT contain standalone Grand Trines since they're all part of Kites
      expect(result).not.toContain('Grand Trine (Fire');
      expect(result).not.toContain('Grand Trine (Air');

      // Verify that the composite section doesn't have redundant Grand Trines
      const compositeSection = result.substring(
        result.indexOf('[ASPECT PATTERNS: Person1-Person2 Composite]'),
        result.indexOf('[HOUSE OVERLAYS]')
      );

      const kiteCount = (compositeSection.match(/Kite \(/g) || []).length;
      const grandTrineCount = (compositeSection.match(/Grand Trine \(/g) || [])
        .length;

      expect(kiteCount).toBeGreaterThan(0); // Should have Kites
      expect(grandTrineCount).toBe(0); // Should have no Grand Trines (all filtered)
    });
  });
});
