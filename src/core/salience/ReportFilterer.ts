
// src/core/salience/ReportFilterer.ts

import {
    AstrologicalReport,
    ChartAnalysis,
    Scorable
} from '../../types';
import { FilterConfig } from './types';
import { deepClone } from '../../utils/deepClone';

export class ReportFilterer {
    private config: FilterConfig;

    constructor(config: FilterConfig) {
        this.config = config;
    }

    public filter(report: AstrologicalReport): AstrologicalReport {
        if (this.config.detailLevel === 'complete') {
            return report;
        }

        const filteredReport = deepClone(report);

        const allItems: Scorable[] = [];
        filteredReport.chartAnalyses.forEach((chart: ChartAnalysis) => {
            allItems.push(
                ...chart.placements.planets,
                ...chart.aspects,
                ...chart.patterns,
                ...chart.stelliums
            );
        });
        // In a full implementation, you would also collect synastry and transit items here.

        if (allItems.length === 0) {
            return filteredReport;
        }

        const scores = allItems.map(item => item.salienceScore || 0).sort((a, b) => b - a);
        const threshold = this.getThreshold(scores);

        filteredReport.chartAnalyses.forEach((chart: ChartAnalysis) => {
            chart.placements.planets = chart.placements.planets.filter(p => (p.salienceScore || 0) >= threshold);
            chart.aspects = chart.aspects.filter(a => (a.salienceScore || 0) >= threshold);
            chart.patterns = chart.patterns.filter(p => (p.salienceScore || 0) >= threshold);
            chart.stelliums = chart.stelliums.filter(s => (s.salienceScore || 0) >= threshold);
        });

        return filteredReport;
    }

    private getThreshold(scores: number[]): number {
        let percentileIndex = 0;

        switch (this.config.detailLevel) {
            case 'standard':
                // Keep top 50%
                percentileIndex = Math.floor(scores.length / 2);
                break;
            case 'summary':
                // Keep top 25%
                percentileIndex = Math.floor(scores.length / 4);
                break;
            default:
                return 0; // Keep all for 'complete'
        }
        
        // Ensure index is within bounds
        if (percentileIndex >= scores.length) {
            return 0;
        }

        return scores[percentileIndex];
    }
}
