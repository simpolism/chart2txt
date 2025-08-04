import { Point, Aspect, AspectData } from '../types';
import { getDegreeSign } from './astrology';

export interface AdvancedAspectPattern {
  name: string;
  planets: string[];
  description: string;
}

export interface TSquarePattern extends AdvancedAspectPattern {
  name: 'T-Square';
  apex: string;
  base: string[];
}

export interface StelliumPattern extends AdvancedAspectPattern {
  name: 'Stellium';
  sign: string;
  orb: number;
}

function findTightestAspect(
  aspectDefinitions: Aspect[],
  planetA: Point,
  planetB: Point,
  skipOutOfSignAspects: boolean,
): AspectData | null {
  let diff = Math.abs(planetA.degree - planetB.degree);
  if (diff > 180) diff = 360 - diff;

  let tightestAspect: AspectData | null = null;
  for (const aspectType of aspectDefinitions) {
    const orb = Math.abs(diff - aspectType.angle);

    if (skipOutOfSignAspects) {
      const planetASign = Math.floor(planetA.degree / 30);
      const planetBSign = Math.floor(planetB.degree / 30);
      const aspectSignDiff = Math.floor(aspectType.angle / 30);
      let signDiff = Math.abs(planetASign - planetBSign);
      if (signDiff > 6) signDiff = 12 - signDiff;
      if (signDiff !== aspectSignDiff) {
        continue;
      }
    }

    if (orb <= aspectType.orb) {
      if (!tightestAspect || orb < tightestAspect.orb) {
        tightestAspect = {
          planetA: planetA.name,
          planetB: planetB.name,
          aspectType: aspectType.name,
          orb,
        };
      }
    }
  }
  return tightestAspect;
}

/**
 * Identifies aspects between planets in a single chart.
 * @param aspectDefinitions Array of aspect types to check for.
 * @param planets Array of planet points.
 * @returns Array of found aspects.
 */
export function calculateAspects(
  aspectDefinitions: Aspect[],
  planets: Point[],
  skipOutOfSignAspects = true,
): AspectData[] {
  const aspects: AspectData[] = [];
  if (!planets || planets.length < 2) return aspects;

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planetA = planets[i];
      const planetB = planets[j];
      const aspect = findTightestAspect(aspectDefinitions, planetA, planetB, skipOutOfSignAspects);
      if (aspect) {
        aspects.push(aspect);
      }
    }
  }
  return aspects;
}

/**
 * Identifies aspects between planets across two charts.
 * PlanetA is always from chart1Planets, PlanetB always from chart2Planets.
 * @param aspectDefinitions Array of aspect types to check for.
 * @param chart1Planets Array of planet points for the first chart.
 * @param chart2Planets Array of planet points for the second chart.
 * @returns Array of found aspects.
 */
export function calculateMultichartAspects(
  aspectDefinitions: Aspect[],
  chart1Planets: Point[],
  chart2Planets: Point[],
  skipOutOfSignAspects = true,
): AspectData[] {
  const aspects: AspectData[] = [];
  if (
    !chart1Planets ||
    !chart2Planets ||
    chart1Planets.length === 0 ||
    chart2Planets.length === 0
  ) {
    return aspects;
  }

  for (const p1 of chart1Planets) {
    for (const p2 of chart2Planets) {
      const aspect = findTightestAspect(aspectDefinitions, p1, p2, skipOutOfSignAspects);
      if (aspect) {
        aspects.push(aspect);
      }
    }
  }
  return aspects;
}

/**
 * Detects T-Square patterns in aspects.
 * A T-Square consists of:
 * - Two planets in opposition (180°)
 * - A third planet forming squares (90°) to both
 */
