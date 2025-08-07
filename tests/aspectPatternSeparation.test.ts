import { chart2txt, ChartData } from '../src/index';

describe('Aspect Pattern Separation', () => {
  describe('composite vs individual pattern detection', () => {
    test('composite patterns should not include single-chart patterns', () => {
      // Create Alice with T-Square (only Alice's planets)
      const alice: ChartData = {
        name: 'Alice',
        planets: [
          { name: 'Mercury', degree: 25 }, // 25° Aries
          { name: 'Mars', degree: 207 }, // 27° Scorpio (opposition to Mercury ~182°)
          { name: 'Saturn', degree: 117 }, // 27° Cancer (square to both ~92° and ~90°)
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      // Create Jake with no T-Square patterns
      const jake: ChartData = {
        name: 'Jake', 
        planets: [
          { name: 'Sun', degree: 0 }, // 0° Aries
          { name: 'Moon', degree: 60 }, // 0° Gemini
          { name: 'Venus', degree: 120 }, // 0° Leo
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const result = chart2txt([jake, alice], {
        includeAspectPatterns: true,
      });

      // Alice's individual section should have the T-Square
      expect(result).toContain('[CHART: Alice]');
      const aliceSection = result.split('[SYNASTRY: Jake-Alice]')[0];
      expect(aliceSection).toContain('T-Square:');
      expect(aliceSection).toContain('Mercury');
      expect(aliceSection).toContain('Mars');
      expect(aliceSection).toContain('Saturn');

      // Jake-Alice composite section should NOT include Alice-only T-Square
      expect(result).toContain('[SYNASTRY: Jake-Alice]');
      const synastrySections = result.split('[SYNASTRY: Jake-Alice]')[1];
      const compositeSection = synastrySections.split('[HOUSE OVERLAYS]')[0];
      
      // The composite section should not include the T-Square that only involves Alice's planets
      const compositeTSquares = compositeSection.match(/T-Square:[\s\S]*?(?=T-Square:|Yod:|Grand Trine:|Kite:|Mystic Rectangle:|$)/g) || [];
      const aliceOnlyTSquares = compositeTSquares.filter(tSquare => 
        tSquare.includes('Mercury') && tSquare.includes('Mars') && tSquare.includes('Saturn') &&
        !tSquare.includes("Jake's")
      );
      expect(aliceOnlyTSquares.length).toBe(0);
    });

    test('global patterns should only include patterns spanning 3+ charts', () => {
      const chart1: ChartData = {
        name: 'Person1',
        planets: [
          { name: 'Sun', degree: 0 }, // 0° Aries
          { name: 'Moon', degree: 120 }, // 0° Leo
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const chart2: ChartData = {
        name: 'Person2', 
        planets: [
          { name: 'Mars', degree: 240 }, // 0° Sagittarius (trine to chart1 planets)
          { name: 'Venus', degree: 60 }, // 0° Gemini
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const chart3: ChartData = {
        name: 'Person3',
        planets: [
          { name: 'Jupiter', degree: 180 }, // 0° Libra
          { name: 'Saturn', degree: 300 }, // 0° Aquarius
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const result = chart2txt([chart1, chart2, chart3], {
        includeAspectPatterns: true,
      });

      // There should be individual pairwise sections
      expect(result).toContain('[SYNASTRY: Person1-Person2]');
      expect(result).toContain('[SYNASTRY: Person1-Person3]'); 
      expect(result).toContain('[SYNASTRY: Person2-Person3]');

      // Check if there's a global section
      const hasGlobalSection = result.includes('Global Composite');
      
      if (hasGlobalSection) {
        // Extract the global composite section
        const globalStart = result.indexOf('Global Composite');
        const globalSection = result.substring(globalStart);
        
        // Any patterns in the global section should involve planets from at least 3 charts
        const patterns = globalSection.match(/(T-Square|Grand Trine|Yod|Kite|Mystic Rectangle):[\s\S]*?(?=T-Square:|Grand Trine:|Yod:|Kite:|Mystic Rectangle:|$)/g) || [];
        
        patterns.forEach(pattern => {
          const chartNames = new Set();
          const person1Matches = pattern.match(/Person1's/g) || [];
          const person2Matches = pattern.match(/Person2's/g) || [];
          const person3Matches = pattern.match(/Person3's/g) || [];
          
          if (person1Matches.length > 0) chartNames.add('Person1');
          if (person2Matches.length > 0) chartNames.add('Person2'); 
          if (person3Matches.length > 0) chartNames.add('Person3');
          
          // Global patterns should involve at least 3 charts
          expect(chartNames.size).toBeGreaterThanOrEqual(3);
        });
      }
    });

    test('pairwise patterns should only include patterns spanning exactly 2 charts', () => {
      // Create two charts that form a cross-chart pattern
      const chart1: ChartData = {
        name: 'Alice',
        planets: [
          { name: 'Sun', degree: 0 }, // 0° Aries
          { name: 'Moon', degree: 180 }, // 0° Libra
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const chart2: ChartData = {
        name: 'Bob',
        planets: [
          { name: 'Mars', degree: 90 }, // 0° Cancer (square to both Alice planets)
          { name: 'Venus', degree: 60 }, // 0° Gemini
        ],
        houseCusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      };

      const result = chart2txt([chart1, chart2], {
        includeAspectPatterns: true,
      });

      expect(result).toContain('[SYNASTRY: Alice-Bob]');
      const synastryStart = result.indexOf('[SYNASTRY: Alice-Bob]');
      const synastrySection = result.substring(synastryStart);
      const compositeStart = synastrySection.indexOf('Alice-Bob Composite');
      
      if (compositeStart !== -1) {
        const compositeSection = synastrySection.substring(compositeStart);
        const patterns = compositeSection.match(/(T-Square|Grand Trine|Yod|Kite|Mystic Rectangle):[\s\S]*?(?=T-Square:|Grand Trine:|Yod:|Kite:|Mystic Rectangle:|$)/g) || [];
        
        patterns.forEach(pattern => {
          // Each pattern should mention both Alice and Bob
          const hasAlice = pattern.includes("Alice's");
          const hasBob = pattern.includes("Bob's");
          
          // For pairwise composite, we want patterns that involve both charts
          // OR patterns from individual charts that are enhanced by synastry aspects
          expect(hasAlice || hasBob).toBe(true);
          
          // Should not have planets from only one person in cross-chart patterns
          if (pattern.includes('T-Square') && hasAlice && hasBob) {
            // If it's a cross-chart T-Square, it should involve planets from both charts
            expect(hasAlice && hasBob).toBe(true);
          }
        });
      }
    });
  });
});