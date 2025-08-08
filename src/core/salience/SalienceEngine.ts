
// src/core/salience/SalienceEngine.ts

import {
    AstrologicalReport,
    ChartAnalysis,
    AspectData,
    PlanetPosition,
    AspectPattern,
    Stellium,
} from '../../types';
import { SalienceConfig } from './types';
import { deepClone } from '../../utils/deepClone';

// A default configuration that can be overridden.
const defaultConfig: SalienceConfig = {
    baseScores: {
        patternTier1: 100, // T-Square, Grand Trine, etc.
        patternTier2: 70,  // Yod
        stellium: 80,
        planetAngleAspect: 60,
        planetPlanetAspect: 50,
        placement: 20,
    },
    modifiers: {
        orb: (orb: number) => 1 + (2 / (orb + 0.5)),
        planetTier: (planet: string) => {
            const tiers: { [key: string]: number } = {
                'Sun': 1.5, 'Moon': 1.5, 'Ascendant': 1.5, 'Midheaven': 1.5,
                'Mercury': 1.2, 'Venus': 1.2, 'Mars': 1.2,
                'Jupiter': 1.0, 'Saturn': 1.0,
                'Uranus': 0.8, 'Neptune': 0.8, 'Pluto': 0.8,
            };
            return tiers[planet] || 1.0;
        },
        angularity: (house: number) => {
            if ([1, 4, 7, 10].includes(house)) return 1.3;
            if ([2, 5, 8, 11].includes(house)) return 1.0;
            return 0.9; // Cadent
        },
        chartType: (type: 'natal' | 'synastry' | 'transit') => {
            if (type === 'natal') return 1.0;
            if (type === 'synastry') return 0.9;
            return 0.8; // transit
        }
    }
};

export class SalienceEngine {
    private config: SalienceConfig;

    constructor(config: Partial<SalienceConfig> = {}) {
        // Deep merge partial config with default config
        this.config = {
            ...defaultConfig,
            ...config,
            baseScores: { ...defaultConfig.baseScores, ...config.baseScores },
            modifiers: { ...defaultConfig.modifiers, ...config.modifiers },
        };
    }

    public annotate(report: AstrologicalReport, type: 'natal' | 'synastry' | 'transit' = 'natal'): AstrologicalReport {
        const annotatedReport = deepClone(report);

        annotatedReport.chartAnalyses.forEach((chartAnalysis: ChartAnalysis) => {
            this.scoreChartItems(chartAnalysis, type);
            this.aggregatePlanetarySalience(chartAnalysis);
        });

        // Here you would also handle synastry and transit aspects between charts
        // For now, we focus on the charts themselves.

        return annotatedReport;
    }

    private scoreChartItems(chartAnalysis: ChartAnalysis, type: 'natal' | 'synastry' | 'transit'): void {
        const chartTypeMod = this.config.modifiers.chartType(type);

        chartAnalysis.placements.planets.forEach((p: PlanetPosition) => {
            p.salienceScore = this.config.baseScores.placement
                * this.config.modifiers.angularity(p.house || 0)
                * this.config.modifiers.planetTier(p.name)
                * chartTypeMod;
        });

        chartAnalysis.aspects.forEach((a: AspectData) => {
            const planetMod = Math.max(this.config.modifiers.planetTier(a.planetA), this.config.modifiers.planetTier(a.planetB));
            const base = this.isAngle(a.planetB) ? this.config.baseScores.planetAngleAspect : this.config.baseScores.planetPlanetAspect;
            a.salienceScore = base
                * this.config.modifiers.orb(a.orb)
                * planetMod
                * chartTypeMod;
        });

        chartAnalysis.patterns.forEach((p: AspectPattern) => {
            const base = ['Yod'].includes(p.type) ? this.config.baseScores.patternTier2 : this.config.baseScores.patternTier1;
            p.salienceScore = base * chartTypeMod;
        });

        chartAnalysis.stelliums.forEach((s: Stellium) => {
            const planetCountMod = 1 + (s.planets.length - 3) * 0.2;
            const tightnessMod = 1 + (10 / (s.span + 1)); // a bit more robust against 0 span
            s.salienceScore = this.config.baseScores.stellium * planetCountMod * tightnessMod * chartTypeMod;
        });
    }

    private aggregatePlanetarySalience(chartAnalysis: ChartAnalysis): void {
        const planetaryScores = new Map<string, number>();

        const addToScore = (planet: string, score: number) => {
            if (this.isAngle(planet)) return; // Don't rank angles
            planetaryScores.set(planet, (planetaryScores.get(planet) || 0) + score);
        };

        const allItems = [
            ...(chartAnalysis.placements.planets as any[]),
            ...chartAnalysis.aspects,
            ...chartAnalysis.patterns,
            ...chartAnalysis.stelliums
        ];
        
        allItems.forEach((item: any) => {
            const score = item.salienceScore || 0;
            if (item.house) { // PlanetPosition (placement)
                addToScore(item.name, score);
            } else if (item.aspectType) { // AspectData
                addToScore(item.planetA, score);
                addToScore(item.planetB, score);
            } else if (item.type === 'Stellium') {
                item.planets.forEach((p: PlanetPosition) => addToScore(p.name, score));
            } else if (item.type) { // AspectPattern
                if (item.apex) addToScore(item.apex.name, score);
                if (item.planets) item.planets.forEach((p: PlanetPosition) => addToScore(p.name, score));
                if (item.opposition) {
                  if (Array.isArray(item.opposition)) {
                    item.opposition.forEach((p: PlanetPosition) => addToScore(p.name, score));
                  } else {
                    addToScore(item.opposition.name, score)
                  }
                }
                if (item.base) item.base.forEach((p: PlanetPosition) => addToScore(p.name, score));
            }
        });

        chartAnalysis.chart.planetarySalienceRanking = Array.from(planetaryScores.entries())
            .map(([planet, totalScore]) => ({ planet, totalScore: Math.round(totalScore) }))
            .sort((a, b) => b.totalScore - a.totalScore)
            .map((p, i) => ({ ...p, rank: i + 1 }));
    }

    private isAngle(planet: string): boolean {
        return ['Ascendant', 'Midheaven', 'Descendant', 'IC'].includes(planet);
    }
}
