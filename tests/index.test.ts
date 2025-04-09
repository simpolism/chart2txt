import { chart2txt, ChartData } from '../src/index';

describe('chart2txt', () => {
  test('formats planets in signs correctly', () => {
    const data: ChartData = {
      planets: [
        { name: 'Sun', longitude: 35 },  // 5° Taurus
        { name: 'Moon', longitude: 120 }, // 0° Leo
        { name: 'Mercury', longitude: 75 } // 15° Gemini
      ]
    };
    
    const result = chart2txt(data);
    
    expect(result).toContain('Sun is at 5° Taurus');
    expect(result).toContain('Moon is at 0° Leo');
    expect(result).toContain('Mercury is at 15° Gemini');
  });
  
  test('includes house positions when ascendant is provided', () => {
    const data: ChartData = {
      planets: [
        { name: 'Sun', longitude: 35 },  // 5° Taurus
        { name: 'Moon', longitude: 120 } // 0° Leo
      ],
      ascendant: 0 // 0° Aries
    };
    
    const result = chart2txt(data);
    
    expect(result).toContain('Sun is in house 2');
    expect(result).toContain('Moon is in house 5');
  });
  
  test('calculates and includes aspects between planets', () => {
    const data: ChartData = {
      planets: [
        { name: 'Sun', longitude: 0 },  // 0° Aries
        { name: 'Moon', longitude: 90 }, // 0° Cancer (square to Sun)
        { name: 'Venus', longitude: 60 } // 0° Gemini (sextile to Sun)
      ]
    };
    
    const result = chart2txt(data);
    
    expect(result).toContain('Sun is in square with Moon');
    expect(result).toContain('Sun is in sextile with Venus');
  });
});
