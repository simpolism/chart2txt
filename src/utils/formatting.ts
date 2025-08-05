/**
 * Converts a number to its ordinal form (1st, 2nd, 3rd, etc.)
 * @param num The number to convert
 * @returns The ordinal string
 */
export function getOrdinal(num: number): string {
  const suffix = ['th', 'st', 'nd', 'rd'];
  const v = num % 100;
  return num + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
}