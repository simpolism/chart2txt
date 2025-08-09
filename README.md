# chart2txt

An **automated text-based astrological pattern detection utility** designed primarily for LLM consumption with secondary human readability. This TypeScript library converts complex astrological chart data into structured, standardized text reports or raw JSON data.

[![npm version](https://badge.fury.io/js/chart2txt.svg)](https://badge.fury.io/js/chart2txt)

## Purpose & Design Philosophy

chart2txt is designed as an **automated pattern detection engine** that transforms astrological chart data into consistent, structured formats. A primary goal is to provide a clear separation between the analysis engine (which produces a structured `AstrologicalReport` object) and the text formatter. This allows developers to either use the raw JSON for their own applications or generate an LLM-readable (and human-readable) text report.

## Features

- **Single & Multi-Chart Analysis**: Natal, event, synastry, and transit chart processing.
- **Comprehensive Aspect Detection**: Including all major and minor aspects.
- **Advanced Aspect Patterns**: T-Square, Grand Trine, Yod, Stellium, and more.
- **Configurable Orb System**: Use presets or define your own aspect strength thresholds.
- **Sign Distributions**: Element, modality, and polarity analysis.
- **Dual Output**: Generate either a structured JSON `AstrologicalReport` or a formatted text string.

## Installation

```bash
npm install chart2txt
```

## Usage Workflows

There are two primary ways to use `chart2txt`, depending on your needs.

### 1. Simple Workflow (All-in-One)

This is the easiest way to get a text report. The `chart2txt()` function handles everything: analysis, default aspect grouping, and formatting.

```typescript
import { chart2txt } from 'chart2txt';

const natalChart = {
  name: "John Doe",
  planets: [
    { name: 'Sun', degree: 35.5 },
    { name: 'Moon', degree: 120.25 },
  ],
};

// Get a report with default settings
const reportText = chart2txt(natalChart);
console.log(reportText);

// Override the default aspect grouping
const reportWithCustomGrouping = chart2txt(natalChart, {
  aspectStrengthThresholds: {
    tight: 1.0,
    moderate: 5.0
  }
});
console.log(reportWithCustomGrouping);
```

### 2. Advanced Workflow (Analyze -> Group -> Format)

This workflow gives you complete control over the process. It is recommended for applications that need to inspect or modify the analysis data before formatting.

This is the workflow demonstrated in the live example page.

```typescript
import { analyzeCharts, formatReportToText, AstrologicalReport, AspectData } from 'chart2txt';

const synastryData = [
  { name: "Person A", planets: [{ name: 'Sun', degree: 45 }] },
  { name: "Person B", planets: [{ name: 'Sun', degree: 225 }] }
];

// 1. ANALYZE: Get the raw, ungrouped report object.
const report: AstrologicalReport = analyzeCharts(synastryData, { 
  includeAspectPatterns: true 
});

// 2. CUSTOM GROUPING: Apply your own business logic.
// Here, you can implement any grouping strategy you want. For this example,
// we'll group aspects into "Hard" and "Soft" categories.

const hardAspects: AspectData[] = [];
const softAspects: AspectData[] = [];

report.pairwiseAnalyses[0].synastryAspects.forEach(aspect => {
  if (['square', 'opposition'].includes(aspect.aspectType)) {
    hardAspects.push(aspect);
  } else {
    softAspects.push(aspect);
  }
});

// Create a Map to preserve category order.
const myGroupedAspects = new Map<string, AspectData[]>();
myGroupedAspects.set('[HARD ASPECTS]', hardAspects);
myGroupedAspects.set('[SOFT ASPECTS]', softAspects);

// Inject your custom-grouped map back into the report object.
report.pairwiseAnalyses[0].groupedSynastryAspects = myGroupedAspects;

// 3. FORMAT: Generate the text from your modified report object.
const reportText = formatReportToText(report);
console.log(reportText);
```

## API Reference

### Core Functions

*   `chart2txt(data, [settings])`: The all-in-one function.
*   `analyzeCharts(data, [settings])`: Performs analysis and returns a raw `AstrologicalReport`.
*   `formatReportToText(report)`: Formats a (potentially modified) `AstrologicalReport` into a string.
*   `groupAspects(aspects, settings)`: The default aspect grouping logic used by `chart2txt()`.

### Configuration (`Settings`)

The `Settings` object is composed of three parts:

*   **`AnalysisSettings`**: For `analyzeCharts()`
    *   `aspectDefinitions`: Aspect orbs. Can be a preset string (`'traditional'`, `'modern'`, `'tight'`, `'wide'`) or a custom array.
    *   `skipOutOfSignAspects`: `boolean`
    *   `includeAspectPatterns`: `boolean`
    *   `includeSignDistributions`: `boolean`
*   **`GroupingSettings`**: For `groupAspects()` or the simple `chart2txt()` workflow.
    *   `aspectStrengthThresholds`: An object to define orb limits for default grouping, e.g., `{ tight: 2.0, moderate: 4.0 }`.
*   **`FormattingSettings`**: For `formatReportToText()`
    *   `dateFormat`: `string`
    *   `houseSystemName`: `string`

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