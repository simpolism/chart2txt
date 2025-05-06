/**
 * chart2txt
 * A library to convert astrological chart data to human-readable text.
 *
 * This is the main entry point for the library.
 */

// Core formatter function
export { formatChartToText as chart2txt } from './formatters/text/textFormatter';

// Export all types for library users
export * from './types';

// Export constants that might be useful for users (e.g., for custom settings)
export {
  DEFAULT_SETTINGS,
  DEFAULT_ASPECTS,
  DEFAULT_ASPECT_CATEGORIES,
  ZODIAC_SIGNS,
} from './constants';

// Export ChartSettings class for advanced configuration
export { ChartSettings } from './config/ChartSettings';

// Default export for convenience (e.g. UMD builds or simple script tags)
import { formatChartToText } from './formatters/text/textFormatter';
export default formatChartToText;
