import { AspectData } from '../../../types';
import { ChartSettings } from '../../../config/ChartSettings';
import { AdvancedAspectPattern } from '../../../core/aspects';
import { formatPlanetName, formatAspectName } from '../../../core/astrology';

/**
 * Generates aspect sections (e.g., [ASPECTS], [PLANET-PLANET ASPECTS], [TRANSIT ASPECTS: Name]).
 * @param title The main title for this aspect block (e.g., "[ASPECTS]").
 * @param aspects Array of calculated aspect data.
 * @param settings The chart settings, containing aspect categories.
 * @param p1ChartName Optional: Name of the first chart/entity for synastry/transit aspects.
 * @param p2ChartName Optional: Name of the second chart/entity for synastry aspects.
 * @param p2IsTransit Optional: Boolean indicating if p2 represents transiting points.
 * @returns An array of strings for the output.
 */
export function generateAspectsOutput(
  title: string,
  aspects: AspectData[],
  settings: ChartSettings,
  p1ChartName?: string,
  p2ChartName?: string, // For synastry, this is the second person's name. For transits, it could be "Current" or the transit chart name.
  p2IsTransit = false
): string[] {
  const output: string[] = [title];
  let aspectsFoundInAnyCategory = false;

  settings.aspectCategories.forEach((category) => {
    const categoryAspects = aspects.filter((asp) => {
      const orb = asp.orb;
      const minOrbCheck =
        category.minOrb === undefined ? true : orb > category.minOrb;
      const maxOrbCheck = orb <= category.maxOrb;
      return minOrbCheck && maxOrbCheck;
    });

    if (categoryAspects.length > 0) {
      aspectsFoundInAnyCategory = true;
      let orbRangeStr = `orb < ${category.maxOrb.toFixed(1)}°`;
      if (category.minOrb !== undefined) {
        // Ensure minOrb is less than maxOrb for sensible range string
        orbRangeStr =
          category.minOrb < category.maxOrb
            ? `orb ${category.minOrb.toFixed(1)}-${category.maxOrb.toFixed(1)}°`
            : `orb > ${category.minOrb.toFixed(
                1
              )}° & < ${category.maxOrb.toFixed(1)}°`; // Fallback for unusual category def
      }
      output.push(`[${category.name.toUpperCase()}: ${orbRangeStr}]`);

      categoryAspects.sort((a, b) => a.orb - b.orb); // Sort by orb tightness

      categoryAspects.forEach((asp) => {
        const formattedPlanetA = formatPlanetName(asp.planetA, settings.displayMode);
        const formattedPlanetB = formatPlanetName(asp.planetB, settings.displayMode);
        const formattedAspect = formatAspectName(asp.aspectType, settings.displayMode);
        
        const p1NameStr = p1ChartName
          ? `${p1ChartName}'s ${formattedPlanetA}`
          : formattedPlanetA;
        let p2NameStr = formattedPlanetB;

        if (p2IsTransit) {
          // For "Transit Aspects: Alice", p1 is Alice, p2 is the transiting planet.
          // Example: "Alice's Mercury opposition transiting Neptune: 0.3°" - here p2ChartName is not used for the planet itself.
          p2NameStr = `transiting ${formattedPlanetB}`;
        } else if (p2ChartName) {
          // For "Synastry: Alice-Bob", "Planet-Planet Aspects"
          // Example: "Alice's Mercury opposition Bob's Neptune: 0.3°"
          p2NameStr = `${p2ChartName}'s ${formattedPlanetB}`;
        }
        // If neither p2IsTransit nor p2ChartName, it's a natal chart aspect, e.g. "Venus opposition Pluto: 1.2°"

        output.push(
          `${p1NameStr} ${formattedAspect} ${p2NameStr}: ${asp.orb.toFixed(1)}°`
        );
      });
    }
  });

  if (!aspectsFoundInAnyCategory && aspects.length > 0) {
    output.push('No aspects within defined categories.');
  } else if (aspects.length === 0) {
    output.push('None');
  }
  return output;
}

/**
 * Generates the [ADVANCED PATTERNS] section for aspect patterns.
 * @param patterns Array of advanced aspect patterns.
 * @returns An array of strings for the output.
 */
export function generateAdvancedPatternsOutput(
  patterns: AdvancedAspectPattern[]
): string[] {
  const output: string[] = ['[ADVANCED PATTERNS]'];
  
  if (patterns.length === 0) {
    output.push('None detected');
    return output;
  }
  
  patterns.forEach(pattern => {
    output.push(pattern.description);
  });
  
  return output;
}
