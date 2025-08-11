import { Point } from '../types';
import { ZODIAC_SIGN_DATA } from '../constants';
import { getSign } from '../utils/formatting';

type DispositorMap = { [key: string]: string };
type AnalysisResult = {
  path: string[];
  isCycle: boolean;
  isFinal: boolean;
  isBroken: boolean;
};
type AnalysisCache = { [key: string]: AnalysisResult };

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
 * Analyzes the dispositor graph for a single planet, using memoization to avoid re-computation.
 * @param startPlanet - The planet to begin the analysis from.
 * @param dispositorMap - A map of each planet to its direct dispositor.
 * @param cache - A cache of already computed results to avoid redundant work.
 * @returns The analysis result for the starting planet.
 */
function analyzePlanetChain(
  startPlanet: string,
  dispositorMap: DispositorMap,
  cache: AnalysisCache
): AnalysisResult {
  if (cache[startPlanet]) {
    return cache[startPlanet];
  }

  const path = [startPlanet];
  let current = startPlanet;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const nextDispositor = dispositorMap[current];

    // eslint-disable-next-line no-prototype-builtins
    if (!nextDispositor || !dispositorMap.hasOwnProperty(nextDispositor)) {
      // Chain is broken (dispositor not in the chart)
      const result: AnalysisResult = {
        path: [...path, nextDispositor],
        isCycle: false,
        isFinal: false,
        isBroken: true,
      };
      return (cache[startPlanet] = result);
    }

    if (nextDispositor === current) {
      // Final dispositor
      const result: AnalysisResult = {
        path,
        isCycle: false,
        isFinal: true,
        isBroken: false,
      };
      return (cache[startPlanet] = result);
    }

    if (path.includes(nextDispositor)) {
      // Cycle detected
      const cycleStartIndex = path.indexOf(nextDispositor);
      const cyclePath = path.slice(cycleStartIndex);
      const result: AnalysisResult = {
        path: [...path, nextDispositor],
        isCycle: true,
        isFinal: false,
        isBroken: false,
      };

      // Cache the result for all members of the cycle
      cyclePath.forEach((planet) => {
        cache[planet] = result;
      });
      return result;
    }

    // If we've hit a node that's already been analyzed, we can use its result
    if (cache[nextDispositor]) {
      const nestedResult = cache[nextDispositor];
      const combinedPath = [...path, ...nestedResult.path];
      const result: AnalysisResult = { ...nestedResult, path: combinedPath };
      return (cache[startPlanet] = result);
    }

    path.push(nextDispositor);
    current = nextDispositor;
  }
}

/**
 * Calculates the full dispositor chain for each planet in the chart.
 * @param planets The list of planets in the chart.
 * @param mode Controls which dispositor chains to include: true (all), false (none), 'finals' (only final dispositors and cycles).
 * @returns A map of each planet to its full dispositor chain string, or a summary in 'finals' mode.
 */
export function calculateDispositors(
  planets: Point[],
  mode: boolean | 'finals' = true
): { [key: string]: string } {
  if (mode === false) {
    return {};
  }

  const dispositorMap: DispositorMap = {};
  planets.forEach((p) => {
    dispositorMap[p.name] = getDispositor(p);
  });

  const analysisCache: AnalysisCache = {};
  planets.forEach((p) => {
    if (!analysisCache[p.name]) {
      analyzePlanetChain(p.name, dispositorMap, analysisCache);
    }
  });

  if (mode === 'finals') {
    const finalDispositors = new Set<string>();
    const cycles = new Map<string, string[]>();

    planets.forEach((p) => {
      if (dispositorMap[p.name] === p.name) {
        finalDispositors.add(p.name);
      }
    });

    for (const planetName in analysisCache) {
      const result = analysisCache[planetName];
      if (result.isCycle) {
        const lastPlanetInPath = result.path[result.path.length - 1];
        const cycleStartIndex = result.path.indexOf(lastPlanetInPath);
        const cyclePlanets = result.path.slice(cycleStartIndex, -1);
        const canonicalKey = [...new Set(cyclePlanets)].sort().join('|');

        if (!cycles.has(canonicalKey)) {
          cycles.set(canonicalKey, cyclePlanets);
        }
      }
    }

    const summaryParts: string[] = [];
    if (finalDispositors.size > 0) {
      summaryParts.push(
        `Final dispositors: ${[...finalDispositors].sort().join(', ')}`
      );
    }
    if (cycles.size > 0) {
      const formattedCycles = [...cycles.values()]
        .map((cycle) => {
          const uniqueCyclePlanets = [...new Set(cycle)];
          const startNode = uniqueCyclePlanets.sort()[0];
          const startIndex = cycle.indexOf(startNode);
          const reordered = [
            ...cycle.slice(startIndex),
            ...cycle.slice(0, startIndex),
          ];
          return [...reordered, startNode].join(' → ');
        })
        .sort();
      summaryParts.push(`Cycles: ${formattedCycles.join(', ')}`);
    }

    if (summaryParts.length === 0) {
      return { summary: 'No final dispositors or cycles found' };
    }
    return { summary: summaryParts.join('; ') };
  }

  // Default mode: return all chains
  const chains: { [key: string]: string } = {};
  planets.forEach((p) => {
    const planetName = p.name;
    const path = [planetName];
    let current = planetName;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const nextDispositor = dispositorMap[current];
      // eslint-disable-next-line no-prototype-builtins
      if (!nextDispositor || !dispositorMap.hasOwnProperty(nextDispositor)) {
        chains[planetName] = `${path.join(
          ' → '
        )} → ${nextDispositor} (not in chart)`;
        break;
      }
      if (nextDispositor === current) {
        chains[planetName] = `${path.join(' → ')} → (final)`;
        break;
      }
      if (path.includes(nextDispositor)) {
        chains[planetName] = `${path.join(' → ')} → ${nextDispositor} (cycle)`;
        break;
      }
      path.push(nextDispositor);
      current = nextDispositor;
    }
  });
  return chains;
}
