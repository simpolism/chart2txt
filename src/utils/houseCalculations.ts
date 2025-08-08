import { ChartData } from '../types';
import { getHouse } from './formatting';

export function calculateHouseOverlays(chart1: ChartData, chart2: ChartData) {
  const chart1InChart2Houses: { [key: string]: number } = {};
  if (chart2.houseCusps) {
    for (const planet of chart1.planets) {
      chart1InChart2Houses[planet.name] = getHouse(
        planet.degree,
        chart2.houseCusps
      );
    }
  }

  const chart2InChart1Houses: { [key: string]: number } = {};
  if (chart1.houseCusps) {
    for (const planet of chart2.planets) {
      chart2InChart1Houses[planet.name] = getHouse(
        planet.degree,
        chart1.houseCusps
      );
    }
  }

  return { chart1InChart2Houses, chart2InChart1Houses };
}

export function getHouseForPoint(degree: number, houseCusps: number[]): number {
    return getHouse(degree, houseCusps);
}
