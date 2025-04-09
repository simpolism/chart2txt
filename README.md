# chart2txt

A TypeScript library that converts astrological chart data to human-readable text.

## Features

- Convert planet positions to text descriptions of their zodiac signs
- Calculate and describe house placements when an ascendant is provided
- Calculate and describe aspects between planets

## Installation

```bash
npm install chart2txt
```

## Usage

```typescript
import { chart2txt } from 'chart2txt';

const chartData = {
  planets: [
    { name: 'Sun', longitude: 35 },  // 5° Taurus
    { name: 'Moon', longitude: 120 }, // 0° Leo
    { name: 'Mercury', longitude: 75 } // 15° Gemini
  ],
  ascendant: 0 // 0° Aries
};

const settings = {
  // modified settings go here
};

const textDescription = chart2txt(chartData, settings);
console.log(textDescription);
```

### Settings

The conversion to text is configurable through the settings object. Any number of provided settings can be specified, and will overwrite the defaults when provided. Explanations of each setting can be found in the [types.ts](src/types.ts) file, and the default settings can be found in the [constants.ts](src/constants.ts) file. See the [tests file](tests/index.test.ts) for example uses of each setting.

**NOTE**: Overriding aspects must be done by replacing the entire object, i.e. by modifying the following data object to suit your needs:

```javascript
[
  { name: 'conjunction', angle: 0, orb: 5 },
  { name: 'opposition', angle: 180, orb: 5 },
  { name: 'trine', angle: 120, orb: 5 },
  { name: 'square', angle: 90, orb: 5 },
  { name: 'sextile', angle: 60, orb: 3 },
]
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the library
npm run build

# Lint code
npm run lint

# Format code
npm run format
```

## License

MIT