export function detectTSquares(
  aspects: AspectData[],
  planets: Point[]
): TSquarePattern[] {
  const tSquares: TSquarePattern[] = [];
  
  const oppositions = aspects.filter(aspect => aspect.aspectType === 'opposition');
  const squares = aspects.filter(aspect => aspect.aspectType === 'square');
  
  for (const opposition of oppositions) {
    const planetA = opposition.planetA;
    const planetB = opposition.planetB;
    
    for (const planet of planets) {
      if (planet.name === planetA || planet.name === planetB) continue;
      
      const squareToA = squares.find(square => 
        (square.planetA === planet.name && square.planetB === planetA) ||
        (square.planetA === planetA && square.planetB === planet.name)
      );
      
      const squareToB = squares.find(square => 
        (square.planetA === planet.name && square.planetB === planetB) ||
        (square.planetA === planetB && square.planetB === planet.name)
      );
      
      if (squareToA && squareToB) {
        const avgOrb = (opposition.orb + squareToA.orb + squareToB.orb) / 3;
        tSquares.push({
          name: 'T-Square',
          apex: planet.name,
          base: [planetA, planetB],
          planets: [planet.name, planetA, planetB],
          description: `T-Square: ${planet.name} (apex) squares ${planetA} and ${planetB} (opposition base). Avg orb: ${avgOrb.toFixed(1)}°`
        });
      }
    }
  }
  
  return tSquares;
}

/**
 * Detects Grand Trine patterns in aspects.
 * A Grand Trine consists of three planets all forming trines (120°) to each other.
 */
export function detectGrandTrines(
  aspects: AspectData[],
  planets: Point[]
): AdvancedAspectPattern[] {
  const grandTrines: AdvancedAspectPattern[] = [];
  const trines = aspects.filter(aspect => aspect.aspectType === 'trine');
  
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      for (let k = j + 1; k < planets.length; k++) {
        const planetA = planets[i].name;
        const planetB = planets[j].name;
        const planetC = planets[k].name;
        
        const trineAB = trines.find(trine => 
          (trine.planetA === planetA && trine.planetB === planetB) ||
          (trine.planetA === planetB && trine.planetB === planetA)
        );
        
        const trineBC = trines.find(trine => 
          (trine.planetA === planetB && trine.planetB === planetC) ||
          (trine.planetA === planetC && trine.planetB === planetB)
        );
        
        const trineAC = trines.find(trine => 
          (trine.planetA === planetA && trine.planetB === planetC) ||
          (trine.planetA === planetC && trine.planetB === planetA)
        );
        
        if (trineAB && trineBC && trineAC) {
          const avgOrb = (trineAB.orb + trineBC.orb + trineAC.orb) / 3;
          grandTrines.push({
            name: 'Grand Trine',
            planets: [planetA, planetB, planetC],
            description: `Grand Trine: ${planetA}, ${planetB}, ${planetC}. Avg orb: ${avgOrb.toFixed(1)}°`
          });
        }
      }
    }
  }
  
  return grandTrines;
}

/**
 * Detects Stellium patterns (3+ planets in the same sign within orb).
 * A Stellium is when 3 or more planets are clustered together in the same sign.
 */
export function detectStelliums(
  planets: Point[],
  maxOrb = 10
): StelliumPattern[] {
  const stelliums: StelliumPattern[] = [];
  const planetsBySign: { [sign: string]: Point[] } = {};
  
  // Group planets by sign
  planets.forEach(planet => {
    const sign = getDegreeSign(planet.degree);
    if (!planetsBySign[sign]) {
      planetsBySign[sign] = [];
    }
    planetsBySign[sign].push(planet);
  });
  
  // Check each sign for stelliums
  Object.entries(planetsBySign).forEach(([sign, planetsInSign]) => {
    if (planetsInSign.length >= 3) {
      // Sort planets by degree to calculate orb spread
      const sortedPlanets = [...planetsInSign].sort((a, b) => a.degree - b.degree);
      const minDegree = sortedPlanets[0].degree;
      const maxDegree = sortedPlanets[sortedPlanets.length - 1].degree;
      
      // Handle sign boundaries (e.g., late Pisces to early Aries)
      let orbSpread = maxDegree - minDegree;
      if (orbSpread > 180) {
        // Wrap around case
        orbSpread = 360 - orbSpread;
      }
      
      if (orbSpread <= maxOrb) {
        stelliums.push({
          name: 'Stellium',
          sign,
          orb: orbSpread,
          planets: planetsInSign.map(p => p.name),
          description: `Stellium in ${sign}: ${planetsInSign.map(p => p.name).join(', ')} (${orbSpread.toFixed(1)}° orb)`
        });
      }
    }
  });
  
  return stelliums;
}
