import { AspectData } from '../../../types';

/**
 * Generates the output for a single aspect line.
 * @param asp The aspect data.
 * @param p1ChartName Optional name of the first chart.
 * @param p2ChartName Optional name of the second chart.
 * @param p2IsTransit Optional flag if the second chart is for transits.
 * @returns A formatted string for the aspect.
 */
function formatAspectLine(
  asp: AspectData,
  p1ChartName?: string,
  p2ChartName?: string,
  p2IsTransit = false
): string {
  const p1NameStr = p1ChartName
    ? `${p1ChartName}'s ${asp.planetA}`
    : asp.planetA;
  let p2NameStr = asp.planetB;

  if (p2IsTransit) {
    p2NameStr = `transiting ${asp.planetB}`;
  } else if (p2ChartName) {
    p2NameStr = `${p2ChartName}'s ${asp.planetB}`;
  }

  const applicationStr =
    asp.application && asp.application !== 'exact'
      ? ` (${asp.application})`
      : '';
  return `${p1NameStr} ${asp.aspectType} ${p2NameStr}: ${asp.orb.toFixed(
    1
  )}°${applicationStr}`;
}

/**
 * Generates aspect sections from a pre-grouped map of aspects.
 * @param title The main title for this aspect block (e.g., "[ASPECTS]").
 * @param groupedAspects A map of category names to aspect data arrays.
 * @param p1ChartName Optional: Name of the first chart/entity for synastry/transit aspects.
 * @param p2ChartName Optional: Name of the second chart/entity for synastry aspects.
 * @param p2IsTransit Optional: Boolean indicating if p2 represents transiting points.
 * @returns An array of strings for the output.
 */
export function generateAspectsOutput(
  title: string,
  groupedAspects?: Map<string, AspectData[]>,
  p1ChartName?: string,
  p2ChartName?: string,
  p2IsTransit = false
): string[] {
  const output: string[] = [title];

  if (!groupedAspects || groupedAspects.size === 0) {
    output.push('None');
    return output;
  }

  groupedAspects.forEach((categoryAspects, categoryName) => {
    output.push(categoryName); // The category name is the pre-formatted key from the map
    categoryAspects.forEach((asp) => {
      output.push(formatAspectLine(asp, p1ChartName, p2ChartName, p2IsTransit));
    });
  });

  return output;
}
