import { formatReportToText } from '../src/index';
import { sampleReport } from './fixtures/sample-report';

describe('Report Formatter Validation', () => {
  it('should format a report object into a valid text string', () => {
    const textOutput = formatReportToText(sampleReport);

    // Check for key sections
    expect(textOutput).toContain('[CHART: Sample Chart]');
    expect(textOutput).toContain('[ASPECTS]');
    expect(textOutput).toContain('Sun square Moon');
    expect(textOutput).toContain('[ELEMENT DISTRIBUTION]');
    expect(textOutput).toContain('Fire: 1 (Sun)');
  });
});
