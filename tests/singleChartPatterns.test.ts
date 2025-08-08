import {
  formatChartToJson,
  ChartData,
  TSquare,
  GrandTrine,
  Yod,
  Stellium,
} from '../src/index';

describe('Single Chart Aspect Pattern Analysis', () => {
  it('should detect a T-Square pattern', () => {
    const data: ChartData = {
      name: 'test',
      planets: [
        { name: 'Sun', degree: 0 },
        { name: 'Moon', degree: 180 },
        { name: 'Saturn', degree: 90 },
      ],
    };
    const report = formatChartToJson(data, { includeAspectPatterns: true });
    const patterns = report.chartAnalyses[0].patterns;
    expect(patterns.length).toBe(1);
    const tSquare = patterns[0] as TSquare;
    expect(tSquare.type).toBe('T-Square');
    expect(tSquare.apex.name).toBe('Saturn');
  });

  it('should detect a Grand Trine pattern', () => {
    const data: ChartData = {
      name: 'test',
      planets: [
        { name: 'Sun', degree: 0 },
        { name: 'Moon', degree: 120 },
        { name: 'Mars', degree: 240 },
      ],
    };
    const report = formatChartToJson(data, { includeAspectPatterns: true });
    const patterns = report.chartAnalyses[0].patterns;
    expect(patterns.length).toBe(1);
    const grandTrine = patterns[0] as GrandTrine;
    expect(grandTrine.type).toBe('Grand Trine');
    expect(grandTrine.element).toBe('Fire');
  });

  it('should detect a Yod pattern', () => {
    const data: ChartData = {
      name: 'test',
      planets: [
        { name: 'Sun', degree: 0 },
        { name: 'Moon', degree: 60 },
        { name: 'Saturn', degree: 210 },
      ],
    };
    const report = formatChartToJson(data, { includeAspectPatterns: true });
    const patterns = report.chartAnalyses[0].patterns;
    expect(patterns.length).toBe(1);
    const yod = patterns[0] as Yod;
    expect(yod.type).toBe('Yod');
    expect(yod.apex.name).toBe('Saturn');
  });

  it('should detect a Stellium pattern', () => {
    const data: ChartData = {
      name: 'test',
      planets: [
        { name: 'Sun', degree: 95 },
        { name: 'Mercury', degree: 100 },
        { name: 'Venus', degree: 105 },
      ],
      houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
    };
    const report = formatChartToJson(data, { includeAspectPatterns: true });
    const stelliums = report.chartAnalyses[0].stelliums;
    expect(stelliums.length).toBe(1);
    const stellium = stelliums[0] as Stellium;
    expect(stellium.type).toBe('Stellium');
    expect(stellium.sign).toBe('Cancer');
    expect(stellium.planets.map((p) => p.name)).toEqual([
      'Sun',
      'Mercury',
      'Venus',
    ]);
  });
});
