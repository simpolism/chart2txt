import { formatChartToJson, ChartData, AstrologicalReport } from '../src/index';

describe('formatChartToJson Validation', () => {
  const chartData: ChartData = {
    name: 'Test Chart',
    planets: [
      { name: 'Sun', degree: 0 },
      { name: 'Moon', degree: 90 },
    ],
    houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
  };

  it('should return a valid AstrologicalReport object', () => {
    const report: AstrologicalReport = formatChartToJson(chartData);

    // Check for top-level keys
    expect(report).toBeDefined();
    expect(report).toHaveProperty('settings');
    expect(report).toHaveProperty('chartAnalyses');
    expect(report).toHaveProperty('pairwiseAnalyses');
    expect(report).toHaveProperty('transitAnalyses');

    // Check types and structure of chartAnalyses
    expect(Array.isArray(report.chartAnalyses)).toBe(true);
    expect(report.chartAnalyses.length).toBe(1);
    const chartAnalysis = report.chartAnalyses[0];
    expect(chartAnalysis).toHaveProperty('chart');
    expect(chartAnalysis.chart.name).toBe('Test Chart');
    expect(chartAnalysis).toHaveProperty('aspects');
    expect(Array.isArray(chartAnalysis.aspects)).toBe(true);
    expect(chartAnalysis).toHaveProperty('patterns');
    expect(Array.isArray(chartAnalysis.patterns)).toBe(true);
  });
});
