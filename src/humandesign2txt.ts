/**
 * humandesign2txt
 * Converts Human Design chart data to human-readable text for LLM consumption.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface PlanetPosition {
  name: string;
  longitude: number;
  speed: number;
}

export interface CalculationResult {
  planets: PlanetPosition[];
  ascendant: number;
  midheaven: number;
  houseCusps: number[];
  date: string;
  time: string;
  location: {
    latitude: number;
    longitude: number;
  };
  timezone?: string;
}

export interface HumanDesignApiResponse {
  personality: CalculationResult;
  design: CalculationResult;
  metadata: {
    designUtcDateTime: string;
    solarArcDegrees: number;
    personalitySunLongitude: number;
    designSunLongitude: number;
  };
}

export interface Activation {
  planet: string;
  gate: number;
  line: number;
}

export interface Channel {
  gates: [number, number];
  name: string;
  centers: [string, string];
}

export interface HumanDesignChart {
  name: string;
  location: string;
  date: string;
  time: string;
  type: string;
  strategy: string;
  authority: string;
  definition: string;
  profile: string;
  profileName: string;
  incarnationCross: string;
  definedCenters: string[];
  undefinedCenters: string[];
  openCenters: string[];
  activeChannels: Channel[];
  allGates: Map<number, { center: string; sources: string[] }>;
  personalityActivations: Activation[];
  designActivations: Activation[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * The 64 gates in I Ching wheel order (starting from 0° Aries after 58° adjustment)
 */
export const GATES: number[] = [
  41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
  27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
  31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
  28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60
];

/**
 * Gate names (I Ching / Human Design names)
 */
export const GATE_NAMES: Record<number, string> = {
  1: 'Self-Expression',
  2: 'Direction of the Self',
  3: 'Ordering',
  4: 'Formulization',
  5: 'Fixed Rhythms',
  6: 'Friction',
  7: 'The Role of the Self',
  8: 'Contribution',
  9: 'Focus',
  10: 'Behavior of the Self',
  11: 'Ideas',
  12: 'Caution',
  13: 'The Listener',
  14: 'Power Skills',
  15: 'Extremes',
  16: 'Skills',
  17: 'Opinions',
  18: 'Correction',
  19: 'Wanting',
  20: 'The Now',
  21: 'The Hunter',
  22: 'Openness',
  23: 'Assimilation',
  24: 'Rationalization',
  25: 'Innocence',
  26: 'The Egoist',
  27: 'Caring',
  28: 'The Game Player',
  29: 'Perseverance',
  30: 'Feelings',
  31: 'Influence',
  32: 'Continuity',
  33: 'Privacy',
  34: 'Power',
  35: 'Change',
  36: 'Crisis',
  37: 'Friendship',
  38: 'The Fighter',
  39: 'Provocation',
  40: 'Aloneness',
  41: 'Contraction',
  42: 'Growth',
  43: 'Insight',
  44: 'Alertness',
  45: 'The Gatherer',
  46: 'Determination',
  47: 'Realization',
  48: 'Depth',
  49: 'Principles',
  50: 'Values',
  51: 'Shock',
  52: 'Stillness',
  53: 'Beginnings',
  54: 'Ambition',
  55: 'Spirit',
  56: 'Stimulation',
  57: 'Intuition',
  58: 'Vitality',
  59: 'Sexuality',
  60: 'Limitation',
  61: 'Mystery',
  62: 'Details',
  63: 'Doubt',
  64: 'Confusion'
};

/**
 * Which center each gate belongs to
 */
