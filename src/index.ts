/**
 * chart2txt
 * A library to convert astrological chart data to human-readable text
 */

// Types
interface Planet {
  name: string;
  longitude: number; // 0-360 degrees
}

interface ChartData {
  planets: Planet[];
  ascendant?: number; // 0-360 degrees, optional
}

interface Settings {
  // For future configuration options
}

interface AspectData {
  planetA: string;
  planetB: string;
  aspectType: string;
  orb: number;
}

// Constants
const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 
  'Leo', 'Virgo', 'Libra', 'Scorpio', 
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const ASPECT_TYPES = {
  CONJUNCTION: { name: 'conjunction', angle: 0, orb: 8 },
  OPPOSITION: { name: 'opposition', angle: 180, orb: 8 },
  TRINE: { name: 'trine', angle: 120, orb: 8 },
  SQUARE: { name: 'square', angle: 90, orb: 7 },
  SEXTILE: { name: 'sextile', angle: 60, orb: 6 }
};

/**
 * Determines the zodiac sign for a given longitude
 */
function getLongitudeSign(longitude: number): string {
  const signIndex = Math.floor(longitude / 30) % 12;
  return ZODIAC_SIGNS[signIndex];
}

/**
 * Calculates the house for a given longitude, based on the ascendant
 */
function getHousePosition(longitude: number, ascendant: number): number {
  // Simple house calculation (equal houses)
  // House 1 starts at the ascendant
  const housePosition = (longitude - ascendant + 360) % 360;
  return Math.floor(housePosition / 30) + 1;
}

/**
 * Identifies aspects between planets
 */
function calculateAspects(planets: Planet[]): AspectData[] {
  const aspects: AspectData[] = [];
  
  // Compare each planet with every other planet
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planetA = planets[i];
      const planetB = planets[j];
      
      // Calculate the angular difference
      let diff = Math.abs(planetA.longitude - planetB.longitude);
      if (diff > 180) diff = 360 - diff;
      
      // Check against each aspect type
      for (const aspectType of Object.values(ASPECT_TYPES)) {
        const orb = Math.abs(diff - aspectType.angle);
        if (orb <= aspectType.orb) {
          aspects.push({
            planetA: planetA.name,
            planetB: planetB.name,
            aspectType: aspectType.name,
            orb
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
function formatPlanetSigns(planets: Planet[]): string {
  return planets.map(planet => {
    const sign = getLongitudeSign(planet.longitude);
    const degree = Math.floor(planet.longitude % 30);
    return `${planet.name} is at ${degree}° ${sign}`;
  }).join('. ');
}

/**
 * Formats planet house positions as text
 */
function formatPlanetHouses(planets: Planet[], ascendant: number): string {
  return planets.map(planet => {
    const house = getHousePosition(planet.longitude, ascendant);
    return `${planet.name} is in house ${house}`;
  }).join('. ');
}

/**
 * Formats aspects between planets as text
 */
function formatAspects(aspects: AspectData[]): string {
  return aspects.map(aspect => {
    return `${aspect.planetA} is in ${aspect.aspectType} with ${aspect.planetB} (orb: ${aspect.orb.toFixed(1)}°)`;
  }).join('. ');
}

/**
 * Main function to convert chart data to text
 */
export function chart2txt(data: ChartData, settings: Settings = {}): string {
  let result = formatPlanetSigns(data.planets);
  
  if (data.ascendant !== undefined) {
    result += '\n\n' + formatPlanetHouses(data.planets, data.ascendant);
  }
  
  const aspects = calculateAspects(data.planets);
  if (aspects.length > 0) {
    result += '\n\n' + formatAspects(aspects);
  }
  
  return result;
}

// Export main function and types
export {
  ChartData,
  Planet,
  Settings
};
