import {
  chart2txt,
  analyzeCharts,
  groupAspects,
  ChartData,
  Settings,
} from '../src/index';
import { ChartSettings } from '../src/config/ChartSettings';

describe('Simplified Orb and Grouping System', () => {
  const testData: ChartData = {
    name: 'test',
    planets: [
      { name: 'Sun', degree: 0 },
      { name: 'Moon', degree: 1.5 }, // Conjunct Sun 1.5
      { name: 'Mercury', degree: 3.5 }, // Conjunct Sun 3.5
      { name: 'Venus', degree: 6.5 }, // Conjunct Sun 6.5
      { name: 'Mars', degree: 90 }, // Square Sun 0.0
      { name: 'Jupiter', degree: 92 }, // Square Sun 2.0
    ],
  };

  describe('Analysis (analyzeCharts)', () => {
    it('should detect aspects based on "wide" preset orbs to catch everything', () => {
      const analysis = analyzeCharts(testData, { aspectDefinitions: 'wide' });
      const aspects = analysis.chartAnalyses[0].aspects;
      const aspectNames = aspects.map(
        (a) => `${a.planetA} ${a.aspectType} ${a.planetB}`
      );

      // Wide orbs: conj=12, square=10
      expect(aspectNames).toContain('Sun conjunction Moon'); // 1.5 < 12
      expect(aspectNames).toContain('Sun conjunction Mercury'); // 3.5 < 12
      expect(aspectNames).toContain('Sun conjunction Venus'); // 6.5 < 12
      expect(aspectNames).toContain('Sun square Mars'); // 0.0 < 10
      expect(aspectNames).toContain('Sun square Jupiter'); // 2.0 < 10
    });
  });

  describe('Default Grouping (groupAspects)', () => {
    it('should group aspects into default categories using default thresholds', () => {
      const analysis = analyzeCharts(testData, { aspectDefinitions: 'wide' });
      const settings = new ChartSettings(); // Uses default thresholds { tight: 2, moderate: 4 }
      const grouped = groupAspects(
        analysis.chartAnalyses[0].aspects,
        settings as Settings
      );

      const tightAspects = grouped.get('[TIGHT ASPECTS: orb under 2.0°]') || [];
      const moderateAspects =
        grouped.get('[MODERATE ASPECTS: orb 2.0-4.0°]') || [];
      const wideAspects = grouped.get('[WIDE ASPECTS: orb over 4.0°]') || [];

      // Correct counts after manual recalculation
      expect(tightAspects.length).toBe(8);
      expect(moderateAspects.length).toBe(3);
      expect(wideAspects.length).toBe(4);
    });
  });

  describe('End-to-End (chart2txt)', () => {
    it('should produce a report with default groupings when no settings are passed', () => {
      // The default aspectDefinitions are narrower than 'wide', so fewer aspects will be found.
      const result = chart2txt(testData);
      expect(result).toContain('[TIGHT ASPECTS: orb under 2.0°]');
      expect(result).toContain('[MODERATE ASPECTS: orb 2.0-4.0°]');
      expect(result).toContain('[WIDE ASPECTS: orb over 4.0°]');

      // Check a few key aspects
      expect(result).toContain('Sun square Mars: 0.0°'); // Should be tight
      expect(result).toContain('Sun conjunction Mercury: 3.5°'); // Should be moderate

      // This aspect should NOT be present with default orbs (conj orb=5)
      expect(result).not.toContain('Sun conjunction Venus: 6.5°');
    });

    it('should use custom thresholds when passed to chart2txt', () => {
      const result = chart2txt(testData, {
        aspectDefinitions: 'wide', // Use wide orbs to ensure all aspects are found
        aspectStrengthThresholds: {
          tight: 1.0,
          moderate: 3.0,
        },
      });

      // New groupings based on custom thresholds
      expect(result).toContain('[TIGHT ASPECTS: orb under 1.0°]');
      expect(result).toContain('[MODERATE ASPECTS: orb 1.0-3.0°]');
      expect(result).toContain('[WIDE ASPECTS: orb over 3.0°]');

      // Check which aspects fall into which groups
      const tightSection =
        result.match(/\[TIGHT ASPECTS.*?\]([\s\S]*?)(\[|$)/)?.[1] || '';
      const moderateSection =
        result.match(/\[MODERATE ASPECTS.*?\]([\s\S]*?)(\[|$)/)?.[1] || '';
      const wideSection =
        result.match(/\[WIDE ASPECTS.*?\]([\s\S]*)/)?.[1] || '';

      expect(tightSection).toContain('Sun square Mars: 0.0°');
      expect(moderateSection).toContain('Sun conjunction Moon: 1.5°');
      expect(moderateSection).toContain('Sun square Jupiter: 2.0°');
      expect(wideSection).toContain('Sun conjunction Mercury: 3.5°');
      expect(wideSection).toContain('Sun conjunction Venus: 6.5°');
    });
  });
});