export const GATE_CENTERS: Record<number, string> = {
  // Head Center
  64: 'Head', 61: 'Head', 63: 'Head',
  // Ajna Center
  47: 'Ajna', 24: 'Ajna', 4: 'Ajna', 17: 'Ajna', 43: 'Ajna', 11: 'Ajna',
  // Throat Center
  62: 'Throat', 23: 'Throat', 56: 'Throat', 35: 'Throat', 12: 'Throat',
  45: 'Throat', 33: 'Throat', 8: 'Throat', 31: 'Throat', 20: 'Throat',
  16: 'Throat',
  // G Center (Self)
  7: 'G Center', 1: 'G Center', 13: 'G Center', 25: 'G Center', 46: 'G Center',
  2: 'G Center', 15: 'G Center', 10: 'G Center',
  // Heart/Ego Center
  21: 'Ego', 40: 'Ego', 26: 'Ego', 51: 'Ego',
  // Solar Plexus Center
  36: 'Solar Plexus', 22: 'Solar Plexus', 37: 'Solar Plexus', 6: 'Solar Plexus',
  49: 'Solar Plexus', 55: 'Solar Plexus', 30: 'Solar Plexus',
  // Sacral Center
  34: 'Sacral', 5: 'Sacral', 14: 'Sacral', 29: 'Sacral', 59: 'Sacral',
  9: 'Sacral', 3: 'Sacral', 42: 'Sacral', 27: 'Sacral',
  // Spleen Center
  48: 'Spleen', 57: 'Spleen', 44: 'Spleen', 50: 'Spleen', 32: 'Spleen',
  28: 'Spleen', 18: 'Spleen',
  // Root Center
  58: 'Root', 38: 'Root', 54: 'Root', 53: 'Root', 60: 'Root', 52: 'Root',
  19: 'Root', 39: 'Root', 41: 'Root'
};

/**
 * All 36 channels with their gate pairs, names, and connected centers
 */
export const CHANNELS: Channel[] = [
  // Head to Ajna
  { gates: [64, 47], name: 'Abstraction', centers: ['Head', 'Ajna'] },
  { gates: [61, 24], name: 'Awareness', centers: ['Head', 'Ajna'] },
  { gates: [63, 4], name: 'Logic', centers: ['Head', 'Ajna'] },
  // Ajna to Throat
  { gates: [17, 62], name: 'Acceptance', centers: ['Ajna', 'Throat'] },
  { gates: [43, 23], name: 'Structuring', centers: ['Ajna', 'Throat'] },
  { gates: [11, 56], name: 'Curiosity', centers: ['Ajna', 'Throat'] },
  // G Center to Throat
  { gates: [7, 31], name: 'The Alpha', centers: ['G Center', 'Throat'] },
  { gates: [1, 8], name: 'Inspiration', centers: ['G Center', 'Throat'] },
  { gates: [13, 33], name: 'The Prodigal', centers: ['G Center', 'Throat'] },
  { gates: [10, 20], name: 'Awakening', centers: ['G Center', 'Throat'] },
  // G Center to Sacral
  { gates: [15, 5], name: 'Rhythm', centers: ['G Center', 'Sacral'] },
  { gates: [2, 14], name: 'The Beat', centers: ['G Center', 'Sacral'] },
  { gates: [46, 29], name: 'Discovery', centers: ['G Center', 'Sacral'] },
  // G Center to Spleen
  { gates: [10, 57], name: 'Perfected Form', centers: ['G Center', 'Spleen'] },
  // G Center to Ego
  { gates: [25, 51], name: 'Initiation', centers: ['G Center', 'Ego'] },
  // Ego to Throat
  { gates: [21, 45], name: 'Money', centers: ['Ego', 'Throat'] },
  // Ego to Solar Plexus
  { gates: [37, 40], name: 'Community', centers: ['Ego', 'Solar Plexus'] },
  // Ego to Spleen
  { gates: [26, 44], name: 'Surrender', centers: ['Ego', 'Spleen'] },
  // Sacral to Throat
  { gates: [34, 20], name: 'Charisma', centers: ['Sacral', 'Throat'] },
  // Sacral to Spleen
  { gates: [34, 57], name: 'Power', centers: ['Sacral', 'Spleen'] },
  { gates: [27, 50], name: 'Preservation', centers: ['Sacral', 'Spleen'] },
  // Sacral to Solar Plexus
  { gates: [59, 6], name: 'Intimacy', centers: ['Sacral', 'Solar Plexus'] },
  // Sacral to Root
  { gates: [42, 53], name: 'Maturation', centers: ['Sacral', 'Root'] },
  { gates: [3, 60], name: 'Mutation', centers: ['Sacral', 'Root'] },
  { gates: [9, 52], name: 'Concentration', centers: ['Sacral', 'Root'] },
  // Spleen to Throat
  { gates: [16, 48], name: 'The Wavelength', centers: ['Spleen', 'Throat'] },
  { gates: [57, 20], name: 'The Brainwave', centers: ['Spleen', 'Throat'] },
  // Spleen to Root
  { gates: [18, 58], name: 'Judgment', centers: ['Spleen', 'Root'] },
  { gates: [28, 38], name: 'Struggle', centers: ['Spleen', 'Root'] },
  { gates: [32, 54], name: 'Transformation', centers: ['Spleen', 'Root'] },
  // Solar Plexus to Throat
  { gates: [12, 22], name: 'Openness', centers: ['Solar Plexus', 'Throat'] },
  { gates: [35, 36], name: 'Transitoriness', centers: ['Solar Plexus', 'Throat'] },
  // Solar Plexus to Root
  { gates: [19, 49], name: 'Synthesis', centers: ['Solar Plexus', 'Root'] },
  { gates: [39, 55], name: 'Emoting', centers: ['Solar Plexus', 'Root'] },
  { gates: [41, 30], name: 'Recognition', centers: ['Solar Plexus', 'Root'] },
  // Sacral to G Center (via 10-34, often grouped with Sacral-Spleen)
  { gates: [34, 10], name: 'Exploration', centers: ['Sacral', 'G Center'] }
];

