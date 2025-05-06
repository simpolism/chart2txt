import { ChartData, MultiChartData, PartialSettings } from '../../types';
import { ChartSettings } from '../../config/ChartSettings';
import {
  calculateAspects,
  calculateMultichartAspects,
} from '../../core/aspects';

import { generateMetadataOutput } from './sections/metadata';
import { generateChartHeaderOutput } from './sections/chartHeader';
import { generateBirthdataOutput } from './sections/birthdata';
import { generateAnglesOutput } from './sections/angles';
import { generatePlanetsOutput } from './sections/planets';
import { generateAspectsOutput } from './sections/aspects';
import { generateHouseOverlaysOutput } from './sections/houseOverlays';

/**
 * Orchestrates the generation of a complete astrological chart report in text format.
 * @param data The chart data, can be for a single chart or multiple charts (synastry, transits).
 * @param partialSettings Optional: Custom settings to override defaults.
 * @returns A string representing the full chart report.
 */
export function formatChartToText(
  data: ChartData | MultiChartData,
  partialSettings: PartialSettings = {}
): string {
  const settings = new ChartSettings(partialSettings);
  const outputLines: string[] = [];

  let baseChartType = 'natal';
  let primaryHouseSystemName: string | undefined;

  if ('chart1' in data) {
    // Check if it's MultiChartData
    const multiData = data as MultiChartData;
    primaryHouseSystemName = multiData.chart1.houseSystemName; // Use chart1's house system name for overall metadata
    if (multiData.chart2 && multiData.transit)
      baseChartType = 'synastry_with_transit';
    else if (multiData.chart2) baseChartType = 'synastry';
    else if (multiData.transit) baseChartType = 'natal_with_transit';
  } else {
    // Single ChartData object
    primaryHouseSystemName = (data as ChartData).houseSystemName;
  }

  outputLines.push(
    ...generateMetadataOutput(settings, baseChartType, primaryHouseSystemName)
  );
  outputLines.push(''); // Blank line after metadata

  const processSingleChartOutput = (
    chartData: ChartData,
    chartTitlePrefix?: string
  ): void => {
    outputLines.push(
      ...generateChartHeaderOutput(chartData.name, chartTitlePrefix)
    );
    outputLines.push(
      ...generateBirthdataOutput(
        chartData.location,
        chartData.timestamp,
        settings
      )
    );
    outputLines.push(
      ...generateAnglesOutput(chartData.ascendant, chartData.midheaven)
    );
    outputLines.push(
      ...generatePlanetsOutput(
        chartData.planets,
        chartData.houseCusps,
        settings
      )
    );

    const aspects = calculateAspects(
      settings.aspectDefinitions,
      chartData.planets
    );
    // For single chart, p1ChartName and p2ChartName are not needed for aspect string generation
    outputLines.push(...generateAspectsOutput('[ASPECTS]', aspects, settings));
    outputLines.push('');
  };

  const processTransitChartInfoOutput = (transitData: ChartData): void => {
    outputLines.push(
      ...generateChartHeaderOutput(transitData.name || 'Current', 'TRANSIT')
    );
    outputLines.push(
      ...generateBirthdataOutput(
        transitData.location,
        transitData.timestamp,
        settings,
        '[DATETIME]'
      )
    );
    // For transit chart's own planets, houses are usually not shown unless it's a full natal chart for that moment.
    outputLines.push(
      ...generatePlanetsOutput(
        transitData.planets,
        transitData.houseCusps,
        settings
      )
    );
    outputLines.push('');
  };

  if ('chart1' in data) {
    // MultiChartData
    const multiData = data as MultiChartData;
    const chart1 = multiData.chart1;
    const chart1Name = chart1.name || 'Chart 1';
    processSingleChartOutput(chart1);

    if (multiData.chart2) {
      const chart2 = multiData.chart2;
      const chart2Name = chart2.name || 'Chart 2';
      processSingleChartOutput(chart2);

      // Synastry Section
      outputLines.push(
        ...generateChartHeaderOutput(`${chart1Name}-${chart2Name}`, 'SYNASTRY')
      );
      const synastryAspects = calculateMultichartAspects(
        settings.aspectDefinitions,
        chart1.planets,
        chart2.planets
      );
      outputLines.push(
        ...generateAspectsOutput(
          '[PLANET-PLANET ASPECTS]',
          synastryAspects,
          settings,
          chart1Name,
          chart2Name
        )
      );
      outputLines.push('');
      outputLines.push(
        ...generateHouseOverlaysOutput(chart1, chart2, settings)
      );
      outputLines.push('');
    }

    if (multiData.transit) {
      const transit = multiData.transit;
      const transitName = transit.name || 'Current'; // Used for p2ChartName in transit aspects
      processTransitChartInfoOutput(transit);

      // Transit Aspects to Chart 1
      const transitAspectsC1 = calculateMultichartAspects(
        settings.aspectDefinitions,
        chart1.planets,
        transit.planets
      );
      outputLines.push(
        ...generateAspectsOutput(
          `[TRANSIT ASPECTS: ${chart1Name}]`,
          transitAspectsC1,
          settings,
          chart1Name,
          transitName,
          true
        )
      );
      outputLines.push('');

      if (multiData.chart2) {
        const chart2Name = multiData.chart2.name || 'Chart 2';
        // Transit Aspects to Chart 2
        const transitAspectsC2 = calculateMultichartAspects(
          settings.aspectDefinitions,
          multiData.chart2.planets,
          transit.planets
        );
        outputLines.push(
          ...generateAspectsOutput(
            `[TRANSIT ASPECTS: ${chart2Name}]`,
            transitAspectsC2,
            settings,
            chart2Name,
            transitName,
            true
          )
        );
        outputLines.push('');
      }
    }
  } else {
    // Single ChartData object
    processSingleChartOutput(data as ChartData);
  }

  return outputLines.join('\n').trimEnd();
}
