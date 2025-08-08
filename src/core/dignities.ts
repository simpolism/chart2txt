import { Point, PlanetPosition } from '../types';
import { getSign } from '../utils/formatting';
import { ZODIAC_SIGN_DATA } from '../constants';

const DIGNITY_MAP: { [key: string]: { [key: string]: string[] } } = {
    Sun: { Leo: ['Domicile'], Aries: ['Exaltation'], Aquarius: ['Detriment'], Libra: ['Fall'] },
    Moon: { Cancer: ['Domicile'], Taurus: ['Exaltation'], Capricorn: ['Detriment'], Scorpio: ['Fall'] },
    Mercury: { Gemini: ['Domicile'], Virgo: ['Domicile', 'Exaltation'], Pisces: ['Detriment', 'Fall'], Sagittarius: ['Detriment'] },
    Venus: { Taurus: ['Domicile'], Libra: ['Domicile'], Scorpio: ['Detriment'], Aries: ['Fall'], Virgo: ['Fall'] },
    Mars: { Aries: ['Domicile'], Scorpio: ['Domicile'], Libra: ['Detriment'], Cancer: ['Fall'] },
    Jupiter: { Sagittarius: ['Domicile'], Pisces: ['Domicile'], Gemini: ['Detriment'], Virgo: ['Fall'] },
    Saturn: { Capricorn: ['Domicile'], Aquarius: ['Domicile'], Cancer: ['Detriment'], Leo: ['Fall'] },
};

export function formatPlanetWithDignities(planet: PlanetPosition): string {
    const sign = planet.sign;
    const dignities = DIGNITY_MAP[planet.name];
    const ruler = ZODIAC_SIGN_DATA.find(s => s.name === sign)?.ruler;
    
    const dignityParts: string[] = [];
    if (dignities && dignities[sign]) {
        dignityParts.push(...dignities[sign]);
    }

    let dignityString = dignityParts.join(', ');

    if (ruler && planet.name !== ruler) {
        if (dignityString) {
            dignityString += ` | Ruler: ${ruler}`;
        } else {
            dignityString = `Ruler: ${ruler}`;
        }
    }

    if (dignityString) {
        return `[${dignityString}]`;
    }

    return '';
}