/**
 * Profile names by line combination
 */
export const PROFILE_NAMES: Record<string, string> = {
  '1/3': 'Investigator/Martyr',
  '1/4': 'Investigator/Opportunist',
  '2/4': 'Hermit/Opportunist',
  '2/5': 'Hermit/Heretic',
  '3/5': 'Martyr/Heretic',
  '3/6': 'Martyr/Role Model',
  '4/6': 'Opportunist/Role Model',
  '4/1': 'Opportunist/Investigator',
  '5/1': 'Heretic/Investigator',
  '5/2': 'Heretic/Hermit',
  '6/2': 'Role Model/Hermit',
  '6/3': 'Role Model/Martyr'
};

/**
 * Incarnation Cross names by Sun gate (simplified - Right Angle crosses)
 * Format: { gateNumber: "Cross Name" }
 */
export const INCARNATION_CROSSES: Record<number, string> = {
  1: 'The Sphinx',
  2: 'The Sphinx',
  3: 'Laws',
  4: 'Explanation',
  5: 'Consciousness',
  6: 'Eden',
  7: 'The Sphinx',
  8: 'Contagion',
  9: 'Planning',
  10: 'Vessel of Love',
  11: 'Eden',
  12: 'Eden',
  13: 'The Sphinx',
  14: 'Contagion',
  15: 'Vessel of Love',
  16: 'Planning',
  17: 'Service',
  18: 'Service',
  19: 'The Four Ways',
  20: 'The Sleeping Phoenix',
  21: 'Tension',
  22: 'Rulership',
  23: 'Explanation',
  24: 'The Four Ways',
  25: 'Vessel of Love',
  26: 'Rulership',
  27: 'The Unexpected',
  28: 'The Unexpected',
  29: 'Contagion',
  30: 'Contagion',
  31: 'The Unexpected',
  32: 'Maya',
  33: 'The Four Ways',
  34: 'The Sleeping Phoenix',
  35: 'Consciousness',
  36: 'Eden',
  37: 'Planning',
  38: 'Tension',
  39: 'Tension',
  40: 'Planning',
  41: 'The Unexpected',
  42: 'Maya',
  43: 'Explanation',
  44: 'The Four Ways',
  45: 'Rulership',
  46: 'Vessel of Love',
  47: 'Rulership',
  48: 'Tension',
  49: 'Explanation',
  50: 'Laws',
  51: 'Penetration',
  52: 'Service',
  53: 'Penetration',
  54: 'Penetration',
  55: 'The Sleeping Phoenix',
  56: 'Laws',
  57: 'Penetration',
  58: 'Service',
  59: 'The Sleeping Phoenix',
  60: 'Laws',
  61: 'Maya',
  62: 'Maya',
  63: 'Consciousness',
  64: 'Consciousness'
};

