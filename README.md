# chart2txt

An **automated text-based astrological delineation utility** designed primarily for LLM consumption with secondary human readability. This TypeScript library converts complex astrological chart data into structured, standardized text reports.

[![npm version](https://badge.fury.io/js/chart2txt.svg)](https://badge.fury.io/js/chart2txt)

## Purpose & Design Philosophy

chart2txt is designed as an **automated delineation engine** that transforms astrological chart data into consistent, structured text format. The primary goal is **LLM consumption** - enabling AI systems to process astrological information efficiently. Human readability is a secondary consideration.

## Features

### Core Functionality
- **Single Chart Analysis**: Natal and event chart processing
- **Multi-Chart Analysis**: Synastry (relationship compatibility) between charts
- **Transit Analysis**: Current planetary positions overlaid on natal charts
- **Comprehensive Aspect Detection**: Including traditional aspects plus quincunx (150°)
- **Advanced Aspect Patterns**: T-Square, Grand Trine, Yod, Stellium detection
- **Hierarchical Orb System**: Planet-specific, context-aware orb calculations
- **House System Support**: Multiple house systems with degree precision
- **Sign Distributions**: Element, modality, and polarity analysis

### Advanced Configuration
- **Flexible Orb Configuration**: Per-planet, per-aspect, and contextual orb rules
- **Aspect Classification**: Major, Minor, and Esoteric aspect categories
- **Planet Categorization**: Luminaries, Personal, Social, Outer, Angles
- **Context-Aware Orbs**: Different orb tolerances for natal, synastry, transit, and composite charts
- **Built-in Presets**: Traditional, Modern, Tight, and Wide orb configurations

## Installation

```bash
npm install chart2txt
```

## API Reference

### Main Function

```typescript
import { chart2txt } from 'chart2txt';

function chart2txt(
  data: ChartData | MultiChartData, 
  partialSettings?: PartialSettings
): string
```

**Alias**: `formatChartToText()` (same function, different name)

### Core Types

#### ChartData
```typescript
interface ChartData {
  name: string;                    // Chart identifier
  planets: Point[];                // Planet positions
  houseCusps?: number[];          // House cusp degrees (12 elements)
  ascendant?: number;             // Ascendant degree
  midheaven?: number;             // Midheaven degree  
  timestamp?: string;             // Birth/event timestamp
  location?: string;              // Birth/event location
  chartType?: 'natal' | 'event' | 'transit';
}
```

#### Point
```typescript
interface Point {
  name: string;                   // Planet/point name
  degree: number;                 // Ecliptic longitude (0-359.99)
  speed?: number;                 // Daily motion (for applying/separating aspects)
}
```

#### MultiChartData
```typescript
type MultiChartData = ChartData[];  // Array of 2+ charts for synastry/transit analysis
```

### Configuration System

#### Settings Interface
```typescript
interface Settings {
  // Display Options
  includeSignDegree: boolean;              // Show degrees within signs
  includeAscendant: boolean;               // Include ascendant in output
  includeHouseDegree: boolean;             // Show house cusp degrees
  dateFormat: string;                      // Date format string

  // Aspect Configuration
  aspectDefinitions: Aspect[];             // Available aspects to detect
  aspectCategories: AspectCategory[];      // Orb categories for aspects
  skipOutOfSignAspects: boolean;           // Skip cross-sign aspects
  includeAspectPatterns: boolean;          // Detect complex patterns
  includeSignDistributions: boolean;       // Include element, modality, and polarity distributions

  // Advanced Orb System
  orbConfiguration?: OrbConfiguration;     // Hierarchical orb rules
  
  // House System
  houseSystemName: string;                 // House system identifier
}
```

#### Aspect Definition
```typescript
interface Aspect {
  name: string;                           // Aspect name (e.g., 'conjunction')
  angle: number;                          // Exact angle (e.g., 0, 60, 90, 120, 180)
  orb: number;                           // Default orb tolerance
  classification?: AspectClassification;   // Major/Minor/Esoteric
}
```

#### Advanced Orb Configuration
```typescript
interface OrbConfiguration {
  // Planet-specific orb rules by category
  planetCategories?: {
    [category in PlanetCategory]?: PlanetOrbRules;
  };
  
  // Aspect classification rules
  aspectClassification?: {
    [classification in AspectClassification]?: OrbClassificationRules;
  };
  
  // Context-specific multipliers
  contextualOrbs?: ContextualOrbRules;
  
  // Custom planet mapping
  planetMapping?: { [planetName: string]: PlanetCategory };
  
  // Global fallback
  globalFallbackOrb?: number;
}
```

#### Planet Categories
```typescript
enum PlanetCategory {
  Luminaries = 'luminaries',    // Sun, Moon
  Personal = 'personal',        // Mercury, Venus, Mars
  Social = 'social',           // Jupiter, Saturn
  Outer = 'outer',             // Uranus, Neptune, Pluto
  Angles = 'angles'            // Ascendant, Midheaven, MC, ASC
}
```

#### Aspect Classifications
```typescript
enum AspectClassification {
  Major = 'major',             // Conjunction, Opposition, Trine, Square, Sextile
  Minor = 'minor',             // Quincunx, Semi-sextile, Semi-square, Sesqui-square
  Esoteric = 'esoteric'        // Quintile, Bi-quintile, Septile, etc.
}
```

### Built-in Presets

#### Aspect Presets
```typescript
import { 
  TRADITIONAL_ASPECTS,    // Classical 5 aspects
  MODERN_ASPECTS,         // Includes quincunx and minor aspects
  TIGHT_ASPECTS,          // Reduced orbs for precision
  WIDE_ASPECTS           // Expanded orbs for broader analysis
} from 'chart2txt';
```

#### Orb Configuration Presets
```typescript
import { 
  TRADITIONAL_ORB_CONFIG,  // Classical orb rules
  MODERN_ORB_CONFIG,       // Contemporary orb tolerances
  TIGHT_ORB_CONFIG,        // Precise orbs for accuracy
  WIDE_ORB_CONFIG         // Generous orbs for comprehensive analysis
} from 'chart2txt';
```

## Usage Examples

### Basic Single Chart
```typescript
import { chart2txt } from 'chart2txt';

const natalChart = {
  name: "John Doe",
  planets: [
    { name: 'Sun', degree: 35.5 },      // 5°30' Taurus
    { name: 'Moon', degree: 120.25 },   // 0°15' Leo  
    { name: 'Mercury', degree: 45.75 }, // 15°45' Taurus
    { name: 'Venus', degree: 60.0 },    // 0° Gemini
    { name: 'Mars', degree: 285.5 }     // 15°30' Capricorn
  ],
  ascendant: 15.0,                      // 15° Aries
  midheaven: 105.0,                     // 15° Cancer
  timestamp: "1990-05-15T14:30:00Z",
  location: "New York, NY"
};

const report = chart2txt(natalChart);
console.log(report);
```

### Synastry Analysis
```typescript
const person1 = {
  name: "Person A",
  planets: [
    { name: 'Sun', degree: 45 },    // 15° Taurus
    { name: 'Moon', degree: 120 },  // 0° Leo
    { name: 'Venus', degree: 60 }   // 0° Gemini
  ]
};

const person2 = {
  name: "Person B", 
  planets: [
    { name: 'Sun', degree: 225 },   // 15° Scorpio
    { name: 'Moon', degree: 300 },  // 0° Aquarius
    { name: 'Mars', degree: 120 }   // 0° Leo
  ]
};

const synastryReport = chart2txt([person1, person2]);
```

### Transit Analysis
```typescript
const natal = {
  name: "Natal Chart",
  chartType: 'natal' as const,
  planets: [
    { name: 'Sun', degree: 45 },
    { name: 'Moon', degree: 120 }
  ]
};

const transit = {
  name: "Current Transits",
  chartType: 'transit' as const,
  planets: [
    { name: 'Jupiter', degree: 135 },   // Transiting Jupiter
    { name: 'Saturn', degree: 315 }     // Transiting Saturn
  ],
  timestamp: "2024-01-15T12:00:00Z"
};

const transitReport = chart2txt([natal, transit]);
```

### Advanced Orb Configuration
```typescript
import { chart2txt, MODERN_ORB_CONFIG, AspectClassification, PlanetCategory } from 'chart2txt';

const customOrbConfig = {
  // Tight orbs for luminaries
  planetCategories: {
    [PlanetCategory.Luminaries]: {
      defaultOrb: 8,
      aspectOrbs: {
        'conjunction': 10,
        'opposition': 10
      }
    },
    [PlanetCategory.Personal]: {
      defaultOrb: 6
    },
    [PlanetCategory.Outer]: {
      defaultOrb: 3
    }
  },
  
  // Reduced orbs for minor aspects
  aspectClassification: {
    [AspectClassification.Major]: {
      orbMultiplier: 1.0,
      maxOrb: 10
    },
    [AspectClassification.Minor]: {
      orbMultiplier: 0.6,
      maxOrb: 4
    }
  },
  
  // Tighter orbs for synastry
  contextualOrbs: {
    synastry: {
      orbMultiplier: 0.8
    },
    transits: {
      orbMultiplier: 1.2,
      aspectMultipliers: {
        'conjunction': 1.5,
        'opposition': 1.5
      }
    }
  }
};

const settings = {
  orbConfiguration: customOrbConfig,
  includeAspectPatterns: true
};

const report = chart2txt(chartData, settings);
```

### Using Built-in Presets
```typescript
import { chart2txt, TIGHT_ASPECTS, TIGHT_ORB_CONFIG } from 'chart2txt';

const precisionSettings = {
  aspectDefinitions: TIGHT_ASPECTS,
  orbConfiguration: TIGHT_ORB_CONFIG,
  skipOutOfSignAspects: true
};

const report = chart2txt(chartData, precisionSettings);
```

### Customizing Sign Distribution Output

```typescript
import { chart2txt } from 'chart2txt';

// Disable sign distributions
const settingsWithoutDistributions = {
  includeSignDistributions: false
};

const reportWithoutDistributions = chart2txt(chartData, settingsWithoutDistributions);

// Enable sign distributions (default behavior)
const settingsWithDistributions = {
  includeSignDistributions: true
};

const reportWithDistributions = chart2txt(chartData, settingsWithDistributions);
```

## Default Configuration

### Standard Aspects (includes quincunx)
```typescript
const DEFAULT_ASPECTS = [
  { name: 'conjunction', angle: 0, orb: 5, classification: AspectClassification.Major },
  { name: 'opposition', angle: 180, orb: 5, classification: AspectClassification.Major },
  { name: 'trine', angle: 120, orb: 5, classification: AspectClassification.Major },
  { name: 'square', angle: 90, orb: 5, classification: AspectClassification.Major },
  { name: 'sextile', angle: 60, orb: 3, classification: AspectClassification.Major },
  { name: 'quincunx', angle: 150, orb: 2, classification: AspectClassification.Minor }
];
```

### Default Settings
```typescript
const DEFAULT_SETTINGS = {
  includeSignDegree: true,
  includeAscendant: true, 
  includeHouseDegree: false,
  houseSystemName: 'Placidus',
  skipOutOfSignAspects: false,
  includeAspectPatterns: true,
  includeSignDistributions: true,
  dateFormat: 'MMMM Do, YYYY [at] h:mm A',
  aspectDefinitions: DEFAULT_ASPECTS,
  aspectCategories: DEFAULT_ASPECT_CATEGORIES
};
```

## Output Format

The library generates structured text reports with clearly delineated sections:

```
[METADATA]
Generated: January 15th, 2024 at 2:30 PM
Chart Type: natal
House System: Placidus

[CHART: John Doe]
[BIRTHDATA]
January 15th, 1990 at 2:30 PM
Location: New York, NY

[ANGLES]
Ascendant: 15° Aries
Midheaven: 15° Cancer

[HOUSES]
1st House: 15° Aries
2nd House: 12° Taurus
...

[PLANETS]
Sun: 5°30' Taurus in 2nd House
Moon: 0°15' Leo in 5th House
...

[ELEMENT DISTRIBUTION]
Fire: 2 (Sun, Mars)
Earth: 3 (Mercury, Venus, Saturn)
Air: 2 (Moon, Ascendant)
Water: 1 (Neptune)

[MODALITY DISTRIBUTION]
Cardinal: 3
Fixed: 4
Mutable: 1

[POLARITY]
Masculine: 4
Feminine: 4

[ASPECTS]
Sun conjunction Mercury: 1°15' orb (applying)
Moon trine Venus: 2°30' orb (separating)
...

[ASPECT PATTERNS]
T-Square: Mars (15° Capricorn) - Sun (5° Taurus) - Moon (0° Leo)
...
```

## Aspect Pattern Detection

The library automatically detects these complex aspect patterns:

- **T-Square**: Two planets in opposition with a third planet square to both
- **Grand Trine**: Three planets forming 120° aspects in the same element
- **Grand Cross**: Four planets forming two opposition pairs with all squares
- **Yod (Finger of God)**: Two planets in sextile with a third quincunx to both
- **Stellium**: 3+ planets within close orb (customizable)
- **Mystic Rectangle**: Two oppositions connected by sextiles and trines
- **Kite**: Grand Trine with a fourth planet opposite one point

## Development

```bash
# Install dependencies
npm install

# Run tests (95+ test cases)
npm test

# Test with sample configurations
npm run test:config

# Build the library
npm run build

# Development build (TypeScript only)
npm run build:tsc

# Production build (with webpack)
npm run build:webpack

# Lint code
npm run lint

# Format code with Prettier
npm run format
```

## Architecture

The library uses a modular architecture optimized for performance and extensibility:

- **Core Engine** (`src/core/`): Aspect calculations, pattern detection, orb resolution
- **Formatters** (`src/formatters/`): Text generation and output formatting
- **Configuration** (`src/config/`): Settings management and validation
- **Types** (`src/types.ts`): Comprehensive TypeScript definitions

## Performance Optimizations

- **Aspect Lookup Caching**: Pre-calculated aspect maps for pattern detection
- **Orb Resolution Caching**: Hierarchical orb calculations with performance cache
- **Efficient Pattern Detection**: Uses pre-detected aspects instead of re-calculating
- **Minimal Re-computation**: Stelliums use custom detection, others reuse aspect data

## License

MIT

---

**Note**: This library focuses on astronomical calculations and text generation. Astrological interpretations are not included - the output is structured data suitable for further processing by interpretation systems or LLMs.