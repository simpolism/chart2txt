/**
 * chart2txt
 * A library to convert astrological chart data to human-readable text
 */

import {
  type Point,
  type ChartData,
  type AspectData,
  type Settings,
  type Aspect,
  type HouseSystem,
  type MultiChartData,
  isMultiChartData,
  type AspectCategory,
} from './types';
import { ZODIAC_SIGNS, DEFAULT_SETTINGS }
from './constants';

// --- Core Calculation Utilities (largely preserved) ---

/**
 * Determines the zodiac sign for a given degree.
 */
function getDegreeSign(degree: number): string {
  const signIndex = Math.floor(degree / 30) % 12;
  return ZODIAC_SIGNS[signIndex];
}

/**
 * Calculates the degree within its 30-degree sign (0-29.99...).
 */
function getDegreeInSign(degree: number): number {
  return degree % 30;
}

/**
 * Calculates the house for a given degree, based on the ascendant.
 */
function getHousePosition(
  houseSystem: HouseSystem,
  pointDegree: number,
  ascendant: number
): {
  house: number;
  degree: number; // Degree into that house
} {
  switch (houseSystem) {
    case 'equal': {
      const housePosition = (pointDegree - ascendant + 360) % 360;
      const house = Math.floor(housePosition / 30) + 1;
      const degree = housePosition % 30;
      return { house, degree };
    }
    case 'whole_sign': {
      const house1SignCusp = (Math.floor(ascendant / 30) % 12) * 30;
      const housePosition = (pointDegree - house1SignCusp + 360) % 360;
      const house = Math.floor(housePosition / 30) + 1;
      const degree = housePosition % 30; // Degree from start of the house sign
      return { house, degree };
    }
  }
}

/**
 * Identifies aspects between planets in a single chart.
 */
function calculateAspects(
  aspectDefinitions: Aspect[],
  planets: Point[]
): AspectData[] {
  const aspects: AspectData[] = [];
  if (planets.length < 2) return aspects;

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planetA = planets[i];
      const planetB = planets[j];
      let diff = Math.abs(planetA.degree - planetB.degree);
      if (diff > 180) diff = 360 - diff;

      for (const aspectType of aspectDefinitions) {
        const orb = Math.abs(diff - aspectType.angle);
        if (orb <= aspectType.orb) {
          aspects.push({
            planetA: planetA.name,
            planetB: planetB.name,
            aspectType: aspectType.name,
            orb,
          });
          break; 
        }
      }
    }
  }
  return aspects;
}

/**
 * Identifies aspects between planets across two charts.
 */
function calculateMultichartAspects(
  aspectDefinitions: Aspect[],
  chart1Planets: Point[],
  chart2Planets: Point[]
): AspectData[] {
  const aspects: AspectData[] = [];
  if (!chart1Planets || !chart2Planets || chart1Planets.length === 0 || chart2Planets.length === 0) {
    return aspects;
  }

  for (const p1 of chart1Planets) {
    for (const p2 of chart2Planets) {
      let diff = Math.abs(p1.degree - p2.degree);
      if (diff > 180) diff = 360 - diff;

      for (const aspectType of aspectDefinitions) {
        const orb = Math.abs(diff - aspectType.angle);
        if (orb <= aspectType.orb) {
          aspects.push({
            planetA: p1.name,
            planetB: p2.name,
            aspectType: aspectType.name,
            orb,
          });
          break;
        }
      }
    }
  }
  return aspects;
}

// --- New Formatting Helper Utilities ---

/**
 * Formats a Date object into a string based on the specified format.
 */
