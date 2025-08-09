import { getOrdinal } from '../../../utils/formatting';

/**
 * Generates the [HOUSE OVERLAYS] section for synastry.
 * @param overlays The pre-calculated house overlay data.
 * @param chart1Name The name of the first chart.
 * @param chart2Name The name of the second chart.
 * @returns An array of strings for the output.
 */
export function generateHouseOverlaysOutput(
  overlays: {
    chart1InChart2Houses: { [key: string]: number };
    chart2InChart1Houses: { [key: string]: number };
  },
  chart1Name: string,
  chart2Name: string
): string[] {
  const output: string[] = ['[HOUSE OVERLAYS]'];

  output.push(`${chart1Name}'s planets in ${chart2Name}'s houses:`);
  if (Object.keys(overlays.chart1InChart2Houses).length > 0) {
    output.push(formatHouseOverlayCompact(overlays.chart1InChart2Houses));
  } else {
    output.push(`(${chart2Name} house cusps not available)`);
  }

  output.push(`${chart2Name}'s planets in ${chart1Name}'s houses:`);
  if (Object.keys(overlays.chart2InChart1Houses).length > 0) {
    output.push(formatHouseOverlayCompact(overlays.chart2InChart1Houses));
  } else {
    output.push(`(${chart1Name} house cusps not available)`);
  }

  return output;
}

/**
 * Formats house overlays in a compact format, grouping by house.
 * @param overlays Object mapping planet names to house numbers.
 * @returns A compact string representation.
 */
function formatHouseOverlayCompact(overlays: {
  [key: string]: number;
}): string {
  // Group planets by house
  const houseGroups: { [key: number]: string[] } = {};

  for (const planet in overlays) {
    const house = overlays[planet];
    if (!houseGroups[house]) {
      houseGroups[house] = [];
    }
    houseGroups[house].push(planet);
  }

  // Sort houses numerically and format
  const sortedHouses = Object.keys(houseGroups)
    .map(Number)
    .sort((a, b) => a - b);
  const houseStrings = sortedHouses.map((house) => {
    const planets = houseGroups[house].join(', ');
    return `${getOrdinal(house)}: ${planets}`;
  });

  return houseStrings.join(' | ');
}
