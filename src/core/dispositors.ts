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
  planets.forEach(planet => {
    const sign = getDegreeSign(planet.degree);
    const rulers = getSignRulers(sign);
    
    dispositorMap.set(planet.name, rulers);
    
    rulers.forEach(ruler => {
      if (!disposedByMap.has(ruler)) {
        disposedByMap.set(ruler, []);
      }
      disposedByMap.get(ruler)!.push(planet.name);
    });
  });

  // Find final dispositors - these are the roots of dispositor trees
  const finalDispositors: string[] = [];
  const planetNames = new Set(planets.map(p => p.name));
  
  planets.forEach(planet => {
    const rulers = dispositorMap.get(planet.name) || [];
    const isRuledBySelf = rulers.includes(planet.name);
    const isRuledByPlanetNotInChart = rulers.length > 0 && !rulers.some(ruler => planetNames.has(ruler));
    
    // A planet is a final dispositor if:
    // 1. It rules itself (traditional dignity)
    // 2. It's ruled by a planet not in the chart
    if (isRuledBySelf || isRuledByPlanetNotInChart) {
      finalDispositors.push(planet.name);
    }
  });

  // Build chains
  const chains: DispositorChain[] = planets.map(planet => ({
    planet: planet.name,
    disposedBy: dispositorMap.get(planet.name) || [],
    disposes: disposedByMap.get(planet.name) || []
  }));

  return {
    chains,
    finalDispositors
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

    const chain = chains.find(c => c.planet === planet);
    if (chain) {
      // Follow the dispositor chain (only follow planets in the chart)
      const inChartRulers = chain.disposedBy.filter(ruler => 
        chains.some(c => c.planet === ruler)
      );
      
      for (const ruler of inChartRulers) {
        dfs(ruler, [...currentPath]);
      }
    }

    path.delete(planet);
    currentPath.pop();
  }

  // Start DFS from each planet
  chains.forEach(chain => {
    if (!visited.has(chain.planet)) {
      dfs(chain.planet, []);
    }
  });

  return cycles;
}

/**
 * Formats the dispositor analysis for display
 * @param analysis The dispositor analysis
 * @returns Array of formatted strings
 */
export function formatDispositorAnalysis(analysis: DispositorAnalysis): string[] {
  const output: string[] = [];

  // Find cycles
  const cycles = findDispositorCycles(analysis.chains);
  const planetsInCycles = new Set(cycles.flat());

  // Format final dispositors and their trees
  if (analysis.finalDispositors.length > 0) {
    const finalDispositorsWithDisposes = analysis.finalDispositors.map(dispositor => {
      const chain = analysis.chains.find(c => c.planet === dispositor);
      const disposes = chain?.disposes.filter(p => !planetsInCycles.has(p) && p !== dispositor) || [];
      if (disposes.length > 0) {
        return `${dispositor} (disposes ${disposes.join(', ')})`;
      }
      return dispositor;
    });
    output.push(`Final: ${finalDispositorsWithDisposes.join(', ')}`);
  } else {
    output.push('Final: None');
  }

  // Format cycles
  if (cycles.length > 0) {
    const cycleStrings = cycles.map(cycle => {
      // Remove the duplicate planet at the end
      const uniqueCycle = cycle.slice(0, -1);
      return uniqueCycle.join(' ↔ ');
    });
    output.push(`Cycles: ${cycleStrings.join(', ')}`);
  }

  return output;
}