/**
 * Strategy by Type
 */
export const STRATEGY_BY_TYPE: Record<string, string> = {
  'Generator': 'Wait to Respond',
  'Manifesting Generator': 'Wait to Respond',
  'Manifestor': 'Inform Before Acting',
  'Projector': 'Wait for the Invitation',
  'Reflector': 'Wait a Lunar Cycle'
};

/**
 * All 9 centers
 */
export const ALL_CENTERS: string[] = [
  'Head', 'Ajna', 'Throat', 'G Center', 'Ego', 'Solar Plexus', 'Sacral', 'Spleen', 'Root'
];

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

/**
 * Convert a planetary longitude to gate and line
 */
export function longitudeToGateLine(longitude: number): { gate: number; line: number } {
  const adjustment = 58.0;
  const adjustedLongitude = (longitude + adjustment) % 360;
  const percentage = adjustedLongitude / 360;

  const gateIndex = Math.floor(percentage * 64);
  const gate = GATES[gateIndex];

  // Line calculation: 384 = 64 gates * 6 lines
  const linePosition = (percentage * 384) % 6;
  const line = Math.floor(linePosition) + 1;

  return { gate, line };
}

/**
 * Get the opposite gate (180° across the wheel)
 */
export function oppositeGate(gate: number): number {
  const index = GATES.indexOf(gate);
  const oppositeIndex = (index + 32) % 64;
  return GATES[oppositeIndex];
}

/**
 * Calculate all activations from planetary positions
 */
export function calculateActivations(planets: PlanetPosition[]): Activation[] {
  const activations: Activation[] = [];

  for (const planet of planets) {
    const { gate, line } = longitudeToGateLine(planet.longitude);
    activations.push({ planet: planet.name, gate, line });

    // Add Earth (opposite of Sun) and South Node (opposite of North Node)
    if (planet.name === 'Sun') {
      const earthGate = oppositeGate(gate);
      const earthLine = line; // Same line as Sun
      activations.push({ planet: 'Earth', gate: earthGate, line: earthLine });
    } else if (planet.name === 'North Node') {
      const southNodeGate = oppositeGate(gate);
      const southNodeLine = line;
      activations.push({ planet: 'South Node', gate: southNodeGate, line: southNodeLine });
    }
  }

  return activations;
}

/**
 * Get all unique gates from activations, tracking their sources
 */
export function getAllGates(
  personalityActivations: Activation[],
  designActivations: Activation[]
): Map<number, { center: string; sources: string[] }> {
  const gates = new Map<number, { center: string; sources: string[] }>();

  for (const activation of personalityActivations) {
    const existing = gates.get(activation.gate);
    if (existing) {
      if (!existing.sources.includes('Personality')) {
        existing.sources.push('Personality');
      }
    } else {
      gates.set(activation.gate, {
        center: GATE_CENTERS[activation.gate],
        sources: ['Personality']
      });
    }
  }

  for (const activation of designActivations) {
    const existing = gates.get(activation.gate);
    if (existing) {
      if (!existing.sources.includes('Design')) {
        existing.sources.push('Design');
      }
    } else {
      gates.set(activation.gate, {
        center: GATE_CENTERS[activation.gate],
        sources: ['Design']
      });
    }
  }

  return gates;
}

/**
 * Determine which channels are active (both gates present)
 */