function formatDateCustom(date: Date, format: string): string {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const y = date.getFullYear();

  switch (format.toUpperCase()) {
    case 'MM/DD/YYYY':
      return `${m.toString().padStart(2, '0')}/${d.toString().padStart(2, '0')}/${y}`;
    case 'DD/MM/YYYY':
      return `${d.toString().padStart(2, '0')}/${m.toString().padStart(2, '0')}/${y}`;
    case 'YYYY-MM-DD':
      return `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    default:
      // Fallback to a common locale string if format is unrecognized
      return date.toLocaleDateString();
  }
}

/**
 * Formats the time part of a Date object.
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

// --- New Output Generation Functions ---

function generateMetadataOutput(settings: Settings, chartType: string): string[] {
  return [
    '[METADATA]',
    `chart_type: ${chartType}`,
    `house_system: ${settings.houseSystem}`,
    `date_format: ${settings.dateFormat}`,
  ];
}

function generateChartHeaderOutput(chartName: string | undefined, prefix = 'CHART'): string[] {
  return [`[${prefix}: ${chartName || 'Unknown'}]`];
}

function generateBirthdataOutput(
  location: string | undefined,
  timestamp: Date | undefined,
  dateFormat: string
): string[] {
  if (!timestamp) return ['[BIRTHDATA] Not available'];
  const dateStr = formatDateCustom(timestamp, dateFormat);
  const timeStr = formatTime(timestamp);
  return [`[BIRTHDATA] ${location || 'Unknown Location'}, ${dateStr}, ${timeStr}`];
}

function generateAnglesOutput(ascDegree?: number, mcDegree?: number): string[] {
  const output: string[] = ['[ANGLES]'];
  if (ascDegree !== undefined) {
    output.push(`ASC: ${Math.floor(getDegreeInSign(ascDegree))}° ${getDegreeSign(ascDegree)}`);
  } else {
    output.push('ASC: Not available');
  }
  if (mcDegree !== undefined) {
    output.push(`MC: ${Math.floor(getDegreeInSign(mcDegree))}° ${getDegreeSign(mcDegree)}`);
  } else {
    output.push('MC: Not available');
  }
  return output;
}

function generatePlanetsOutput(
  planets: Point[],
  ascDegree: number | undefined,
  houseSystem: HouseSystem,
  // settings: Settings // Potentially for includeSignDegree if that's still desired for this section
): string[] {
  const output: string[] = ['[PLANETS]'];
  planets.forEach(planet => {
    const sign = getDegreeSign(planet.degree);
    const degInSign = Math.floor(getDegreeInSign(planet.degree));
    let line = `${planet.name}: ${degInSign}° ${sign}`;
    if (ascDegree !== undefined) { // Only add house if ascendant is known
      const houseData = getHousePosition(houseSystem, planet.degree, ascDegree);
      line += `, House ${houseData.house}`;
    }
    output.push(line);
  });
  return output;
}

function generateAspectsOutput(
  title: string,
  aspects: AspectData[],
  aspectCategories: AspectCategory[],
  p1ChartName?: string,
  p2ChartName?: string,
  p2IsTransit = false
): string[] {
  const output: string[] = [title];
  let aspectsFoundInCategory = false;

  aspectCategories.forEach(category => {
    const categoryAspects = aspects.filter(asp => {
      const orb = asp.orb;
      // minOrb is exclusive, maxOrb is inclusive
      const minOrbCheck = category.minOrb === undefined ? true : orb > category.minOrb;
      const maxOrbCheck = orb <= category.maxOrb;
      return minOrbCheck && maxOrbCheck;
    });

    if (categoryAspects.length > 0) {
      aspectsFoundInCategory = true;
      let orbRangeStr = `orb < ${category.maxOrb.toFixed(1)}°`;
      if (category.minOrb !== undefined) {
        orbRangeStr = `orb ${category.minOrb.toFixed(1)}-${category.maxOrb.toFixed(1)}°`;
      }
      output.push(`[${category.name.toUpperCase()}: ${orbRangeStr}]`);

      categoryAspects.sort((a, b) => a.orb - b.orb); // Sort by orb tightness

      categoryAspects.forEach(asp => {
        const p1NameStr = p1ChartName ? `${p1ChartName}'s ${asp.planetA}` : asp.planetA;
        let p2NameStr = asp.planetB;
        if (p2IsTransit) {
          p2NameStr = `transiting ${asp.planetB}`; // As per example "Moon opposition transiting Uranus"
        } else if (p2ChartName) {
          p2NameStr = `${p2ChartName}'s ${asp.planetB}`;
        }
        output.push(`${p1NameStr} ${asp.aspectType} ${p2NameStr}: ${asp.orb.toFixed(1)}°`);
      });
    }
  });

  if (!aspectsFoundInCategory && aspects.length > 0) {
    output.push('No aspects within defined categories.');
  } else if (aspects.length === 0) {
    output.push('None');
  }
  return output;
}

function generateHouseOverlaysOutput(
  chart1: ChartData,
  chart2: ChartData,
  settings: Settings
): string[] {
  const output: string[] = ['[HOUSE OVERLAYS]'];
  const c1Name = chart1.name || 'Chart 1';
  const c2Name = chart2.name || 'Chart 2';

  if (chart2.ascendant !== undefined) {
    output.push(`${c1Name}'s planets in ${c2Name}'s houses:`);
    chart1.planets.forEach(planet => {
      const houseData = getHousePosition(settings.houseSystem, planet.degree, chart2.ascendant!);
      output.push(`${planet.name}: House ${houseData.house}`);
    });
    if (chart1.planets.length === 0) output.push('(No planets for overlay)');
  } else {
    output.push(`${c1Name}'s planets in ${c2Name}'s houses: (${c2Name} ascendant not available)`);
  }

  output.push(''); // Blank line between the two overlay sections

  if (chart1.ascendant !== undefined) {
    output.push(`${c2Name}'s planets in ${c1Name}'s houses:`);
    chart2.planets.forEach(planet => {
      const houseData = getHousePosition(settings.houseSystem, planet.degree, chart1.ascendant!);
      output.push(`${planet.name}: House ${houseData.house}`);
    });
    if (chart2.planets.length === 0) output.push('(No planets for overlay)');
  } else {
    output.push(`${c2Name}'s planets in ${c1Name}'s houses: (${c1Name} ascendant not available)`);
  }
  return output;
}


