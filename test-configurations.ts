#!/usr/bin/env ts-node

/**
 * Test Configuration Script for chart2txt
 * 
 * This script allows you to test different configurations of the chart2txt library
 * before publishing a new release. Edit the configuration sections below to test
 * different settings and chart data combinations.
 */

import { chart2txt, ChartData, MultiChartData, PartialSettings } from './src/index';

// ============================================================================
// CONFIGURATION SECTION - Edit these to test different scenarios
// ============================================================================

// Test data: Sample birth chart (approximately someone born June 15, 1990, 2:30 PM, New York)
const sampleNatalChart: ChartData = {
  name: 'Sample Person',
  planets: [
    { name: 'Sun', degree: 84.5, speed: 0.95 },      // ~24° Gemini
    { name: 'Moon', degree: 246.2, speed: 13.2 },    // ~6° Sagittarius  
    { name: 'Mercury', degree: 102.8, speed: 1.8 },  // ~12° Cancer
    { name: 'Venus', degree: 67.3, speed: 1.2 },     // ~7° Gemini
    { name: 'Mars', degree: 135.7, speed: 0.6 },     // ~15° Leo
    { name: 'Jupiter', degree: 95.4, speed: 0.2 },   // ~5° Cancer
    { name: 'Saturn', degree: 289.1, speed: -0.1 },  // ~19° Capricorn (retrograde)
    { name: 'Uranus', degree: 278.8, speed: 0.05 },  // ~8° Capricorn
    { name: 'Neptune', degree: 283.2, speed: 0.02 }, // ~13° Capricorn
    { name: 'Pluto', degree: 227.5, speed: 0.01 },   // ~17° Scorpio
  ],
  ascendant: 198.7,  // ~18° Libra
  midheaven: 108.3,  // ~18° Cancer
  houseCusps: [198.7, 228.7, 258.7, 288.7, 318.7, 348.7, 18.7, 48.7, 78.7, 108.7, 138.7, 168.7], // Placidus-like
  houseSystemName: 'Placidus',
  timestamp: new Date('1990-06-15T14:30:00'),
  location: 'New York, NY',
  chartType: 'natal'
};

// Sample event chart (Solar Eclipse example)
const sampleEventChart: ChartData = {
  name: 'Solar Eclipse 2024',
  planets: [
    { name: 'Sun', degree: 19.2, speed: 1.0 },       // ~19° Aries
    { name: 'Moon', degree: 19.3, speed: 13.5 },     // ~19° Aries (conjunction)
    { name: 'Mercury', degree: 8.7, speed: 1.5 },    // ~8° Aries
    { name: 'Venus', degree: 357.2, speed: 1.1 },    // ~27° Pisces
    { name: 'Mars', degree: 26.8, speed: 0.7 },      // ~26° Aries
    { name: 'Jupiter', degree: 52.4, speed: 0.25 },  // ~22° Taurus
    { name: 'Saturn', degree: 344.1, speed: 0.1 },   // ~14° Pisces
    { name: 'Uranus', degree: 51.6, speed: 0.05 },   // ~21° Taurus
    { name: 'Neptune', degree: 358.9, speed: 0.02 }, // ~28° Pisces
    { name: 'Pluto', degree: 301.8, speed: 0.01 },   // ~1° Aquarius
  ],
  ascendant: 15.0,   // ~15° Aries
  midheaven: 285.0,  // ~15° Capricorn
  timestamp: new Date('2024-04-08T18:13:00'),
  location: 'Austin, TX',
  chartType: 'event'
};