export function getActiveChannels(allGates: Map<number, { center: string; sources: string[] }>): Channel[] {
  const activeChannels: Channel[] = [];

  for (const channel of CHANNELS) {
    const [gate1, gate2] = channel.gates;
    if (allGates.has(gate1) && allGates.has(gate2)) {
      activeChannels.push(channel);
    }
  }

  return activeChannels;
}

/**
 * Determine center status: Defined, Undefined, or Open
 */
export function getCenterStatus(
  activeChannels: Channel[],
  allGates: Map<number, { center: string; sources: string[] }>
): { defined: string[]; undefined: string[]; open: string[] } {
  const definedCenters = new Set<string>();
  const centersWithGates = new Set<string>();

  // Centers are defined if they have at least one complete channel
  for (const channel of activeChannels) {
    definedCenters.add(channel.centers[0]);
    definedCenters.add(channel.centers[1]);
  }

  // Track which centers have any gates (for undefined vs open)
  for (const [, info] of allGates) {
    centersWithGates.add(info.center);
  }

  const defined: string[] = [];
  const undefined: string[] = [];
  const open: string[] = [];

  for (const center of ALL_CENTERS) {
    if (definedCenters.has(center)) {
      defined.push(center);
    } else if (centersWithGates.has(center)) {
      undefined.push(center);
    } else {
      open.push(center);
    }
  }

  return { defined, undefined, open };
}

/**
 * Check if there's a motor connected to Throat
 */
function hasMotorToThroat(activeChannels: Channel[], definedCenters: string[]): boolean {
  const motors = ['Sacral', 'Solar Plexus', 'Ego', 'Root'];

  // Build a graph of connected centers
  const connections = new Map<string, Set<string>>();
  for (const center of ALL_CENTERS) {
    connections.set(center, new Set());
  }

  for (const channel of activeChannels) {
    connections.get(channel.centers[0])!.add(channel.centers[1]);
    connections.get(channel.centers[1])!.add(channel.centers[0]);
  }

  // BFS from each motor to see if it reaches Throat
  for (const motor of motors) {
    if (!definedCenters.includes(motor)) continue;

    const visited = new Set<string>();
    const queue = [motor];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === 'Throat') return true;
      if (visited.has(current)) continue;
      visited.add(current);

      for (const neighbor of connections.get(current) || []) {
        if (!visited.has(neighbor)) {
          queue.push(neighbor);
        }
      }
    }
  }

  return false;
}

/**
 * Calculate Human Design Type
 */
export function calculateType(definedCenters: string[], activeChannels: Channel[]): string {
  const hasSacral = definedCenters.includes('Sacral');
  const motorToThroat = hasMotorToThroat(activeChannels, definedCenters);

  if (hasSacral) {
    return motorToThroat ? 'Manifesting Generator' : 'Generator';
  }

  if (motorToThroat) {
    return 'Manifestor';
  }

  if (definedCenters.length === 0) {
    return 'Reflector';
  }

  return 'Projector';
}

/**
 * Calculate Inner Authority
 */
export function calculateAuthority(definedCenters: string[], activeChannels: Channel[]): string {
  // Check in order of hierarchy
  if (definedCenters.includes('Solar Plexus')) {
    return 'Emotional (Solar Plexus)';
  }

  if (definedCenters.includes('Sacral')) {
    return 'Sacral';
  }

  if (definedCenters.includes('Spleen')) {
    return 'Splenic';
  }

  // Ego authority requires Ego connected to Throat or G Center
  if (definedCenters.includes('Ego')) {
    const egoToThroat = activeChannels.some(
      ch => ch.centers.includes('Ego') && ch.centers.includes('Throat')
    );
    const egoToG = activeChannels.some(
      ch => ch.centers.includes('Ego') && ch.centers.includes('G Center')
    );
    if (egoToThroat || egoToG) {
      return 'Ego';
    }
  }

  // Self-Projected: G Center connected to Throat
  if (definedCenters.includes('G Center')) {
    const gToThroat = activeChannels.some(
      ch => ch.centers.includes('G Center') && ch.centers.includes('Throat')
    );
    if (gToThroat) {
      return 'Self-Projected';
    }
  }

  // Mental/Environment authority (Head/Ajna defined, or just Ajna to Throat)
  if (definedCenters.includes('Ajna') || definedCenters.includes('Head')) {
    return 'Mental (Outer Authority)';
  }

  // Lunar authority for Reflectors
  return 'Lunar';
}

