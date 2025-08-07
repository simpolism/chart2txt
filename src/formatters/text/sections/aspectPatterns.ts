import { AspectPattern, PlanetPosition } from '../../../types';
import { getDegreeInSign } from '../../../core/astrology';
import { getOrdinal } from '../../../utils/formatting';

/**
 * Format a planet position for display
 */
function formatPlanetPosition(planet: PlanetPosition): string {
  const degInSign = Math.floor(getDegreeInSign(planet.degree));
  const houseStr = planet.house ? ` (${getOrdinal(planet.house)} house)` : '';
  return `${planet.name} ${degInSign}° ${planet.sign}${houseStr}`;
}

/**
 * Format a T-Square pattern
 */
function formatTSquare(pattern: AspectPattern): string[] {
  if (pattern.type !== 'T-Square') return [];

  const output = ['T-Square:'];
  output.push(`  - Apex: ${formatPlanetPosition(pattern.apex)}`);
  output.push(
    `  - Opposition: ${formatPlanetPosition(
      pattern.opposition[0]
    )} - ${formatPlanetPosition(pattern.opposition[1])}`
  );
  output.push(`  - Mode: ${pattern.mode}`);
  output.push(`  - Average orb: ${pattern.averageOrb.toFixed(1)}°`);
  output.push('');

  return output;
}

/**
 * Format a Grand Trine pattern
 */
function formatGrandTrine(pattern: AspectPattern): string[] {
  if (pattern.type !== 'Grand Trine') return [];

  const output = ['Grand Trine:'];
  pattern.planets.forEach((planet, index) => {
    output.push(`  - Planet ${index + 1}: ${formatPlanetPosition(planet)}`);
  });
  output.push(`  - Element: ${pattern.element}`);
  output.push(`  - Average orb: ${pattern.averageOrb.toFixed(1)}°`);
  output.push('');

  return output;
}

/**
 * Format a Grand Cross pattern
 */
function formatGrandCross(pattern: AspectPattern): string[] {
  if (pattern.type !== 'Grand Cross') return [];

  const output = ['Grand Cross:'];
  pattern.planets.forEach((planet, index) => {
    output.push(`  - Planet ${index + 1}: ${formatPlanetPosition(planet)}`);
  });
  output.push(`  - Mode: ${pattern.mode}`);
  output.push(`  - Average orb: ${pattern.averageOrb.toFixed(1)}°`);
  output.push('');

  return output;
}

/**
 * Format a Yod pattern
 */
function formatYod(pattern: AspectPattern): string[] {
  if (pattern.type !== 'Yod') return [];

  const output = ['Yod:'];
  output.push(`  - Apex: ${formatPlanetPosition(pattern.apex)}`);
  output.push(`  - Base planet 1: ${formatPlanetPosition(pattern.base[0])}`);
  output.push(`  - Base planet 2: ${formatPlanetPosition(pattern.base[1])}`);
  output.push(`  - Average orb: ${pattern.averageOrb.toFixed(1)}°`);
  output.push('');

  return output;
}

/**
 * Format a Mystic Rectangle pattern
 */
function formatMysticRectangle(pattern: AspectPattern): string[] {
  if (pattern.type !== 'Mystic Rectangle') return [];

  const output = ['Mystic Rectangle:'];
  output.push(
    `  - Opposition 1: ${formatPlanetPosition(
      pattern.oppositions[0][0]
    )} - ${formatPlanetPosition(pattern.oppositions[0][1])}`
  );
  output.push(
    `  - Opposition 2: ${formatPlanetPosition(
      pattern.oppositions[1][0]
    )} - ${formatPlanetPosition(pattern.oppositions[1][1])}`
  );
  output.push(`  - Average orb: ${pattern.averageOrb.toFixed(1)}°`);
  output.push('');

  return output;
}

/**
 * Format a Kite pattern
 */
function formatKite(pattern: AspectPattern): string[] {
  if (pattern.type !== 'Kite') return [];

  const output = ['Kite:'];
  const grandTrineStr = pattern.grandTrine.map((p) => p.name).join(', ');
  output.push(`  - Grand Trine planets: ${grandTrineStr}`);
  output.push(
    `  - Opposition planet: ${formatPlanetPosition(pattern.opposition)}`
  );
  output.push(`  - Average orb: ${pattern.averageOrb.toFixed(1)}°`);
  output.push('');

  return output;
}

/**
 * Generates the [ASPECT PATTERNS] section of the chart output.
 * @param patterns Array of detected aspect patterns
 * @param customTitle Optional custom title for the section
 * @returns An array of strings for the output.
 */
export function generateAspectPatternsOutput(
  patterns: AspectPattern[],
  customTitle?: string
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
        output.push(...formatTSquare(pattern));
        break;
      case 'Grand Trine':
        output.push(...formatGrandTrine(pattern));
        break;
      case 'Grand Cross':
        output.push(...formatGrandCross(pattern));
        break;
      case 'Yod':
        output.push(...formatYod(pattern));
        break;
      case 'Mystic Rectangle':
        output.push(...formatMysticRectangle(pattern));
        break;
      case 'Kite':
        output.push(...formatKite(pattern));
        break;
    }
  });

  // Remove trailing empty line
  if (output[output.length - 1] === '') {
    output.pop();
  }

  return output;
}
