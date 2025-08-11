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
 * Finds all cycles in the dispositor network and returns their canonical representation
 */
function findCycles(dispositorMap: { [key: string]: string }): Set<string> {
  const visited = new Set<string>();
  const cycles = new Set<string>();
  
  function findCycle(start: string, path: string[] = [], pathSet: Set<string> = new Set()): void {
    if (visited.has(start)) return;
    
    const next = dispositorMap[start];
    if (!next || !dispositorMap.hasOwnProperty(next)) return;
    
    if (pathSet.has(next)) {
      // Found a cycle - extract it from the path
      const cycleStartIndex = path.indexOf(next);
      const cyclePlanets = path.slice(cycleStartIndex);
      
      // Create canonical representation (sorted to ensure uniqueness)
      const sortedCycle = [...cyclePlanets].sort();
      const cycleKey = sortedCycle.join(' ↔ ');
      cycles.add(cycleKey);
      return;
    }
    
    if (next === start) {
      // Self-dispositor (not a cycle, just a final dispositor)
      return;
    }
    
    path.push(start);
    pathSet.add(start);
    findCycle(next, [...path], new Set(pathSet));
  }
  
  // Check all planets for cycles
  for (const planet in dispositorMap) {
    if (!visited.has(planet)) {
      findCycle(planet);
    }
  }
  
  // Mark all planets as visited to avoid redundant processing
  for (const planet in dispositorMap) {
    visited.add(planet);
  }
  
  return cycles;
}

/**
 * Calculates the full dispositor chain for each planet in the chart.
 * @param planets The list of planets in the chart.
 * @param mode Controls which dispositor chains to include: true (all), false (none), 'finals' (only final dispositors and cycles).
 * @returns A map of each planet to its full dispositor chain string.
 */
export function calculateDispositors(
  planets: Point[], 
  mode: boolean | 'finals' = true
): {
  [key: string]: string;
} {
  if (mode === false) {
    return {};
  }
  
  const dispositorMap: { [key: string]: string } = {};
  planets.forEach((p) => {
    dispositorMap[p.name] = getDispositor(p);
  });

  let chains: { [key: string]: string } = {};
  const chainInfo: { [key: string]: { isFinal: boolean; isCycle: boolean; cycleKey?: string } } = {};
  const cycleMembers = new Set<string>(); // Planets that are part of cycles
  const processedCycles = new Set<string>(); // Already represented cycles
  
  // First pass: build all chains and identify cycle members
  planets.forEach((planet) => {
    const path = [planet.name];
    let current = planet.name;
    let chain = `${current}`;
    let isFinal = false;
    let isCycle = false;

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
        isFinal = true;
        break;
      }

      if (path.includes(nextDispositor)) {
        // A loop is detected - extract the cycle
        const cycleStartIndex = path.indexOf(nextDispositor);
        const cyclePlanets = path.slice(cycleStartIndex);
        
        // Mark all planets in this cycle
        cyclePlanets.forEach(p => cycleMembers.add(p));
        cycleMembers.add(nextDispositor);
        
        chain += ` → ${nextDispositor} (cycle)`;
        isCycle = true;
        break;
      }

      path.push(nextDispositor);
      chain += ` → ${nextDispositor}`;
      current = nextDispositor;
    }

    chains[planet.name] = chain;
    chainInfo[planet.name] = { isFinal, isCycle };
  });

  // Only deduplicate cycles if mode is 'finals'
  if (mode === 'finals') {
    // Second pass: deduplicate cycles while keeping non-cycle chains
    const finalChains: { [key: string]: string } = {};
    
    for (const planet in chains) {
      const info = chainInfo[planet];
      
      if (info.isCycle) {
        // Extract cycle from chain to create canonical representation
        const chain = chains[planet];
        const parts = chain.split(' → ');
        const cycleEndIndex = parts.findIndex(part => part.includes('(cycle)'));
        
        if (cycleEndIndex > 0) {
          const cycleEndPlanet = parts[cycleEndIndex].replace(' (cycle)', '');
          const cycleStartIndex = parts.indexOf(cycleEndPlanet);
          
          if (cycleStartIndex >= 0 && cycleStartIndex < cycleEndIndex) {
            const cyclePlanets = parts.slice(cycleStartIndex, cycleEndIndex);
            const sortedCycle = [...cyclePlanets].sort();
            const cycleKey = sortedCycle.join('|');
            
            if (!processedCycles.has(cycleKey)) {
              processedCycles.add(cycleKey);
              finalChains[planet] = chains[planet];
            }
            // Skip other planets in the same cycle
          }
        }
      } else if (!cycleMembers.has(planet) || !info.isCycle) {
        // Include non-cycle planets and planets that lead to cycles but aren't in cycles themselves
        finalChains[planet] = chains[planet];
      }
    }

    chains = finalChains;
  }

  // Mode 'finals' filtering was already handled above during deduplication

  return chains;
}