/**
 * Calculate Definition type (how centers are connected)
 */
export function calculateDefinition(activeChannels: Channel[], definedCenters: string[]): string {
  if (definedCenters.length === 0) {
    return 'None';
  }

  // Build connection groups using Union-Find approach
  const parent = new Map<string, string>();

  for (const center of definedCenters) {
    parent.set(center, center);
  }

  function find(x: string): string {
    if (parent.get(x) !== x) {
      parent.set(x, find(parent.get(x)!));
    }
    return parent.get(x)!;
  }

  function union(x: string, y: string): void {
    const px = find(x);
    const py = find(y);
    if (px !== py) {
      parent.set(px, py);
    }
  }

  // Connect centers through channels
  for (const channel of activeChannels) {
    const [c1, c2] = channel.centers;
    if (parent.has(c1) && parent.has(c2)) {
      union(c1, c2);
    }
  }

  // Count distinct groups
  const groups = new Set<string>();
  for (const center of definedCenters) {
    groups.add(find(center));
  }

  switch (groups.size) {
    case 1: return 'Single Definition';
    case 2: return 'Split Definition';
    case 3: return 'Triple Split Definition';
    case 4: return 'Quadruple Split Definition';
    default: return `${groups.size}-Split Definition`;
  }
}

/**
 * Calculate Profile from personality and design sun lines
 */
export function calculateProfile(personalitySunLine: number, designSunLine: number): string {
  return `${personalitySunLine}/${designSunLine}`;
}

/**
 * Get Incarnation Cross
 */
