import { AstrologicalReport } from '../../src/types';
import { ChartSettings } from '../../src/config/ChartSettings';

export const sampleReport: AstrologicalReport = {
  settings: new ChartSettings({
    includeAspectPatterns: true,
    includeSignDistributions: true,
  }),
  chartAnalyses: [
    {
      chart: {
        name: 'Sample Chart',
        planets: [
          { name: 'Sun', degree: 15 }, // 15° Aries
          { name: 'Moon', degree: 105 }, // 15° Cancer
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      },
      placements: {
        planets: [
          { name: 'Sun', degree: 15, sign: 'Aries', house: 1 },
          { name: 'Moon', degree: 105, sign: 'Cancer', house: 4 },
        ],
      },
      aspects: [
        {
          planetA: 'Sun',
          planetB: 'Moon',
          aspectType: 'square',
          orb: 0,
          strength: 'tight' as const,
          p1ChartName: 'Sample Chart',
          p2ChartName: 'Sample Chart',
        },
      ],
      patterns: [],
      stelliums: [],
      signDistributions: {
        elements: { Fire: ['Sun'], Water: ['Moon'] },
        modalities: { Cardinal: 2 },
        polarities: { Masculine: 1, Feminine: 1 },
      },
      dispositors: { Sun: 'Mars', Moon: 'Moon' },
    },
  ],
  pairwiseAnalyses: [],
  transitAnalyses: [],
};
