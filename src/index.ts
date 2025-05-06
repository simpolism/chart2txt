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
} from './types';
import { ZODIAC_SIGNS, DEFAULT_SETTINGS } from './constants';

/**
 * Determines the zodiac sign for a given degree
 */
function getDegreeSign(degree: number): string {
  const signIndex = Math.floor(degree / 30) % 12;
  return ZODIAC_SIGNS[signIndex];
}

/**
 * Calculates the house for a given degree, based on the ascendant
 */
function getHousePosition(
  houseSystem: HouseSystem,
  pointDegree: number,
  ascendant: number
): {
  house: number;
  degree: number;
} {
  switch (houseSystem) {
    case 'equal': {
      // House 1 starts at the ascendant
      const housePosition = (pointDegree - ascendant + 360) % 360;
      const house = Math.floor(housePosition / 30) + 1;
      const degree = housePosition % 30;
      return { house, degree };
    }
    case 'whole_sign': {
      // House 1 starts at beginning of ascendant sign
      const house1SignCusp = (Math.floor(ascendant / 30) % 12) * 30;

      // Computation proceeds same as equal, using sign cusp
      const housePosition = (pointDegree - house1SignCusp + 360) % 360;
      const house = Math.floor(housePosition / 30) + 1;
      const degree = housePosition % 30;
      return { house, degree };
    }
  }
}

/**
 * Identifies aspects between planets
 */
function calculateAspects(
  aspectDefinitions: Aspect[],
  planets: Point[]
): AspectData[] {
  const aspects: AspectData[] = [];

  // Compare each planet with every other planet
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planetA = planets[i];
      const planetB = planets[j];

      // Calculate the angular difference
      let diff = Math.abs(planetA.degree - planetB.degree);
      if (diff > 180) diff = 360 - diff;

      // Check against each aspect type
      for (const aspectType of aspectDefinitions) {
        const orb = Math.abs(diff - aspectType.angle);
        if (orb <= aspectType.orb) {
          aspects.push({
            planetA: planetA.name,
            planetB: planetB.name,
            aspectType: aspectType.name,
            orb,
          });
          break; // Only record the strongest aspect between two planets
        }
      }
    }
  }

  return aspects;
}

/**
 * Formats planet sign positions as text
 */
function formatPlanetSigns(
  planets: Point[],
  ascendant?: number,
  points: Point[] = [],
  includeDegree = DEFAULT_SETTINGS.includeSignDegree
): string {
  const ascPoint: Point[] = ascendant
    ? [{ name: 'Ascendant', degree: ascendant }]
    : [];
  const output = [...ascPoint, ...planets, ...points]
    .map((planet) => {
      const sign = getDegreeSign(planet.degree);
      if (includeDegree) {
        const degree = Math.floor(planet.degree % 30);
        return `${planet.name} is at ${degree}° ${sign}`;
      } else {
        return `${planet.name} is in ${sign}`;
      }
    })
    .join('. ');
  return output ? `${output}.` : '';
}

/**
 * Formats planet house positions as text
 */
function formatPlanetHouses(
  houseSystem: HouseSystem,
  ascendant: number,
  planets: Point[],
  points: Point[] = [],
  includeDegree = DEFAULT_SETTINGS.includeHouseDegree
): string {
  // TODO: house systems
  const output = [...planets, ...points]
    .map((planet) => {
      const houseData = getHousePosition(houseSystem, planet.degree, ascendant);
      if (includeDegree) {
        return `${planet.name} is at ${houseData.degree}° in house ${houseData.house}`;
      } else {
        return `${planet.name} is in house ${houseData.house}`;
      }
    })
    .join('. ');
  return output ? `${output}.` : '';
}

/**
 * Formats aspects between planets as text
 */
function formatAspects(aspects: AspectData[]): string {
  const output = aspects
    .map((aspect) => {
      return `${aspect.planetA} is in ${aspect.aspectType} with ${
        aspect.planetB
      } (orb: ${aspect.orb.toFixed(1)}°)`;
    })
    .join('. ');
  return output ? `${output}.` : '';
}

/**
 * Formats provided location and time, if present, as text
 */
function formatLocationAndDate(location?: string, timestamp?: Date): string {
  const locationString = location ? `location: ${location}` : '';
  const timestampString = timestamp ? `at: ${timestamp.toLocaleString()}` : '';
  return [locationString, timestampString].filter((s) => s !== '').join(', ');
}

/**
 * Formats a full ChartData object into a multi-paragraph string specifying (if provided)
 * name, geographic location, date, planets, houses, and aspects within the chart.
 */
