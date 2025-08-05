import { Point } from '../types';
import { getDegreeSign } from './astrology';
import { getSignRulers } from './dignities';

export interface DispositorChain {
  planet: string;
  disposedBy: string[];
  disposes: string[];
}

export interface DispositorAnalysis {
  chains: DispositorChain[];
  finalDispositors: string[];
}

/**
 * Builds dispositor chains for all planets
 * @param planets Array of planet points
 * @returns Complete dispositor analysis
 */
export function analyzeDispositors(planets: Point[]): DispositorAnalysis {
  const dispositorMap = new Map<string, string[]>();
  const disposedByMap = new Map<string, string[]>();

  // Build the dispositor relationships
  planets.forEach((planet) => {
    const sign = getDegreeSign(planet.degree);
    const rulers = getSignRulers(sign);

    dispositorMap.set(planet.name, rulers);

    rulers.forEach((ruler) => {
      if (!disposedByMap.has(ruler)) {
        disposedByMap.set(ruler, []);
      }
      disposedByMap.get(ruler)!.push(planet.name);
    });
  });

  // Find final dispositors - these are the roots of dispositor trees
  const finalDispositors: string[] = [];
  const planetNames = new Set(planets.map((p) => p.name));

  planets.forEach((planet) => {
    const rulers = dispositorMap.get(planet.name) || [];
    const isRuledBySelf = rulers.includes(planet.name);
    const isRuledByPlanetNotInChart =
      rulers.length > 0 && !rulers.some((ruler) => planetNames.has(ruler));

    // A planet is a final dispositor if:
    // 1. It rules itself (traditional dignity)
    // 2. It's ruled by a planet not in the chart
    if (isRuledBySelf || isRuledByPlanetNotInChart) {
      finalDispositors.push(planet.name);
    }
  });

  // Build chains
  const chains: DispositorChain[] = planets.map((planet) => ({
    planet: planet.name,
    disposedBy: dispositorMap.get(planet.name) || [],
    disposes: disposedByMap.get(planet.name) || [],
  }));

  return {
    chains,
    finalDispositors,
  };
}

/**
 * Detect cycles in dispositor chains
 */
function findDispositorCycles(chains: DispositorChain[]): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const path = new Set<string>();

  function dfs(planet: string, currentPath: string[]): void {
    if (path.has(planet)) {
      // Found a cycle
      const cycleStart = currentPath.indexOf(planet);
      if (cycleStart !== -1) {
        const cycle = currentPath.slice(cycleStart);
        cycle.push(planet); // Complete the cycle
        if (cycle.length > 2) {
          cycles.push(cycle);
        }
      }
      return;
    }

    if (visited.has(planet)) return;

    visited.add(planet);
    path.add(planet);
    currentPath.push(planet);

    const chain = chains.find((c) => c.planet === planet);
    if (chain) {
      // Follow the dispositor chain (only follow planets in the chart)
      const inChartRulers = chain.disposedBy.filter((ruler) =>
        chains.some((c) => c.planet === ruler)
      );

      for (const ruler of inChartRulers) {
        dfs(ruler, [...currentPath]);
      }
    }

    path.delete(planet);
    currentPath.pop();
  }

  // Start DFS from each planet
  chains.forEach((chain) => {
    if (!visited.has(chain.planet)) {
      dfs(chain.planet, []);
    }
  });

  return cycles;
}

/**
 * Builds the full dispositor chain for a planet
 * @param planet Starting planet
 * @param chains All dispositor chains
 * @param pathSoFar Array to track the current path (prevents infinite loops)
 * @returns Array of planets in the chain (excluding the starting planet)
 */
function buildDispositorChain(
  planet: string,
  chains: DispositorChain[],
  pathSoFar: string[] = []
): string[] {
  const chain = chains.find((c) => c.planet === planet);
  if (!chain || chain.disposedBy.length === 0) {
    return ['(final)'];
  }

  // Get the first in-chart ruler
  const inChartRulers = chain.disposedBy.filter((ruler) =>
    chains.some((c) => c.planet === ruler)
  );

  if (inChartRulers.length === 0) {
    return ['(final)'];
  }

  const ruler = inChartRulers[0];

  // If the ruler is the same as the planet (self-ruler), it's final
  if (ruler === planet) {
    return ['(final)'];
  }

  // If we've seen this ruler in the current path, we have a cycle
  if (pathSoFar.includes(ruler)) {
    return ['(cycle)'];
  }

  // Continue the chain
  const newPath = [...pathSoFar, planet];
  const nextChain = buildDispositorChain(ruler, chains, newPath);

  // If the next chain ends in (final), this whole chain ends in (final)
  // If the next chain ends in (cycle), this chain also ends in (cycle)
  return [ruler, ...nextChain];
}

/**
 * Formats the dispositor analysis for display
 * @param analysis The dispositor analysis
 * @returns Array of formatted strings
 */
export function formatDispositorAnalysis(
  analysis: DispositorAnalysis
): string[] {
  const output: string[] = [];

  // Build and format chains for each planet
  analysis.chains.forEach((chainInfo) => {
    const chainRest = buildDispositorChain(chainInfo.planet, analysis.chains);
    const chainString = chainRest.join(' → ');
    output.push(`${chainInfo.planet} → ${chainString}`);
  });

  return output;
}
