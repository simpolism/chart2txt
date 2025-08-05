import { ChartData, Point, MultiChartData } from '../types';

/**
 * Validates a Point object
 * @param point The point to validate
 * @returns Error message if invalid, null if valid
 */
export function validatePoint(point: Point): string | null {
  if (!point || typeof point !== 'object') {
    return 'Point must be an object';
  }

  if (typeof point.name !== 'string' || point.name.trim() === '') {
    return 'Point name must be a non-empty string';
  }

  if (typeof point.degree !== 'number' || !isFinite(point.degree)) {
    return `Point ${point.name} has invalid degree value: ${point.degree}`;
  }

  if (
    point.speed !== undefined &&
    (typeof point.speed !== 'number' || !isFinite(point.speed))
  ) {
    return `Point ${point.name} has invalid speed value: ${point.speed}`;
  }

  return null;
}

/**
 * Validates an array of Points
 * @param points The points array to validate
 * @returns Error message if invalid, null if valid
 */
export function validatePoints(points: Point[]): string | null {
  if (!Array.isArray(points)) {
    return 'Points must be an array';
  }

  for (let i = 0; i < points.length; i++) {
    const error = validatePoint(points[i]);
    if (error) {
      return `Point at index ${i}: ${error}`;
    }
  }

  // Check for duplicate point names
  const names = points.map((p) => p.name);
  const duplicates = names.filter(
    (name, index) => names.indexOf(name) !== index
  );
  if (duplicates.length > 0) {
    return `Duplicate point names found: ${duplicates.join(', ')}`;
  }

  return null;
}

/**
 * Validates house cusps array
 * @param houseCusps The house cusps to validate
 * @returns Error message if invalid, null if valid
 */
export function validateHouseCusps(
  houseCusps: number[] | undefined
): string | null {
  if (houseCusps === undefined) {
    return null; // Optional field
  }

  if (!Array.isArray(houseCusps)) {
    return 'House cusps must be an array';
  }

  if (houseCusps.length !== 12) {
    return `House cusps must contain exactly 12 values, got ${houseCusps.length}`;
  }

  for (let i = 0; i < houseCusps.length; i++) {
    if (typeof houseCusps[i] !== 'number' || !isFinite(houseCusps[i])) {
      return `House cusp ${i + 1} has invalid value: ${houseCusps[i]}`;
    }
  }

  return null;
}

/**
 * Validates a ChartData object
 * @param chartData The chart data to validate
 * @returns Error message if invalid, null if valid
 */
export function validateChartData(chartData: ChartData): string | null {
  if (!chartData || typeof chartData !== 'object') {
    return 'Chart data must be an object';
  }

  if (typeof chartData.name !== 'string' || chartData.name.trim() === '') {
    return 'Chart name must be a non-empty string';
  }

  const pointsError = validatePoints(chartData.planets);
  if (pointsError) {
    return `Planets validation failed: ${pointsError}`;
  }

  if (chartData.ascendant !== undefined) {
    if (
      typeof chartData.ascendant !== 'number' ||
      !isFinite(chartData.ascendant)
    ) {
      return `Ascendant has invalid value: ${chartData.ascendant}`;
    }
  }

  if (chartData.midheaven !== undefined) {
    if (
      typeof chartData.midheaven !== 'number' ||
      !isFinite(chartData.midheaven)
    ) {
      return `Midheaven has invalid value: ${chartData.midheaven}`;
    }
  }

  const houseCuspsError = validateHouseCusps(chartData.houseCusps);
  if (houseCuspsError) {
    return `House cusps validation failed: ${houseCuspsError}`;
  }

  if (chartData.points !== undefined) {
    const pointsError = validatePoints(chartData.points);
    if (pointsError) {
      return `Additional points validation failed: ${pointsError}`;
    }
  }

  if (chartData.timestamp !== undefined) {
    if (
      !(chartData.timestamp instanceof Date) ||
      isNaN(chartData.timestamp.getTime())
    ) {
      return 'Timestamp must be a valid Date object';
    }
  }

  if (chartData.location !== undefined) {
    if (typeof chartData.location !== 'string') {
      return 'Location must be a string';
    }
  }

  if (chartData.chartType !== undefined) {
    const validTypes = ['natal', 'event', 'transit'];
    if (!validTypes.includes(chartData.chartType)) {
      return `Chart type must be one of: ${validTypes.join(', ')}`;
    }
  }

  return null;
}

/**
 * Validates MultiChartData
 * @param multiChartData The multi-chart data to validate
 * @returns Error message if invalid, null if valid
 */
export function validateMultiChartData(
  multiChartData: MultiChartData
): string | null {
  if (!Array.isArray(multiChartData)) {
    return 'Multi-chart data must be an array';
  }

  if (multiChartData.length === 0) {
    return 'Multi-chart data must contain at least one chart';
  }

  if (multiChartData.length > 10) {
    return 'Multi-chart data cannot contain more than 10 charts';
  }

  for (let i = 0; i < multiChartData.length; i++) {
    const error = validateChartData(multiChartData[i]);
    if (error) {
      return `Chart at index ${i} (${
        multiChartData[i]?.name || 'unnamed'
      }): ${error}`;
    }
  }

  // Check for duplicate chart names
  const names = multiChartData.map((chart) => chart.name);
  const duplicates = names.filter(
    (name, index) => names.indexOf(name) !== index
  );
  if (duplicates.length > 0) {
    return `Duplicate chart names found: ${duplicates.join(', ')}`;
  }

  // Validate transit charts
  const transitCharts = multiChartData.filter(
    (chart) => chart.chartType === 'transit'
  );
  if (transitCharts.length > 1) {
    return 'Cannot have more than one transit chart';
  }

  return null;
}

/**
 * Validates chart data (single or multi-chart)
 * @param data The data to validate
 * @returns Error message if invalid, null if valid
 */
export function validateInputData(
  data: ChartData | MultiChartData
): string | null {
  if (!data) {
    return 'Data is required';
  }

  if (Array.isArray(data)) {
    return validateMultiChartData(data);
  } else {
    return validateChartData(data);
  }
}
