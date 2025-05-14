/**
 * Types for TFT team composition data
 */

export interface TeamComposition {
  id: string;
  name: string;
  type: string;
  stats: CompositionStats;
  playstyle: CompositionPlaystyle;
  units: ChampionInfo[];
  traits: TraitInfo[];
  variants?: VariantInfo[];
  lastUpdated: string;
  teamBuilderUrl?: string;
}

export interface CompositionStats {
  playRate: number;
  averagePlacement: number;
  top4Percentage: number;
  winPercentage: number;
}

export interface CompositionPlaystyle {
  type: string; // e.g., "Level 6 Reroll", "Fast Level 8"
  description?: string; // e.g., "Consistent", "High Win %"
}

export interface ChampionInfo {
  name: string;
  cost?: number;
  starLevel: number; // 1, 2, or 3
  isCore: boolean;
  items: ItemInfo[];
  playRate?: number;
  averagePlacement?: number;
}

export interface ItemInfo {
  name: string;
  id?: string;
  playRate?: number;
  averagePlacement?: number;
  placementDelta?: number; // Difference from champion's average placement
}

export interface TraitInfo {
  name: string;
  activeLevel: number;
  totalLevel: number;
  playRate?: number;
  averagePlacement?: number;
}

export interface VariantInfo {
  name: string;
  description?: string;
  units: ChampionInfo[];
  stats?: CompositionStats;
}

export interface ScraperConfig {
  baseUrl: string;
  patchVersion?: string;
  rankFilter?: string;
  maxCompositions?: number;
  requestDelay: number; // in milliseconds
  maxRetries: number;
  userAgent: string;
}

export interface ScraperResult {
  compositions: TeamComposition[];
  timestamp: string;
  patchVersion: string;
  success: boolean;
  errorMessage?: string;
}
