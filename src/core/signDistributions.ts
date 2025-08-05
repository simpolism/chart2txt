import { Point } from '../types';
import { getDegreeSign } from './astrology';

// Sign classifications
const SIGN_ELEMENTS: Record<string, string> = {
  'Aries': 'Fire',
  'Leo': 'Fire', 
  'Sagittarius': 'Fire',
  'Taurus': 'Earth',
  'Virgo': 'Earth',
  'Capricorn': 'Earth',
  'Gemini': 'Air',
  'Libra': 'Air',
  'Aquarius': 'Air',
  'Cancer': 'Water',
  'Scorpio': 'Water',
  'Pisces': 'Water'
};

const SIGN_MODALITIES: Record<string, string> = {
  'Aries': 'Cardinal',
  'Cancer': 'Cardinal',
  'Libra': 'Cardinal',
  'Capricorn': 'Cardinal',
  'Taurus': 'Fixed',
  'Leo': 'Fixed',
  'Scorpio': 'Fixed',
  'Aquarius': 'Fixed',
  'Gemini': 'Mutable',
  'Virgo': 'Mutable',
  'Sagittarius': 'Mutable',
  'Pisces': 'Mutable'
};

const SIGN_POLARITIES: Record<string, string> = {
  'Aries': 'Masculine',
  'Gemini': 'Masculine',
  'Leo': 'Masculine',
  'Libra': 'Masculine',
  'Sagittarius': 'Masculine',
  'Aquarius': 'Masculine',
  'Taurus': 'Feminine',
  'Cancer': 'Feminine',
  'Virgo': 'Feminine',
  'Scorpio': 'Feminine',
  'Capricorn': 'Feminine',
  'Pisces': 'Feminine'
};

export interface SignDistributions {
  elements: Record<string, string[]>;
  modalities: Record<string, number>;
  polarities: Record<string, number>;
}

/**
 * Analyzes the distribution of planets across elements, modalities, and polarities
 * @param planets Array of planet points
 * @param includeAscendant Optional ascendant degree to include in analysis
 * @returns Sign distribution analysis
 */
export function analyzeSignDistributions(planets: Point[], includeAscendant?: number): SignDistributions {
  const elements: Record<string, string[]> = {
    'Fire': [],
    'Earth': [], 
    'Air': [],
    'Water': []
  };
  
  const modalities: Record<string, number> = {
    'Cardinal': 0,
    'Fixed': 0,
    'Mutable': 0
  };
  
  const polarities: Record<string, number> = {
    'Masculine': 0,
    'Feminine': 0
  };

  // Process planets
  planets.forEach(planet => {
    const sign = getDegreeSign(planet.degree);
    const element = SIGN_ELEMENTS[sign];
    const modality = SIGN_MODALITIES[sign];
    const polarity = SIGN_POLARITIES[sign];
    
    if (element) {
      elements[element].push(planet.name);
    }
    if (modality) {
      modalities[modality]++;
    }
    if (polarity) {
      polarities[polarity]++;
    }
  });

  // Process ascendant if provided
  if (includeAscendant !== undefined) {
    const ascSign = getDegreeSign(includeAscendant);
    const ascElement = SIGN_ELEMENTS[ascSign];
    const ascModality = SIGN_MODALITIES[ascSign];
    const ascPolarity = SIGN_POLARITIES[ascSign];
    
    if (ascElement) {
      elements[ascElement].push('Ascendant');
    }
    if (ascModality) {
      modalities[ascModality]++;
    }
    if (ascPolarity) {
      polarities[ascPolarity]++;
    }
  }

  return { elements, modalities, polarities };
}

/**
 * Formats element distribution for display
 * @param elements Element distribution data
 * @returns Array of formatted strings
 */
export function formatElementDistribution(elements: Record<string, string[]>): string[] {
  const output: string[] = [];
  
  Object.entries(elements).forEach(([element, planets]) => {
    if (planets.length > 0) {
      const planetList = planets.join(', ');
      output.push(`${element}: ${planets.length} (${planetList})`);
    }
  });
  
  return output;
}

/**
 * Formats modality distribution for display
 * @param modalities Modality distribution data
 * @returns Array of formatted strings
 */
export function formatModalityDistribution(modalities: Record<string, number>): string[] {
  const output: string[] = [];
  
  Object.entries(modalities).forEach(([modality, count]) => {
    if (count > 0) {
      output.push(`${modality}: ${count}`);
    }
  });
  
  return output;
}

/**
 * Formats polarity distribution for display
 * @param polarities Polarity distribution data
 * @returns Array of formatted strings
 */
export function formatPolarityDistribution(polarities: Record<string, number>): string[] {
  const output: string[] = [];
  
  if (polarities['Masculine'] > 0) {
    output.push(`Masculine (Active): ${polarities['Masculine']}`);
  }
  if (polarities['Feminine'] > 0) {
    output.push(`Feminine (Receptive): ${polarities['Feminine']}`);
  }
  
  return output;
}