
// src/core/salience/types.ts

export interface SalienceConfig {
    baseScores: {
        patternTier1: number;
        patternTier2: number;
        stellium: number;
        planetAngleAspect: number;
        planetPlanetAspect: number;
        placement: number;
    };
    modifiers: {
        orb: (orb: number) => number;
        planetTier: (planet: string) => number;
        angularity: (house: number) => number;
        chartType: (type: 'natal' | 'synastry' | 'transit') => number;
    };
}

export interface FilterConfig {
    detailLevel: 'summary' | 'standard' | 'complete';
}