export function getIncarnationCross(
  personalitySunGate: number,
  personalityEarthGate: number,
  designSunGate: number,
  designEarthGate: number,
  personalitySunLine: number,
  designSunLine: number
): string {
  const crossName = INCARNATION_CROSSES[personalitySunGate] || 'Unknown';

  // Determine cross type based on lines
  let crossType: string;
  if (personalitySunLine < 4) {
    crossType = 'Right Angle Cross';
  } else if (personalitySunLine >= 5) {
    crossType = 'Left Angle Cross';
  } else {
    // Line 4 with specific design line combinations
    crossType = designSunLine < 4 ? 'Juxtaposition Cross' : 'Left Angle Cross';
  }

  return `${crossType} of ${crossName} (${personalitySunGate}/${personalityEarthGate} | ${designSunGate}/${designEarthGate})`;
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

export interface HumanDesign2TxtOptions {
  name?: string;
  location?: string;
}

/**
 * Main entry point: Convert Human Design API response to formatted text
 */
export function humandesign2txt(
  apiResponse: HumanDesignApiResponse,
  options: HumanDesign2TxtOptions = {}
): string {
  const { personality, design } = apiResponse;

  // Calculate activations
  const personalityActivations = calculateActivations(personality.planets);
  const designActivations = calculateActivations(design.planets);

  // Get all gates
  const allGates = getAllGates(personalityActivations, designActivations);

  // Get active channels
  const activeChannels = getActiveChannels(allGates);

  // Get center status
  const { defined, undefined: undefinedCenters, open } = getCenterStatus(activeChannels, allGates);

  // Calculate Type, Authority, Definition
  const type = calculateType(defined, activeChannels);
  const strategy = STRATEGY_BY_TYPE[type];
  const authority = calculateAuthority(defined, activeChannels);
  const definition = calculateDefinition(activeChannels, defined);

  // Calculate Profile
  const personalitySun = personalityActivations.find(a => a.planet === 'Sun')!;
  const designSun = designActivations.find(a => a.planet === 'Sun')!;
  const profile = calculateProfile(personalitySun.line, designSun.line);
  const profileName = PROFILE_NAMES[profile] || '';

  // Get Incarnation Cross
  const personalityEarth = personalityActivations.find(a => a.planet === 'Earth')!;
  const designEarth = designActivations.find(a => a.planet === 'Earth')!;
  const incarnationCross = getIncarnationCross(
    personalitySun.gate,
    personalityEarth.gate,
    designSun.gate,
    designEarth.gate,
    personalitySun.line,
    designSun.line
  );

  // Build the chart object
  const chart: HumanDesignChart = {
    name: options.name || 'Chart',
    location: options.location || `${personality.location.latitude}, ${personality.location.longitude}`,
    date: personality.date,
    time: personality.time,
    type,
    strategy,
    authority,
    definition,
    profile,
    profileName,
    incarnationCross,
    definedCenters: defined,
    undefinedCenters,
    openCenters: open,
    activeChannels,
    allGates,
    personalityActivations,
    designActivations
  };

  // Format to text
  return formatHumanDesignToText(chart);
}

// ============================================================================
// TEXT FORMATTER
// ============================================================================

function formatHumanDesignToText(chart: HumanDesignChart): string {
  const lines: string[] = [];

  // Metadata
  lines.push('[METADATA]');
  lines.push('chart_type: human_design');
  lines.push('');

  // Chart header
  lines.push(`[CHART: ${chart.name}]`);
  lines.push(`[BIRTHDATA] ${chart.location} | ${chart.date} | ${chart.time}`);
  lines.push('');

  // Type section
  lines.push('[TYPE]');
  lines.push(`Type: ${chart.type}`);
  lines.push(`Strategy: ${chart.strategy}`);
  lines.push(`Authority: ${chart.authority}`);
  lines.push(`Definition: ${chart.definition}`);
  lines.push(`Profile: ${chart.profile}${chart.profileName ? ` (${chart.profileName})` : ''}`);
  lines.push(`Incarnation Cross: ${chart.incarnationCross}`);
  lines.push('');

  // Centers
  lines.push('[CENTERS]');
  if (chart.definedCenters.length > 0) {
    lines.push(`Defined: ${chart.definedCenters.join(', ')}`);
  }
  if (chart.undefinedCenters.length > 0) {
    lines.push(`Undefined: ${chart.undefinedCenters.join(', ')}`);
  }
  if (chart.openCenters.length > 0) {
    lines.push(`Open: ${chart.openCenters.join(', ')}`);
  }
  lines.push('');

  // Channels
  lines.push('[CHANNELS]');
  if (chart.activeChannels.length > 0) {
    for (const channel of chart.activeChannels) {
      lines.push(`${channel.gates[0]}-${channel.gates[1]} (${channel.name}): ${channel.centers[0]} ↔ ${channel.centers[1]}`);
    }
  } else {
    lines.push('None');
  }
  lines.push('');

  // Gates
  lines.push('[GATES]');
  const sortedGates = Array.from(chart.allGates.entries()).sort((a, b) => a[0] - b[0]);
  for (const [gate, info] of sortedGates) {
    const sourcesLabel = info.sources.length === 2 ? 'Both' : info.sources[0];
    lines.push(`${gate}: ${GATE_NAMES[gate]} | ${info.center} (${sourcesLabel})`);
  }
  lines.push('');

  // Personality Activations
  lines.push('[PERSONALITY ACTIVATIONS]');
  const pSun = chart.personalityActivations.find(a => a.planet === 'Sun')!;
  const pEarth = chart.personalityActivations.find(a => a.planet === 'Earth')!;
  const pMoon = chart.personalityActivations.find(a => a.planet === 'Moon')!;
  const pNorth = chart.personalityActivations.find(a => a.planet === 'North Node')!;
  const pSouth = chart.personalityActivations.find(a => a.planet === 'South Node')!;
  const pMercury = chart.personalityActivations.find(a => a.planet === 'Mercury')!;
  const pVenus = chart.personalityActivations.find(a => a.planet === 'Venus')!;
  const pMars = chart.personalityActivations.find(a => a.planet === 'Mars')!;
  const pJupiter = chart.personalityActivations.find(a => a.planet === 'Jupiter')!;
  const pSaturn = chart.personalityActivations.find(a => a.planet === 'Saturn')!;
  const pUranus = chart.personalityActivations.find(a => a.planet === 'Uranus')!;
  const pNeptune = chart.personalityActivations.find(a => a.planet === 'Neptune')!;
  const pPluto = chart.personalityActivations.find(a => a.planet === 'Pluto')!;

  lines.push(`Sun: ${pSun.gate}.${pSun.line}    Earth: ${pEarth.gate}.${pEarth.line}`);
  lines.push(`Moon: ${pMoon.gate}.${pMoon.line}`);
  lines.push(`North Node: ${pNorth.gate}.${pNorth.line}    South Node: ${pSouth.gate}.${pSouth.line}`);
  lines.push(`Mercury: ${pMercury.gate}.${pMercury.line}    Venus: ${pVenus.gate}.${pVenus.line}    Mars: ${pMars.gate}.${pMars.line}`);
  lines.push(`Jupiter: ${pJupiter.gate}.${pJupiter.line}    Saturn: ${pSaturn.gate}.${pSaturn.line}`);
  lines.push(`Uranus: ${pUranus.gate}.${pUranus.line}    Neptune: ${pNeptune.gate}.${pNeptune.line}    Pluto: ${pPluto.gate}.${pPluto.line}`);
  lines.push('');

  // Design Activations
  lines.push('[DESIGN ACTIVATIONS]');
  const dSun = chart.designActivations.find(a => a.planet === 'Sun')!;
  const dEarth = chart.designActivations.find(a => a.planet === 'Earth')!;
  const dMoon = chart.designActivations.find(a => a.planet === 'Moon')!;
  const dNorth = chart.designActivations.find(a => a.planet === 'North Node')!;
  const dSouth = chart.designActivations.find(a => a.planet === 'South Node')!;
  const dMercury = chart.designActivations.find(a => a.planet === 'Mercury')!;
  const dVenus = chart.designActivations.find(a => a.planet === 'Venus')!;
  const dMars = chart.designActivations.find(a => a.planet === 'Mars')!;
  const dJupiter = chart.designActivations.find(a => a.planet === 'Jupiter')!;
  const dSaturn = chart.designActivations.find(a => a.planet === 'Saturn')!;
  const dUranus = chart.designActivations.find(a => a.planet === 'Uranus')!;
  const dNeptune = chart.designActivations.find(a => a.planet === 'Neptune')!;
  const dPluto = chart.designActivations.find(a => a.planet === 'Pluto')!;

  lines.push(`Sun: ${dSun.gate}.${dSun.line}    Earth: ${dEarth.gate}.${dEarth.line}`);
  lines.push(`Moon: ${dMoon.gate}.${dMoon.line}`);
  lines.push(`North Node: ${dNorth.gate}.${dNorth.line}    South Node: ${dSouth.gate}.${dSouth.line}`);
  lines.push(`Mercury: ${dMercury.gate}.${dMercury.line}    Venus: ${dVenus.gate}.${dVenus.line}    Mars: ${dMars.gate}.${dMars.line}`);
  lines.push(`Jupiter: ${dJupiter.gate}.${dJupiter.line}    Saturn: ${dSaturn.gate}.${dSaturn.line}`);
  lines.push(`Uranus: ${dUranus.gate}.${dUranus.line}    Neptune: ${dNeptune.gate}.${dNeptune.line}    Pluto: ${dPluto.gate}.${dPluto.line}`);

  return lines.join('\n');
}

export default humandesign2txt;
