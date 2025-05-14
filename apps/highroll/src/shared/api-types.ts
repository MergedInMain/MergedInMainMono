/**
 * Type definitions for external API responses
 */

/**
 * Meta TFT API Types
 */
export namespace MetaTftApi {
  /**
   * Team composition from Meta TFT
   */
  export interface TeamComp {
    id: string;
    name: string;
    tier: string;
    avgPlacement: number;
    playRate: number;
    winRate: number;
    units: Unit[];
    traits: Trait[];
    augments: Augment[];
    items: ItemRecommendation[];
    patch: string;
  }

  /**
   * Unit in a team composition
   */
  export interface Unit {
    id: string;
    name: string;
    cost: number;
    items: string[];
    isCore: boolean;
  }

  /**
   * Trait in a team composition
   */
  export interface Trait {
    id: string;
    name: string;
    count: number;
    style: number;
  }

  /**
   * Augment in a team composition
   */
  export interface Augment {
    id: string;
    name: string;
    avgPlacement: number;
    frequency: number;
    tier: number | string;
  }

  /**
   * Item recommendation for a unit
   */
  export interface ItemRecommendation {
    unitId: string;
    items: string[];
  }

  /**
   * Meta TFT API response for team compositions
   */
  export interface TeamCompsResponse {
    comps: TeamComp[];
    patch: string;
    updatedAt: string;
  }

  /**
   * Meta TFT API response for augments
   */
  export interface AugmentsResponse {
    augments: Augment[];
    patch: string;
    updatedAt: string;
  }
}

/**
 * Tactics.Tools API Types
 */
export namespace TacticsToolsApi {
  /**
   * Team composition from Tactics.Tools
   */
  export interface TeamComp {
    id: string;
    name: string;
    tier: string;
    avgPlacement: number;
    frequency: number;
    winRate: number;
    top4Rate: number;
    champions: Champion[];
    traits: Trait[];
    augments: Augment[];
    patch: string;
  }

  /**
   * Champion in a team composition
   */
  export interface Champion {
    id: string;
    name: string;
    cost: number;
    items: Item[];
    isPrimary: boolean;
  }

  /**
   * Item for a champion
   */
  export interface Item {
    id: string;
    name: string;
    frequency: number;
  }

  /**
   * Trait in a team composition
   */
  export interface Trait {
    id: string;
    name: string;
    count: number;
    style: number;
    frequency: number;
  }

  /**
   * Augment in a team composition
   */
  export interface Augment {
    id: string;
    name: string;
    avgPlacement: number;
    frequency: number;
    tier: number | string;
  }

  /**
   * Tactics.Tools API response for team compositions
   */
  export interface TeamCompsResponse {
    comps: TeamComp[];
    patch: string;
    updatedAt: string;
  }

  /**
   * Tactics.Tools API response for augments
   */
  export interface AugmentsResponse {
    augments: Augment[];
    patch: string;
    updatedAt: string;
  }
}

/**
 * Common API Types
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
  success: boolean;
}

/**
 * API Error
 */
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}
