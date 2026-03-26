import { chart2txt } from '../src/index';
import { ChartData } from '../src/types';

describe('Composite Output Mode', () => {
  const chartA: ChartData = {
    name: 'Alice',
    planets: [
      { name: 'Sun', degree: 350 },
      { name: 'Moon', degree: 90 },
    ],
    ascendant: 350,
    midheaven: 80,
    houseCusps: [350, 20, 50, 80, 110, 140, 170, 200, 230, 260, 290, 320],
  };

  const chartB: ChartData = {
    name: 'Bob',
    planets: [
      { name: 'Sun', degree: 10 },
      { name: 'Moon', degree: 150 },
    ],
    ascendant: 10,
    midheaven: 100,
    houseCusps: [10, 40, 70, 100, 130, 160, 190, 220, 250, 280, 310, 340],
  };

  test('formats a midpoint composite as a single synthetic chart', () => {
    const result = chart2txt([chartA, chartB], {
      outputMode: 'composite',
      includeAspectPatterns: false,
    });

    expect(result).toContain('[METADATA]');
    expect(result).toContain('chart_type: composite');
    expect(result).toContain('composite_method: midpoint');
    expect(result).toContain('source_charts: Alice, Bob');
    expect(result).toContain('[COMPOSITE: Alice-Bob]');
    expect(result).toContain('[PLANETS]');
    expect(result).toContain('Sun: 0° Aries');
    expect(result).toContain('Moon: 0° Leo');

    expect(result).not.toContain('[SYNASTRY:');
    expect(result).not.toContain('[HOUSE OVERLAYS]');
    expect(result).not.toContain('[PLANET-PLANET ASPECTS]');
  });

  test('requires exactly two non-transit charts', () => {
    expect(() =>
      chart2txt([chartA], { outputMode: 'composite' })
    ).toThrow('Composite output mode requires exactly 2 non-transit charts');

    expect(() =>
      chart2txt([chartA, chartB, { ...chartA, name: 'Charlie' }], {
        outputMode: 'composite',
      })
    ).toThrow('Composite output mode requires exactly 2 non-transit charts');
  });

  test('supports transit overlay on composite chart', () => {
    const transitChart: ChartData = {
      name: 'Transit 2026',
      planets: [
        { name: 'Sun', degree: 353, speed: 1.0 },
        { name: 'Moon', degree: 291, speed: 12.0 },
      ],
      chartType: 'transit',
    };

    const result = chart2txt([chartA, chartB, transitChart], {
      outputMode: 'composite',
      includeAspectPatterns: false,
    });

    expect(result).toContain('chart_type: composite_with_transit');
    expect(result).toContain('composite_method: midpoint');
    expect(result).toContain('source_charts: Alice, Bob');
    expect(result).toContain('[COMPOSITE: Alice-Bob]');
    expect(result).toContain('[TRANSIT');
    expect(result).toContain('TRANSIT ASPECTS');
  });

  test('rejects transit-only charts in composite mode', () => {
    const transitChart: ChartData = {
      name: 'Transit',
      planets: [{ name: 'Sun', degree: 45 }],
      chartType: 'transit',
    };

    expect(() =>
      chart2txt([chartA, transitChart], { outputMode: 'composite' })
    ).toThrow('Composite output mode requires exactly 2 non-transit charts');
  });
});