// --- Main Orchestration Function ---

export function chart2txt(
  data: ChartData | MultiChartData,
  partialSettings: Partial<Settings> = {}
): string {
  const fullSettings: Settings = { ...DEFAULT_SETTINGS, ...partialSettings };
  const outputLines: string[] = [];

  let chartType = 'natal';
  if (isMultiChartData(data)) {
    if (data.chart2 && data.transit) chartType = 'synastry_with_transit';
    else if (data.chart2) chartType = 'synastry';
    else if (data.transit) chartType = 'natal_with_transit'; // Or just 'transit' if chart1 is the focus
  }

  outputLines.push(...generateMetadataOutput(fullSettings, chartType));
  outputLines.push('');

  const processSingleChart = (chartData: ChartData, chartTitlePrefix?: string): void => {
    outputLines.push(...generateChartHeaderOutput(chartData.name, chartTitlePrefix));
    outputLines.push(...generateBirthdataOutput(chartData.location, chartData.timestamp, fullSettings.dateFormat));
    outputLines.push(...generateAnglesOutput(chartData.ascendant, chartData.mc));
    outputLines.push(...generatePlanetsOutput(chartData.planets, chartData.ascendant, fullSettings.houseSystem));
    const aspects = calculateAspects(fullSettings.aspectDefinitions, chartData.planets);
    outputLines.push(...generateAspectsOutput('[ASPECTS]', aspects, fullSettings.aspectCategories));
    outputLines.push('');
  };
  
  const processTransitChartInfo = (transitData: ChartData): void => {
    outputLines.push(...generateChartHeaderOutput(transitData.name || 'Current', 'TRANSIT'));
    // Replace [BIRTHDATA] with [DATETIME] for transits
    const transitDateTimeOutput = generateBirthdataOutput(transitData.location, transitData.timestamp, fullSettings.dateFormat)
      .map(line => line.replace('[BIRTHDATA]', '[DATETIME]'));
    outputLines.push(...transitDateTimeOutput);
    // For transit chart's own planets, houses are usually not shown unless it's a full natal chart for that moment.
    // The example shows planets without houses for the [TRANSIT: Current] section.
    outputLines.push(...generatePlanetsOutput(transitData.planets, undefined, fullSettings.houseSystem));
    outputLines.push('');
  };

  if (isMultiChartData(data)) {
    const chart1 = data.chart1;
    const chart1Name = chart1.name || 'Chart 1';
    processSingleChart(chart1);

    if (data.chart2) {
      const chart2 = data.chart2;
      const chart2Name = chart2.name || 'Chart 2';
      processSingleChart(chart2);

      // Synastry Section
      outputLines.push(...generateChartHeaderOutput(`${chart1Name}-${chart2Name}`, 'SYNASTRY'));
      const synastryAspects = calculateMultichartAspects(fullSettings.aspectDefinitions, chart1.planets, chart2.planets);
      outputLines.push(...generateAspectsOutput('[PLANET-PLANET ASPECTS]', synastryAspects, fullSettings.aspectCategories, chart1Name, chart2Name));
      outputLines.push(''); // Add a blank line after Planet-Planet Aspects
      outputLines.push(...generateHouseOverlaysOutput(chart1, chart2, fullSettings));
      outputLines.push('');
    }

    if (data.transit) {
      const transit = data.transit;
      processTransitChartInfo(transit);

      // Transit Aspects to Chart 1
      const transitAspectsC1 = calculateMultichartAspects(fullSettings.aspectDefinitions, chart1.planets, transit.planets);
      outputLines.push(...generateAspectsOutput(`[TRANSIT ASPECTS: ${chart1Name}]`, transitAspectsC1, fullSettings.aspectCategories, chart1Name, transit.name || "Current", true));
      outputLines.push('');

      if (data.chart2) {
        const chart2Name = data.chart2.name || 'Chart 2';
        // Transit Aspects to Chart 2
        const transitAspectsC2 = calculateMultichartAspects(fullSettings.aspectDefinitions, data.chart2.planets, transit.planets);
        outputLines.push(...generateAspectsOutput(`[TRANSIT ASPECTS: ${chart2Name}]`, transitAspectsC2, fullSettings.aspectCategories, chart2Name, transit.name || "Current", true));
        outputLines.push('');
      }
    }
  } else {
    // Single ChartData object
    processSingleChart(data);
  }

  return outputLines.join('\n').trimEnd(); // Use trimEnd to remove trailing newlines but keep internal ones
}

// Export main function and types (types are also exported from types.ts but can be re-exported here for convenience)
export { ChartData, Point, Settings, Aspect, AspectData, MultiChartData, HouseSystem, AspectCategory };

// Default export for browser usage or simple script imports
export default chart2txt;