// Sample transit positions (current time example)
const sampleTransitChart: ChartData = {
  name: 'Current Transits',
  planets: [
    { name: 'Sun', degree: 75.8, speed: 0.98 },      // ~15° Gemini
    { name: 'Moon', degree: 156.4, speed: 12.8 },    // ~6° Virgo
    { name: 'Mercury', degree: 89.2, speed: 2.1 },   // ~29° Gemini
    { name: 'Venus', degree: 112.5, speed: 1.3 },    // ~22° Cancer
    { name: 'Mars', degree: 243.7, speed: 0.55 },    // ~23° Sagittarius
    { name: 'Jupiter', degree: 65.8, speed: 0.21 },  // ~5° Gemini
    { name: 'Saturn', degree: 348.2, speed: 0.08 },  // ~18° Pisces
    { name: 'Uranus', degree: 54.1, speed: 0.04 },   // ~24° Taurus
    { name: 'Neptune', degree: 359.8, speed: 0.01 }, // ~29° Pisces
    { name: 'Pluto', degree: 301.9, speed: 0.01 },   // ~1° Aquarius
  ],
  timestamp: new Date('2025-06-05T12:00:00'),
  location: 'Current Location',
  chartType: 'transit'
};

// ============================================================================
// TEST SCENARIOS - Choose which scenario to run
// ============================================================================

const TEST_SCENARIOS = {
  SINGLE_NATAL: 'single_natal',
  SINGLE_EVENT: 'single_event', 
  SYNASTRY: 'synastry',
  NATAL_WITH_TRANSITS: 'natal_with_transits',
  EVENT_WITH_TRANSITS: 'event_with_transits',
  SYNASTRY_WITH_TRANSITS: 'synastry_with_transits',
  CUSTOM_SETTINGS: 'custom_settings',
  MINIMAL_DATA: 'minimal_data'
} as const;

type TestScenario = typeof TEST_SCENARIOS[keyof typeof TEST_SCENARIOS];

// ============================================================================
// CURRENT TEST CONFIGURATION - Edit this to change what gets tested
// ============================================================================

const CURRENT_SCENARIO: TestScenario = TEST_SCENARIOS.SYNASTRY_WITH_TRANSITS;

const CUSTOM_SETTINGS: PartialSettings = {
  includeSignDegree: true,
  includeAscendant: true,
  houseSystemName: 'Placidus',
  includeHouseDegree: false,
  aspectDefinitions: [
    { name: 'conjunction', angle: 0, orb: 8 },
    { name: 'opposition', angle: 180, orb: 8 },
    { name: 'trine', angle: 120, orb: 6 },
    { name: 'square', angle: 90, orb: 6 },
    { name: 'sextile', angle: 60, orb: 4 },
    { name: 'quincunx', angle: 150, orb: 3 },
  ],
  aspectCategories: [
    { name: 'TIGHT', maxOrb: 1 },
    { name: 'MODERATE', minOrb: 1, maxOrb: 3 },
    { name: 'WIDE', minOrb: 3, maxOrb: 6 },
  ],
  dateFormat: 'YYYY-MM-DD'
};

// ============================================================================
// EXECUTION LOGIC - Don't edit unless you want to change how tests work
// ============================================================================

