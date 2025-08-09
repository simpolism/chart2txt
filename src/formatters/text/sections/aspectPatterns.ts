import { AspectPattern, PlanetPosition } from '../../../types';
import { getDegreeInSign } from '../../../core/astrology';
import { getOrdinal } from '../../../utils/formatting';

/**
 * Format a planet position for display
 */
function formatPlanetPosition(
  planet: PlanetPosition,
  includeHouse = false,
  showChartNames = true
): string {
  const degInSign = Math.floor(getDegreeInSign(planet.degree));
  const houseStr =
    includeHouse && planet.house ? ` (${getOrdinal(planet.house)} house)` : '';
  const chartPrefix =
    showChartNames && planet.chartName ? `${planet.chartName}'s ` : '';
  return `${chartPrefix}${planet.name} ${degInSign}° ${planet.sign}${houseStr}`;
}

/**
 * Format a T-Square pattern in compact format
 */
function formatTSquare(
  pattern: AspectPattern,
  showChartNames = true
): string[] {
  if (pattern.type !== 'T-Square') return [];

  const apex = formatPlanetPosition(pattern.apex, false, showChartNames);
  const opp1 = formatPlanetPosition(pattern.opposition[0], false, showChartNames);
  const opp2 = formatPlanetPosition(pattern.opposition[1], false, showChartNames);
  
  return [`T-Square (${pattern.mode}, ${pattern.averageOrb.toFixed(1)}°): ${apex} ← ${opp1} ↔ ${opp2}`];
}

/**
 * Format a Grand Trine pattern in compact format
 */
function formatGrandTrine(
  pattern: AspectPattern,
  showChartNames = true
): string[] {
  if (pattern.type !== 'Grand Trine') return [];

  const planets = pattern.planets
    .map(p => formatPlanetPosition(p, false, showChartNames))
    .join(' △ ');
  
  return [`Grand Trine (${pattern.element}, ${pattern.averageOrb.toFixed(1)}°): ${planets}`];
}

/**
 * Format a Grand Cross pattern in compact format
 */
function formatGrandCross(
  pattern: AspectPattern,
  showChartNames = true
): string[] {
  if (pattern.type !== 'Grand Cross') return [];

  const planets = pattern.planets
    .map(p => formatPlanetPosition(p, false, showChartNames))
    .join(' ⨯ ');
  
  return [`Grand Cross (${pattern.mode}, ${pattern.averageOrb.toFixed(1)}°): ${planets}`];
}

/**
 * Format a Yod pattern in compact format
 */
function formatYod(pattern: AspectPattern, showChartNames = true): string[] {
  if (pattern.type !== 'Yod') return [];

  const apex = formatPlanetPosition(pattern.apex, false, showChartNames);
  const base1 = formatPlanetPosition(pattern.base[0], false, showChartNames);
  const base2 = formatPlanetPosition(pattern.base[1], false, showChartNames);
  
  return [`Yod (${pattern.averageOrb.toFixed(1)}°): ${apex} ← ${base1} • ${base2}`];
}

/**
 * Format a Mystic Rectangle pattern in compact format
 */
function formatMysticRectangle(
  pattern: AspectPattern,
  showChartNames = true
): string[] {
  if (pattern.type !== 'Mystic Rectangle') return [];

  const opp1_1 = formatPlanetPosition(pattern.oppositions[0][0], false, showChartNames);
  const opp1_2 = formatPlanetPosition(pattern.oppositions[0][1], false, showChartNames);
  const opp2_1 = formatPlanetPosition(pattern.oppositions[1][0], false, showChartNames);
  const opp2_2 = formatPlanetPosition(pattern.oppositions[1][1], false, showChartNames);
  
  return [`Mystic Rectangle (${pattern.averageOrb.toFixed(1)}°): ${opp1_1} ↔ ${opp1_2} | ${opp2_1} ↔ ${opp2_2}`];
}

/**
 * Format a Kite pattern in compact format
 */
function formatKite(pattern: AspectPattern, showChartNames = true): string[] {
  if (pattern.type !== 'Kite') return [];

  const grandTrineStr = pattern.grandTrine
    .map(p => formatPlanetPosition(p, false, showChartNames))
    .join(' △ ');
  const oppositionPlanet = formatPlanetPosition(pattern.opposition, false, showChartNames);
  
  // Get the element from the first planet's sign for context
  const element = pattern.grandTrine[0].sign ? getElementFromSign(pattern.grandTrine[0].sign) : '';
  const elementStr = element ? `${element}, ` : '';
  
  return [`Kite (${elementStr}${pattern.averageOrb.toFixed(1)}°): [${grandTrineStr}] ← ${oppositionPlanet}`];
}

