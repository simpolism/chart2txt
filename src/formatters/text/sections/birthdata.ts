import { ChartSettings } from '../../../config/ChartSettings';
import { formatDateCustom, formatTime } from '../../../utils/datetime';

/**
 * Generates the [BIRTHDATA] or [DATETIME] section.
 * @param location The location string.
 * @param timestamp The Date object for the event.
 * @param settings The chart settings, used for date formatting.
 * @param sectionTitle The title for the section (e.g., "[BIRTHDATA]", "[DATETIME]").
 * @returns An array of strings for the output.
 */
export function generateBirthdataOutput(
  location: string | undefined,
  timestamp: Date | undefined,
  settings: ChartSettings,
  sectionTitle = '[BIRTHDATA]'
): string[] {
  if (!timestamp) return [`${sectionTitle} Not available`];

  const dateStr = formatDateCustom(timestamp, settings.dateFormat);
  const timeStr = formatTime(timestamp);
  return [
    `${sectionTitle} ${location || 'Unknown Location'}, ${dateStr}, ${timeStr}`,
  ];
}
