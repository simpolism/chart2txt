/**
 * Formats a Date object into a string based on the specified format.
 * @param date The Date object to format.
 * @param format The target format string (e.g., "MM/DD/YYYY").
 * @returns The formatted date string.
 */
export function formatDateCustom(date: Date, format: string): string {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const y = date.getFullYear();

  switch (format.toUpperCase()) {
    case 'MM/DD/YYYY':
      return `${m.toString().padStart(2, '0')}/${d
        .toString()
        .padStart(2, '0')}/${y}`;
    case 'DD/MM/YYYY':
      return `${d.toString().padStart(2, '0')}/${m
        .toString()
        .padStart(2, '0')}/${y}`;
    case 'YYYY-MM-DD':
      return `${y}-${m.toString().padStart(2, '0')}-${d
        .toString()
        .padStart(2, '0')}`;
    default:
      // Fallback to a common locale string if format is unrecognized
      console.warn(
        `Unrecognized date format: ${format}. Falling back to toLocaleDateString().`
      );
      return date.toLocaleDateString();
  }
}

/**
 * Formats the time part of a Date object.
 * @param date The Date object.
 * @returns The formatted time string (e.g., "09:28:00 AM").
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}
