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

const textDescription = chart2txt(chartData);
console.log(textDescription);
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