function formatChartData(
  data: ChartData,
  settings: Settings,
  isTransit = false
) {
  // format header with name if provided
  let result = '';
  const header = !isTransit
    ? `Astrology Chart${data.name ? ' for ' + data.name : ''}`
    : `Transit Chart${data.name ? ' (' + data.name + ')' : ''}`;
  result += header;
  const locationAndDate = formatLocationAndDate(data.location, data.timestamp);
  if (locationAndDate) {
    result += ` (${locationAndDate})`;
  }
  result += ':\n\n';

  // format planets
  if (!settings.omitSigns) {
    result += formatPlanetSigns(
      data.planets,
      settings.includeAscendant && data.ascendant ? data.ascendant : undefined,
      settings.omitPoints ? [] : data.points,
      settings.includeSignDegree
    );
  }

  // format houses
  if (!settings.omitHouses && data.ascendant !== undefined) {
    result +=
      '\n\n' +
      formatPlanetHouses(
        settings.houseSystem,
        data.ascendant,
        data.planets,
        settings.omitPoints ? [] : data.points,
        settings.includeHouseDegree
      );
  }

  // format aspects
  if (!settings.omitAspects) {
    const aspects = calculateAspects(settings.aspectDefinitions, data.planets);
    if (aspects.length > 0) {
      result += '\n\n' + formatAspects(aspects);
    }
  }

  return result;
}

/**
 * Identifies aspects between planets across two charts.
 * PlanetA is always from chart1, PlanetB always from chart2.
 */
