// Game state types
export interface GameState {
  stage: string;
  playerLevel: number;
  playerHealth: number;
  gold: number;
  streak: number;
  units: Unit[];
  bench: Unit[];
  items: Item[];
  augments: Augment[];
  traits: Trait[];
}

// Unit (champion) type
export interface Unit {
  id: string;
  name: string;
  cost: number;
  tier: number; // 1, 2, or 3 stars
  position?: { row: number; col: number }; // Position on board
  items: Item[];
  traits: string[];
}

// Item type
export interface Item {
  id: string;
  name: string;
  type: string; // basic, combined, special, ornn
  components?: string[]; // For combined items
  stats?: Record<string, number>; // Item stats
}

// Augment type
export interface Augment {
  id: string;
  name: string;
  description: string;
  tier: string; // silver, gold, prismatic
  synergies?: string[]; // Traits or champions this augment synergizes with
}

// Trait type
export interface Trait {
  id: string;
  name: string;
  count: number;
  active: boolean;
  style: string; // bronze, silver, gold, etc.
  effects?: TraitEffect[];
}

// Trait effect type
export interface TraitEffect {
  minUnits: number;
  description: string;
}

// Team composition type
export interface TeamComp {
  id: string;
  name: string;
  tier: string; // S, A, B, C, etc.
  units: RecommendedUnit[];
  traits: RecommendedTrait[];
  augments: RecommendedAugment[];
  items: RecommendedItem[];
  placement: number; // Average placement
  winRate: number;
  playRate: number;
  difficulty: number; // 1-5
}

// Recommended unit type
export interface RecommendedUnit {
  id: string;
  name: string;
  priority: number; // 1-5, with 1 being highest priority
  items: RecommendedItem[];
  position?: { row: number; col: number }; // Recommended position
}

// Recommended trait type
export interface RecommendedTrait {
  id: string;
  name: string;
  count: number;
  style: string; // bronze, silver, gold, etc.
}

// Recommended augment type
export interface RecommendedAugment {
  id: string;
  name: string;
  tier: string; // silver, gold, prismatic
  priority: number; // 1-5, with 1 being highest priority
  description?: string; // Augment description
  synergies?: string[]; // Traits or champions this augment synergizes with
}

// Recommended item type
export interface RecommendedItem {
  id: string;
  name: string;
  priority: number; // 1-5, with 1 being highest priority
  champion?: string; // Champion to put the item on
}

// Application settings type
export interface Settings {
  overlayOpacity: number;
  overlayPosition: { x: number; y: number };
  overlaySize: { width: number; height: number };
  captureInterval: number;
  dataRefreshInterval: number;
  hotkeys: {
    toggleOverlay: string;
    captureScreen: string;
  };
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
