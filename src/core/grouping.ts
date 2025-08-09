import { AspectData, Settings } from '../types';

/**
 * Provides a default grouping of aspects into "Tight", "Moderate", and "Wide" categories
 * based on orb thresholds. This is used by the simple chart2txt() function.
 * @param aspects The raw list of aspects to group.
 * @param settings The chart settings, containing aspectStrengthThresholds.
 * @returns A map of category names to aspect data arrays.
 */
export function groupAspects(
  aspects: AspectData[],
  settings: Settings
): Map<string, AspectData[]> {
  const grouped = new Map<string, AspectData[]>();
  const thresholds = settings.aspectStrengthThresholds!;

  const tight: AspectData[] = [];
  const moderate: AspectData[] = [];
  const wide: AspectData[] = [];

  aspects.forEach((aspect) => {
    if (aspect.orb <= thresholds.tight) {
      tight.push(aspect);
    } else if (aspect.orb <= thresholds.moderate) {
      moderate.push(aspect);
    } else {
      wide.push(aspect);
    }
  });

  // Sort each category by orb tightness
  tight.sort((a, b) => a.orb - b.orb);
  moderate.sort((a, b) => a.orb - b.orb);
  wide.sort((a, b) => a.orb - b.orb);

  if (tight.length > 0) {
    const title = `[TIGHT ASPECTS: orb under ${thresholds.tight.toFixed(1)}°]`;
    grouped.set(title, tight);
  }
  if (moderate.length > 0) {
    const title = `[MODERATE ASPECTS: orb ${thresholds.tight.toFixed(
      1
    )}-${thresholds.moderate.toFixed(1)}°]`;
    grouped.set(title, moderate);
  }
  if (wide.length > 0) {
    const title = `[WIDE ASPECTS: orb over ${thresholds.moderate.toFixed(1)}°]`;
    grouped.set(title, wide);
  }

  return grouped;
}
