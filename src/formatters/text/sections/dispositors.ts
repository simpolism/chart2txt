/**
 * Generates the [DISPOSITOR TREE] section of the chart output.
 * @param dispositors A map of planet names to their full dispositor chain string, or summary data.
 * @returns An array of strings for the output.
 */
export function generateDispositorsOutput(dispositors: {
  [key: string]: string;
}): string[] {
  // Check if this is summary format (finals mode)
  if (dispositors['summary']) {
    return [`[DISPOSITORS] ${dispositors['summary']}`];
  }

  // Traditional format
  const output: string[] = ['[DISPOSITOR TREE]'];
  
  if (Object.keys(dispositors).length === 0) {
    output.push('No dispositor data available.');
    return output;
  }

  for (const planet in dispositors) {
    output.push(dispositors[planet]);
  }

  return output;
}