function calculateMultichartAspects(
  aspectDefinitions: Aspect[],
  chart1Planets: Point[],
  chart2Planets: Point[]
): AspectData[] {
  const aspects: AspectData[] = [];

  // Compare each planet in chart1 with every planet in chart2
  for (let i = 0; i < chart1Planets.length; i++) {
    for (let j = i + 1; j < chart2Planets.length; j++) {
      const chart1Planet = chart1Planets[i];
      const chart2Planet = chart2Planets[j];

      // Calculate the angular difference
      let diff = Math.abs(chart1Planet.degree - chart2Planet.degree);
      if (diff > 180) diff = 360 - diff;

      // Check against each aspect type
      for (const aspectType of aspectDefinitions) {
        const orb = Math.abs(diff - aspectType.angle);
        if (orb <= aspectType.orb) {
          aspects.push({
            planetA: chart1Planet.name,
            planetB: chart2Planet.name,
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
 * Formats aspects between planets as text
 */
function formatMultichartAspects(
  aspects: AspectData[],
  c1Name: string,
  c2Name: string,
  isTransit = false
): string {
  const output = aspects
    .map((aspect) => {
      if (!isTransit) {
        return `${c1Name}'s ${aspect.planetA} is in ${
          aspect.aspectType
        } with ${c2Name}'s ${aspect.planetB} (orb: ${aspect.orb.toFixed(1)}°)`;
      } else {
        return `${c1Name}'s ${aspect.planetA} is in ${
          aspect.aspectType
        } with transiting ${aspect.planetB} (orb: ${aspect.orb.toFixed(1)}°)`;
      }
    })
    .join('. ');
  return output ? `${output}.` : '';
}

function formatHouseEquivalences(
  houseSystem: HouseSystem,
  c1Name: string,
  c2Name: string,
  c1Ascendant: number,
  c2Ascendant: number
) {
  const c1Asc = getHousePosition(houseSystem, c1Ascendant, c2Ascendant);
  const c1AscText = `${c1Name}'s ascendant is at ${c1Asc.degree}° in ${c2Name}'s house ${c1Asc.house}.`;
  const c2Asc = getHousePosition(houseSystem, c2Ascendant, c1Ascendant);
  const c2AscText = `${c2Name}'s ascendant is at ${c2Asc.degree}° in ${c1Name}'s house ${c2Asc.house}.`;
  return `${c1AscText} ${c2AscText}`;
}

/**
 * Formats planet house positions as text
 */
function formatCrossChartPlanetsInHouses(
  houseSystem: HouseSystem,
  c1Name: string,
  c2Name: string,
  c1Ascendant: number,
  c2Planets: Point[],
  c2Points: Point[] = [],
  includeDegree = DEFAULT_SETTINGS.includeHouseDegree,
  isC2Transit = false
): string {
  // TODO: house systems
  const output = [...c2Planets, ...c2Points]
    .map((planet) => {
      const houseData = getHousePosition(
        houseSystem,
        planet.degree,
        c1Ascendant
      );
      if (isC2Transit) {
        return `${planet.name} is transiting ${c1Name}'s house ${houseData.house} at ${houseData.degree}°`;
      } else if (includeDegree) {
        return `${c2Name}'s ${planet.name} is at ${houseData.degree}° in ${c1Name}'s house ${houseData.house}`;
      } else {
        return `${c2Name}'s ${planet.name} is in ${c1Name}'s house ${houseData.house}`;
      }
    })
    .join('. ');
  return output ? `${output}.` : '';
}
/**
 * Given two ChartData objects, produces a multi-paragraph string specifying the relationship
 * between the two charts. The function will generate the following:
 * - Aspects between chart1 and chart2 planets.
 * - Planet locations from chart1 in chart2 houses and vice versa.
 * - House equivalences between chart1 and chart2, incl ascendant location.
 *
 * If the chart interaction is a transit, chart2 is assumed as transiting planets and different language
 * may be used to describe the interactions.
 */
function formatChartInteractions(
  chart1: ChartData,
  chart2: ChartData,
  settings: Settings,
  isTransit = false
): string {
  const c1Name = chart1.name || 'chart1';
  const c2Name = chart2.name || isTransit ? 'transit' : 'chart2';
  let result = '';

  const aspects = calculateMultichartAspects(
    settings.aspectDefinitions,
    chart1.planets,
    chart2.planets
  );
  const aspectText = formatMultichartAspects(
    aspects,
    c1Name,
    c2Name,
    isTransit
  );
  result += aspectText;

  // for transits, only compute transit planets in chart1's houses
  // skip cross-houses and chart1's planets in chart2's houses
  if (isTransit && chart1.ascendant) {
    const housesTransitText = formatCrossChartPlanetsInHouses(
      settings.houseSystem,
      c1Name,
      c2Name,
      chart1.ascendant,
      chart2.planets,
      chart2.points,
      settings.includeHouseDegree,
      true
    );
    result += '\n\n' + housesTransitText;
    return result;
  }

  // compute house equivalences
  if (chart1.ascendant && chart2.ascendant) {
    const houseEquivalences = formatHouseEquivalences(
      settings.houseSystem,
      c1Name,
      c2Name,
      chart1.ascendant,
      chart2.ascendant
    );
    result += '\n\n' + houseEquivalences;
  }

  // compute planets in houses
  if (chart1.ascendant) {
    const c1Housesc2Planets = formatCrossChartPlanetsInHouses(
      settings.houseSystem,
      c1Name,
      c2Name,
      chart1.ascendant,
      chart2.planets,
      chart2.points,
      settings.includeHouseDegree
    );
    result += '\n\n' + c1Housesc2Planets;
  }
  if (chart2.ascendant) {
    const c2Housesc1Planets = formatCrossChartPlanetsInHouses(
      settings.houseSystem,
      c2Name,
      c1Name,
      chart2.ascendant,
      chart1.planets,
      chart1.points,
      settings.includeHouseDegree
    );
    result += '\n\n' + c2Housesc1Planets;
  }
  return result;
}

/**
 * Main function to convert chart data to text
 */
export function chart2txt(
  data: ChartData | MultiChartData,
  settings: Partial<Settings> = {}
): string {
  // override default settings with any provided settings data
  const fullSettings: Settings = Object.assign({}, DEFAULT_SETTINGS, settings);

  if (isMultiChartData(data)) {
    // handle multi-chart data
    // always compute chart1 as normal
    let result = formatChartData(data.chart1, fullSettings);

    // compute full data for chart1 and chart2 if provided
    if (data.chart2) {
      const chart2Result = formatChartData(data.chart2, fullSettings);

      // compute chart1 + chart2 interactions
      const interactions = formatChartInteractions(
        data.chart1,
        data.chart2,
        fullSettings
      );
      result += chart2Result + interactions;
    }

    // append transits if provided
    if (data.transit) {
      const transitResults = formatChartData(data.transit, fullSettings, true);

      // compute chart1 transits
      const chart1Transits = formatChartInteractions(
        data.chart1,
        data.transit,
        fullSettings,
        true
      );

      result += transitResults + '\n\n' + chart1Transits;

      // if chart2 exists, compute transits
      if (data.chart2) {
        const chart2Transits = formatChartInteractions(
          data.chart2,
          data.transit,
          fullSettings,
          true
        );
        result += '\n\n' + chart2Transits;
      }
    }
    return result;
  }
  return formatChartData(data, fullSettings);
}

// Export main function and types
export { ChartData, Point, Settings };

// Default export for browser usage
export default chart2txt;
