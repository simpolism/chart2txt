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
  const chartPrefix = showChartNames && planet.chartName ? `${planet.chartName}'s ` : '';
  return `${chartPrefix}${planet.name} ${degInSign}° ${planet.sign}${houseStr}`;
}

/**
 * Format a T-Square pattern
 */
function formatTSquare(pattern: AspectPattern, showChartNames = true): string[] {
  if (pattern.type !== 'T-Square') return [];

  const output = ['T-Square:'];
  output.push(`  - Apex: ${formatPlanetPosition(pattern.apex, false, showChartNames)}`);
  output.push(
    `  - Opposition: ${formatPlanetPosition(
      pattern.opposition[0], false, showChartNames
    )} - ${formatPlanetPosition(pattern.opposition[1], false, showChartNames)}`
  );
  output.push(`  - Mode: ${pattern.mode}`);
  output.push(`  - Average orb: ${pattern.averageOrb.toFixed(1)}°`);
  output.push('');

  return output;
}

/**
 * Format a Grand Trine pattern
 */
function formatGrandTrine(pattern: AspectPattern, showChartNames = true): string[] {
  if (pattern.type !== 'Grand Trine') return [];

  const output = ['Grand Trine:'];
  pattern.planets.forEach((planet, index) => {
    output.push(`  - Planet ${index + 1}: ${formatPlanetPosition(planet, false, showChartNames)}`);
  });
  output.push(`  - Element: ${pattern.element}`);
  output.push(`  - Average orb: ${pattern.averageOrb.toFixed(1)}°`);
  output.push('');

  return output;
}

/**
 * Format a Grand Cross pattern
 */
function formatGrandCross(pattern: AspectPattern, showChartNames = true): string[] {
  if (pattern.type !== 'Grand Cross') return [];

  const output = ['Grand Cross:'];
  pattern.planets.forEach((planet, index) => {
    output.push(`  - Planet ${index + 1}: ${formatPlanetPosition(planet, false, showChartNames)}`);
  });
  output.push(`  - Mode: ${pattern.mode}`);
  output.push(`  - Average orb: ${pattern.averageOrb.toFixed(1)}°`);
  output.push('');

  return output;
}

/**
 * Format a Yod pattern
 */
function formatYod(pattern: AspectPattern, showChartNames = true): string[] {
  if (pattern.type !== 'Yod') return [];

  const output = ['Yod:'];
  output.push(`  - Apex: ${formatPlanetPosition(pattern.apex, false, showChartNames)}`);
  output.push(`  - Base planet 1: ${formatPlanetPosition(pattern.base[0], false, showChartNames)}`);
  output.push(`  - Base planet 2: ${formatPlanetPosition(pattern.base[1], false, showChartNames)}`);
  output.push(`  - Average orb: ${pattern.averageOrb.toFixed(1)}°`);
  output.push('');

  return output;
}

/**
 * Format a Mystic Rectangle pattern
 */
function formatMysticRectangle(pattern: AspectPattern, showChartNames = true): string[] {
  if (pattern.type !== 'Mystic Rectangle') return [];

  const output = ['Mystic Rectangle:'];
  output.push(
    `  - Opposition 1: ${formatPlanetPosition(
      pattern.oppositions[0][0], false, showChartNames
    )} - ${formatPlanetPosition(pattern.oppositions[0][1], false, showChartNames)}`
  );
  output.push(
    `  - Opposition 2: ${formatPlanetPosition(
      pattern.oppositions[1][0], false, showChartNames
    )} - ${formatPlanetPosition(pattern.oppositions[1][1], false, showChartNames)}`
  );
  output.push(`  - Average orb: ${pattern.averageOrb.toFixed(1)}°`);
  output.push('');

  return output;
}

/**
 * Format a Kite pattern
 */
function formatKite(pattern: AspectPattern, showChartNames = true): string[] {
  if (pattern.type !== 'Kite') return [];

  const output = ['Kite:'];
  const grandTrineStr = pattern.grandTrine
    .map((p) => formatPlanetPosition(p, false, showChartNames))
    .join(', ');
  output.push(`  - Grand Trine planets: ${grandTrineStr}`);
  output.push(
    `  - Opposition planet: ${formatPlanetPosition(pattern.opposition, false, showChartNames)}`
  );
  output.push(`  - Average orb: ${pattern.averageOrb.toFixed(1)}°`);
  output.push('');

  return output;
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

  // Sort patterns by type for consistent output
  const sortOrder = [
    'T-Square',
    'Grand Trine',
    'Grand Cross',
    'Yod',
    'Mystic Rectangle',
    'Kite',
  ];
  const sortedPatterns = patterns.sort((a, b) => {
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
