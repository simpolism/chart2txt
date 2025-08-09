import {
  analyzeCharts,
  formatReportToText,
  groupAspects,
  ChartData,
  AspectData,
} from '../src/index';
import { sampleReport as oldSampleReport } from './fixtures/sample-report';

describe('Report Formatter Validation', () => {
  it('should format a report object into a valid text string', () => {
    // The old sample report is no longer valid because it has a 'strength' property.
    // We'll create a new valid report for this test.
    const analysis = analyzeCharts(oldSampleReport.chartAnalyses[0].chart);
    const settings = analysis.settings;
    analysis.chartAnalyses.forEach(
      (ca) => (ca.groupedAspects = groupAspects(ca.aspects, settings))
    );

    const textOutput = formatReportToText(analysis);

    // Check for key sections
    expect(textOutput).toContain('[CHART: Sample Chart]');
    expect(textOutput).toContain('[ASPECTS]');
    expect(textOutput).toContain('Sun square Moon');
    expect(textOutput).toContain('[ELEMENT DISTRIBUTION]');
    expect(textOutput).toContain('Fire: 1 (Sun)');
  });

  it('should correctly use a pre-grouped aspect map provided by the user', () => {
    const sampleChart: ChartData = {
      name: 'Test Chart',
      planets: [
        { name: 'Sun', degree: 15.5 },
        { name: 'Moon', degree: 101.0 }, // Square Sun
        { name: 'Venus', degree: 195.7 }, // Opposition Sun
        { name: 'Mars', degree: 75.8 }, // Trine Venus
      ],
    };

    // 1. The user analyzes the chart to get raw data.
    const analysis = analyzeCharts(sampleChart);
    const allAspects = analysis.chartAnalyses[0].aspects;

    // 2. The user implements their own custom grouping logic.
    const myGroupedAspects = new Map<string, AspectData[]>();
    const hardAspects: AspectData[] = [];
    const softAspects: AspectData[] = [];

    allAspects.forEach((aspect) => {
      if (
        aspect.aspectType === 'square' ||
        aspect.aspectType === 'opposition'
      ) {
        hardAspects.push(aspect);
      } else {
        softAspects.push(aspect);
      }
    });

    myGroupedAspects.set('[HARD ASPECTS (Custom)]', hardAspects);
    myGroupedAspects.set('[SOFT ASPECTS (Custom)]', softAspects);

    // 3. The user injects their custom-grouped map into the report.
    analysis.chartAnalyses[0].groupedAspects = myGroupedAspects;

    // 4. The user formats the report.
    const result = formatReportToText(analysis);

    // 5. The output should reflect the custom grouping.
    expect(result).toContain('[HARD ASPECTS (Custom)]');
    expect(result).toContain('[SOFT ASPECTS (Custom)]');
    expect(result).not.toContain('[TIGHT ASPECTS'); // Default categories should not appear
  });
});
