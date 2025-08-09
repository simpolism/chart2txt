# chart2txt

An **automated text-based astrological pattern detection utility** designed primarily for LLM consumption with secondary human readability. This TypeScript library converts complex astrological chart data into structured, standardized text reports or raw JSON data.

[![npm version](https://badge.fury.io/js/chart2txt.svg)](https://badge.fury.io/js/chart2txt)

## Purpose & Design Philosophy

chart2txt is designed as an **automated pattern detection engine** that transforms astrological chart data into consistent, structured formats. A primary goal is to provide a clear separation between the analysis engine (which produces a structured `AstrologicalReport` object) and the text formatter. This allows developers to either use the raw JSON for their own applications or generate an LLM-readable (and human-readable) text report.

## Features

- **Single & Multi-Chart Analysis**: Natal, event, synastry, and transit chart processing.
- **Comprehensive Aspect Detection**: Including all major and minor aspects.
- **Advanced Aspect Patterns**: T-Square, Grand Trine, Yod, Stellium, Kite, and more.
- **Simple Orb System**: Generous orb detection with configurable aspect strength classification.
- **Sign Distributions**: Element, modality, and polarity analysis.
- **Dual Output**: Generate either a structured JSON `AstrologicalReport` or a formatted text string.

## Installation

```bash
npm install chart2txt
```

## API Reference

The library exposes three main functions to provide maximum flexibility.

### 1. `formatChartToJson` (Analysis)

This is the core analysis engine. It takes chart data and returns a structured `AstrologicalReport` object without any text formatting.

```typescript
import { formatChartToJson } from 'chart2txt';

function formatChartToJson(
  data: ChartData | MultiChartData, 
  partialSettings?: PartialSettings
): AstrologicalReport
```

**Alias**: `analyzeCharts()`

### 2. `formatReportToText` (Formatting)

This function takes a complete `AstrologicalReport` object (the output of `formatChartToJson`) and formats it into a human-readable text string.

```typescript
import { formatReportToText } from 'chart2txt';

function formatReportToText(
  report: AstrologicalReport
): string
```

### 3. `chart2txt` (End-to-End)

A convenience function that combines analysis and formatting in one step. It's the simplest way to get a text report directly from chart data.

```typescript
import { chart2txt } from 'chart2txt';

function chart2txt(
  data: ChartData | MultiChartData, 
  partialSettings?: PartialSettings
): string
```

### Core Types

```typescript
interface ChartData {
  name: string;
  planets: Point[];
  houseCusps?: number[];
  ascendant?: number;
  midheaven?: number;
  timestamp?: string;
  location?: string;
  chartType?: 'natal' | 'event' | 'transit';
}

interface Point {
  name: string;
  degree: number; // 0-359.99
  speed?: number; // For applying/separating aspects
}
```

### Configuration

Configuration is handled via the `PartialSettings` object. The orb system uses generous detection orbs with configurable aspect strength classification.

```typescript
import { chart2txt, formatChartToJson } from 'chart2txt';

// Example: Using a preset for tight orbs
const report = formatChartToJson(chartData, {
  aspectDefinitions: 'tight'
});

// Example: Custom aspect strength thresholds
const report = formatChartToJson(chartData, {
  aspectStrengthThresholds: {
    tight: 1.5,    // Aspects <= 1.5° are 'tight'
    moderate: 3.5  // Aspects 1.5-3.5° are 'moderate', >3.5° are 'wide'
  }
});
```

#### Orb Presets
The library includes four built-in orb presets:
```typescript
// String presets (recommended)
aspectDefinitions: 'traditional' // Wide, classical orbs
aspectDefinitions: 'modern'      // Balanced, contemporary orbs  
aspectDefinitions: 'tight'       // Narrow, precise orbs
aspectDefinitions: 'wide'        // Very wide orbs for subtle influences

// You can also import the preset arrays directly
import { 
  SIMPLE_TRADITIONAL_ORBS,
  SIMPLE_MODERN_ORBS,
  SIMPLE_TIGHT_ORBS,
  SIMPLE_WIDE_ORBS
} from 'chart2txt';
```

## Usage Examples

### Basic Text Report (End-to-End)
```typescript
import { chart2txt } from 'chart2txt';

const natalChart = {
  name: "John Doe",
  planets: [
    { name: 'Sun', degree: 35.5 },
    { name: 'Moon', degree: 120.25 },
  ],
  ascendant: 15.0,
  midheaven: 105.0,
};

const reportText = chart2txt(natalChart);
console.log(reportText);
```

### Two-Step Analysis and Formatting
This approach is recommended for applications that need to inspect the analysis data before formatting.

```typescript
import { formatChartToJson, formatReportToText } from 'chart2txt';

const synastryData = [
  { name: "Person A", planets: [{ name: 'Sun', degree: 45 }] },
  { name: "Person B", planets: [{ name: 'Sun', degree: 225 }] }
];

// 1. Generate the analysis report (JSON object)
const reportJson = formatChartToJson(synastryData, { includeAspectPatterns: true });

// 2. (Optional) Inspect or modify the report object
console.log('Detected composite patterns:', reportJson.pairwiseAnalyses[0].compositePatterns);

// 3. Format the report object into text
const reportText = formatReportToText(reportJson);
console.log(reportText);
```

### Using Orb Presets
```typescript
import { chart2txt } from 'chart2txt';

const report = chart2txt(chartData, {
  aspectDefinitions: 'tight',
  includeAspectPatterns: true
});
```

### Custom Aspect Strength Classification

The library provides a simple default classification (tight <= 2°, moderate 2-4°, wide > 4°), but developers can implement sophisticated custom strength logic:

```typescript
import { formatChartToJson, AspectData } from 'chart2txt';

// 1. Use wide orbs for detection to catch all potentially relevant aspects
const report = formatChartToJson(chartData, {
  aspectDefinitions: 'wide', // Generous detection orbs
  aspectStrengthThresholds: { tight: 1.0, moderate: 2.5 } // Custom thresholds
});

// 2. Implement custom strength classification logic
function customAspectStrength(aspect: AspectData): 'critical' | 'important' | 'moderate' | 'minor' {
  let score = 0;
  
  // Factor 1: Tighter orb = higher score
  score += (3 - aspect.orb) * 2;
  
  // Factor 2: Planet importance
  if (['Sun', 'Moon'].includes(aspect.planetA) || ['Sun', 'Moon'].includes(aspect.planetB)) {
    score += 8; // Luminaries are more important
  }
  
  // Factor 3: Aspect type significance  
  const majorAspects = ['conjunction', 'opposition', 'square', 'trine'];
  if (majorAspects.includes(aspect.aspectType)) {
    score += 6;
  }
  
  // Factor 4: Applying aspects are stronger
  if (aspect.application === 'applying') {
    score += 2;
  }
  
  // Convert score to classification
  if (score >= 15) return 'critical';
  if (score >= 10) return 'important'; 
  if (score >= 6) return 'moderate';
  return 'minor';
}

// 3. Apply custom classification to aspects
report.chartAnalyses.forEach(chartAnalysis => {
  chartAnalysis.aspects.forEach(aspect => {
    const customStrength = customAspectStrength(aspect);
    console.log(`${aspect.planetA} ${aspect.aspectType} ${aspect.planetB}: ${customStrength}`);
  });
});
```

**Example Output:**
```
Sun conjunction Moon: critical    // 1.2° orb, luminaries, major aspect, applying
Mars square Venus: important      // 2.1° orb, major aspect  
Jupiter sextile Mercury: moderate // 3.8° orb, minor aspect
Saturn quincunx Pluto: minor      // 4.2° orb, minor aspect, outer planets
```

## Example Output

Here is an example of the text report generated for a single natal chart.

**Input Code:**
```typescript
import { chart2txt } from 'chart2txt';

const chartData = {
  name: "Jane Doe",
  planets: [
    { name: 'Sun', degree: 0 },      // 0° Aries
    { name: 'Moon', degree: 180 },   // 0° Libra
    { name: 'Saturn', degree: 90 }   // 0° Cancer
  ],
  ascendant: 15.0,
  midheaven: 105.0,
  houseCusps: [15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345],
  timestamp: "1992-03-20T10:00:00Z",
  location: "London, UK"
};

const report = chart2txt(chartData, { includeAspectPatterns: true });
console.log(report);
```

**Generated Report:**
```
[METADATA]
chart_type: natal
house_system: whole_sign
date_format: MM/DD/YYYY

[CHART: Jane Doe]
[BIRTHDATA]
London, UK | 03/20/1992 | 10:00:00 AM

[ANGLES]
Ascendant: 15° Aries
Midheaven: 15° Cancer

[HOUSE CUSPS]
1st house: 15° Aries     7th house: 15° Libra
2nd house: 15° Taurus    8th house: 15° Scorpio
3rd house: 15° Gemini    9th house: 15° Sagittarius
4th house: 15° Cancer    10th house: 15° Capricorn
5th house: 15° Leo       11th house: 15° Aquarius
6th house: 15° Virgo     12th house: 15° Pisces

[PLANETS]
Sun: 0° Aries [Exaltation | Ruler: Mars], 12th house
Moon: 0° Libra [Ruler: Venus], 6th house
Saturn: 0° Cancer [Detriment | Ruler: Moon], 3rd house

[DISPOSITOR TREE]
Sun → Mars (not in chart)
Moon → Venus (not in chart)
Saturn → Moon → Venus (not in chart)

[ELEMENT DISTRIBUTION]
Fire: 1 (Sun)
Earth: 0
Air: 1 (Moon)
Water: 1 (Saturn)

[MODALITY DISTRIBUTION]
Cardinal: 2
Fixed: 1
Mutable: 0

[POLARITY]
Masculine: 2
Feminine: 1

[ASPECTS]
[TIGHT ASPECTS: orb under 2.0°]
Sun opposition Moon: 0.0°
Sun square Saturn: 0.0°
Moon square Saturn: 0.0°

[ASPECT PATTERNS]
No stelliums detected.
T-Square:
  - Apex: Saturn 0° Cancer
  - Opposition: Sun 0° Aries - Moon 0° Libra
  - Mode: Cardinal
  - Average orb: 0.0°

```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the library
npm run build
```

## License

MIT