function runTest(): void {
  console.log('='.repeat(80));
  console.log(`CHART2TXT CONFIGURATION TEST - ${CURRENT_SCENARIO.toUpperCase()}`);
  console.log('='.repeat(80));
  console.log();

  let chartData: ChartData | MultiChartData;
  let settings: PartialSettings = {};

  switch (CURRENT_SCENARIO) {
    case TEST_SCENARIOS.SINGLE_NATAL:
      chartData = sampleNatalChart;
      break;

    case TEST_SCENARIOS.SINGLE_EVENT:
      chartData = sampleEventChart;
      break;

    case TEST_SCENARIOS.SYNASTRY:
      chartData = [sampleNatalChart, { ...sampleEventChart, name: 'Partner Chart', chartType: 'natal' as const }];
      break;

    case TEST_SCENARIOS.NATAL_WITH_TRANSITS:
      chartData = [sampleNatalChart, sampleTransitChart];
      break;

    case TEST_SCENARIOS.EVENT_WITH_TRANSITS:
      chartData = [sampleEventChart, sampleTransitChart];
      break;

    case TEST_SCENARIOS.SYNASTRY_WITH_TRANSITS:
      chartData = [
        sampleNatalChart, 
        { ...sampleEventChart, name: 'Partner Chart', chartType: 'natal' as const }, 
        sampleTransitChart
      ];
      break;

    case TEST_SCENARIOS.CUSTOM_SETTINGS:
      chartData = sampleNatalChart;
      settings = CUSTOM_SETTINGS;
      break;

    case TEST_SCENARIOS.MINIMAL_DATA:
      chartData = {
        name: 'Minimal Chart',
        planets: [
          { name: 'Sun', degree: 84.5 },
          { name: 'Moon', degree: 246.2 },
          { name: 'Mercury', degree: 102.8 },
        ]
      };
      break;

    default:
      throw new Error(`Unknown test scenario: ${CURRENT_SCENARIO}`);
  }

  console.log('Input Configuration:');
  console.log('-------------------');
  console.log('Chart Data:', JSON.stringify(chartData, null, 2));
  console.log();
  console.log('Settings:', JSON.stringify(settings, null, 2));
  console.log();
  
  try {
    const startTime = Date.now();
    const result = chart2txt(chartData, settings);
    const endTime = Date.now();

    console.log('Generated Output:');
    console.log('-'.repeat(50));
    console.log(result);
    console.log('-'.repeat(50));
    console.log();
    console.log(`Generation completed in ${endTime - startTime}ms`);
    console.log(`Output length: ${result.length} characters`);
    console.log(`Line count: ${result.split('\n').length}`);

  } catch (error) {
    console.error('ERROR:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
  }

  console.log();
  console.log('='.repeat(80));
  console.log('TEST COMPLETED');
  console.log('='.repeat(80));
}

// ============================================================================
// ADDITIONAL HELPER FUNCTIONS
// ============================================================================

function showAvailableScenarios(): void {
  console.log('Available test scenarios:');
  Object.values(TEST_SCENARIOS).forEach(scenario => {
    console.log(`- ${scenario}`);
  });
}

function validateChartData(data: ChartData | MultiChartData): boolean {
  try {
    // Basic validation - add more as needed
    if (Array.isArray(data)) {
      return data.every(chart => chart.planets && Array.isArray(chart.planets));
    } else {
      return !!(data.planets && Array.isArray(data.planets));
    }
  } catch (error) {
    console.error('Chart data validation failed:', error);
    return false;
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

if (require.main === module) {
  console.log('chart2txt Configuration Tester');
  console.log('===============================');
  console.log();
  
  // Validate chart data before running
  let chartData: ChartData | MultiChartData;
  
  // Get the chart data that will be used for the current scenario
  switch (CURRENT_SCENARIO as TestScenario) {
    case TEST_SCENARIOS.SYNASTRY:
      chartData = [sampleNatalChart, { ...sampleEventChart, name: 'Partner Chart', chartType: 'natal' as const }];
      break;
    case TEST_SCENARIOS.NATAL_WITH_TRANSITS:
      chartData = [sampleNatalChart, sampleTransitChart];
      break;
    case TEST_SCENARIOS.EVENT_WITH_TRANSITS:
      chartData = [sampleEventChart, sampleTransitChart];
      break;
    case TEST_SCENARIOS.SYNASTRY_WITH_TRANSITS:
      chartData = [sampleNatalChart, { ...sampleEventChart, name: 'Partner Chart', chartType: 'natal' as const }, sampleTransitChart];
      break;
    case TEST_SCENARIOS.MINIMAL_DATA:
      chartData = { name: 'Minimal Chart', planets: [{ name: 'Sun', degree: 84.5 }, { name: 'Moon', degree: 246.2 }] };
      break;
    case TEST_SCENARIOS.SINGLE_EVENT:
      chartData = sampleEventChart;
      break;
    case TEST_SCENARIOS.CUSTOM_SETTINGS:
      chartData = sampleNatalChart;
      break;
    default:
      chartData = sampleNatalChart;
  }
  
  if (!validateChartData(chartData)) {
    console.error('Chart data validation failed. Please check your test data.');
    process.exit(1);
  }
  
  runTest();
}