/**
 * Helper function to get element from sign
 */
function getElementFromSign(sign: string): string {
  const fireSigns = ['Aries', 'Leo', 'Sagittarius'];
  const earthSigns = ['Taurus', 'Virgo', 'Capricorn'];
  const airSigns = ['Gemini', 'Libra', 'Aquarius'];
  const waterSigns = ['Cancer', 'Scorpio', 'Pisces'];
  
  if (fireSigns.includes(sign)) return 'Fire';
  if (earthSigns.includes(sign)) return 'Earth';
  if (airSigns.includes(sign)) return 'Air';
  if (waterSigns.includes(sign)) return 'Water';
  return '';
}

/**
 * Check if a Grand Trine is part of any Kite pattern within the same analysis context
 * Uses exact planet identity matching (chart name + planet name + degree)
 */
function isGrandTrinePartOfKite(grandTrine: AspectPattern, patterns: AspectPattern[]): boolean {
  if (grandTrine.type !== 'Grand Trine') return false;
  
  return patterns.some(pattern => {
    if (pattern.type !== 'Kite') return false;
    
    // Create unique identifiers for exact planet identity matching
    const createPlanetId = (p: any) => `${p.chartName || ''}-${p.name}-${p.degree}`;
    
    const kiteGrandTrinePlanets = pattern.grandTrine.map(createPlanetId);
    const grandTrinePlanets = grandTrine.planets.map(createPlanetId);
    
    // Check if the sets of planets are identical (same planets, same count)
    return kiteGrandTrinePlanets.length === grandTrinePlanets.length &&
           kiteGrandTrinePlanets.every(kp => grandTrinePlanets.includes(kp));
  });
}

/**
 * Generates the [ASPECT PATTERNS] section of the chart output.
 * @param patterns Array of detected aspect patterns
 * @param customTitle Optional custom title for the section
 * @param showChartNames Whether to show chart names for planets (false for single charts, true for multi-chart)
 * @returns An array of strings for the output.
 */
export function generateAspectPatternsOutput(
  patterns: AspectPattern[],
  customTitle?: string,
  showChartNames = true
): string[] {
  const output: string[] = [
    customTitle ? `[ASPECT PATTERNS: ${customTitle}]` : '[ASPECT PATTERNS]',
  ];

  if (patterns.length === 0) {
    // General statement plus explicit enumeration to prevent LLM hallucinations
    output.push('No aspect patterns detected.');
    output.push('No T-Squares detected.');
    output.push('No Grand Trines detected.');
    return output;
  }

  // Filter out Grand Trines that are part of Kites to avoid duplication
  const filteredPatterns = patterns.filter(pattern => {
    if (pattern.type === 'Grand Trine') {
      return !isGrandTrinePartOfKite(pattern, patterns);
    }
    return true;
  });

  // Sort patterns by type for consistent output
  const sortOrder = [
    'T-Square',
    'Grand Trine',
    'Grand Cross',
    'Yod',
    'Mystic Rectangle',
    'Kite',
  ];
  const sortedPatterns = filteredPatterns.sort((a, b) => {
    return sortOrder.indexOf(a.type) - sortOrder.indexOf(b.type);
  });

  sortedPatterns.forEach((pattern) => {
    switch (pattern.type) {
      case 'T-Square':
        output.push(...formatTSquare(pattern, showChartNames));
        break;
      case 'Grand Trine':
        output.push(...formatGrandTrine(pattern, showChartNames));
        break;
      case 'Grand Cross':
        output.push(...formatGrandCross(pattern, showChartNames));
        break;
      case 'Yod':
        output.push(...formatYod(pattern, showChartNames));
        break;
      case 'Mystic Rectangle':
        output.push(...formatMysticRectangle(pattern, showChartNames));
        break;
      case 'Kite':
        output.push(...formatKite(pattern, showChartNames));
        break;
    }
  });

  // Remove trailing empty line
  if (output[output.length - 1] === '') {
    output.pop();
  }

  return output;
}
