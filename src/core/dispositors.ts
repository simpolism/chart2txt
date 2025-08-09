import { Point } from '../types';
import { ZODIAC_SIGN_DATA } from '../constants';
import { getSign } from '../utils/formatting';

/**
 * Calculates the dispositor for a single planet.
 * @param planet The planet to find the dispositor for.
 * @returns The name of the dispositor planet.
 */
function getDispositor(planet: Point): string {
  const sign = getSign(planet.degree);
  const signData = ZODIAC_SIGN_DATA.find((s) => s.name === sign);
  return signData ? signData.ruler : 'Unknown';
}

/**
 * Calculates the full dispositor chain for each planet in the chart.
 * @param planets The list of planets in the chart.
 * @returns A map of each planet to its full dispositor chain string.
 */
export function calculateDispositors(planets: Point[]): {
  [key: string]: string;
} {
  const dispositorMap: { [key: string]: string } = {};
  planets.forEach((p) => {
    dispositorMap[p.name] = getDispositor(p);
  });

  const chains: { [key: string]: string } = {};
  planets.forEach((planet) => {
    const path = [planet.name];
    let current = planet.name;
    let chain = `${current}`;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const nextDispositor = dispositorMap[current];
      // eslint-disable-next-line no-prototype-builtins
      if (!nextDispositor || !dispositorMap.hasOwnProperty(nextDispositor)) {
        // Dispositor is not in the chart, so the chain ends.
        chain += ` → ${nextDispositor} (not in chart)`;
        break;
      }

      if (nextDispositor === current) {
        // Planet is its own dispositor (final dispositor).
        chain += ` → (final)`;
        break;
      }

      if (path.includes(nextDispositor)) {
        // A loop is detected.
        chain += ` → ${nextDispositor} (cycle)`;
        break;
      }

      path.push(nextDispositor);
      chain += ` → ${nextDispositor}`;
      current = nextDispositor;
    }
    chains[planet.name] = chain;
  });

  return chains;
}
