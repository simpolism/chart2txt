/**
 * chart2txt
 * A library to convert astrological chart data to human-readable text.
 *
 * This is the main entry point for the library.
 */

// Core functions - Astrology
export { chart2txt } from './chart2txt';
export { analyzeCharts } from './core/analysis';
export { groupAspects } from './core/grouping';
export { formatReportToText } from './formatters/text/textFormatter';

// Core functions - Human Design
export { humandesign2txt } from './humandesign2txt';
export type {
  HumanDesignApiResponse,
  HumanDesignChart,
  HumanDesign2TxtOptions,
  Activation,
  Channel
} from './humandesign2txt';

// Export all types for library users
export * from './types';

// Export constants that might be useful for users (e.g., for custom settings)
export { DEFAULT_SETTINGS, DEFAULT_ASPECTS, ZODIAC_SIGNS } from './constants';

// Export ChartSettings class for advanced configuration
export { ChartSettings } from './config/ChartSettings';

// Default export for convenience (e.g. UMD builds or simple script tags)
import { chart2txt } from './chart2txt';
export default chart2txt;
