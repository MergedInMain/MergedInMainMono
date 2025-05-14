/**
 * Data Fetching Service
 * 
 * Provides functionality for fetching data from external APIs.
 * Handles API client management, error handling, and data aggregation.
 */

import { TeamComp, Item, Augment } from '../../shared/types';
import { MetaTftApi, TacticsToolsApi, ApiResponse } from '../../shared/api-types';
import metaTftClient from './api-clients/meta-tft-client';
import tacticsToolsClient from './api-clients/tactics-tools-client';

/**
 * Data source options
 */
export enum DataSource {
  META_TFT = 'metatft',
  TACTICS_TOOLS = 'tactics',
  COMBINED = 'combined'
}

/**
 * Fetch options
 */
export interface FetchOptions {
  source?: DataSource;
  patch?: string;
  forceRefresh?: boolean;
}

/**
 * Default fetch options
 */
const DEFAULT_OPTIONS: FetchOptions = {
  source: DataSource.COMBINED,
  forceRefresh: false
};

/**
 * Fetch result
 */
export interface FetchResult<T> {
  data: T[];
  source: DataSource;
  timestamp: number;
  patch?: string;
  error?: string;
}

/**
 * Service for fetching data from external APIs
 */
class DataFetchingService {
  private lastFetchTimestamp: Record<string, number> = {};
  private currentPatch?: string;

  /**
   * Fetch team compositions from external APIs
   * @param options Fetch options
   * @returns Fetch result with team compositions
   */
  public async fetchTeamComps(options: FetchOptions = {}): Promise<FetchResult<TeamComp>> {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    const { source, patch, forceRefresh } = mergedOptions;
    
    // Check if we need to fetch new data
    const cacheKey = `teamcomps:${source}:${patch || 'latest'}`;
    if (!forceRefresh && this.isCacheValid(cacheKey)) {
      return {
        data: [],
        source: source || DataSource.COMBINED,
        timestamp: this.lastFetchTimestamp[cacheKey] || Date.now(),
        patch: patch || this.currentPatch,
        error: 'Using cached data'
      };
    }
    
    try {
      let teamComps: TeamComp[] = [];
      let fetchPatch = patch;
      let fetchSource = source;
      let error: string | undefined;
      
      // Fetch from the appropriate source
      switch (source) {
        case DataSource.META_TFT:
          const metaResult = await this.fetchFromMetaTft(fetchPatch);
          teamComps = metaResult.teamComps;
          fetchPatch = metaResult.patch;
          error = metaResult.error;
          break;
          
        case DataSource.TACTICS_TOOLS:
          const tacticsResult = await this.fetchFromTacticsTools(fetchPatch);
          teamComps = tacticsResult.teamComps;
          fetchPatch = tacticsResult.patch;
          error = tacticsResult.error;
          break;
          
        case DataSource.COMBINED:
        default:
          const combinedResult = await this.fetchCombined(fetchPatch);
          teamComps = combinedResult.teamComps;
          fetchPatch = combinedResult.patch;
          fetchSource = combinedResult.source;
          error = combinedResult.error;
          break;
      }
      
      // Update cache timestamp
      this.lastFetchTimestamp[cacheKey] = Date.now();
      
      // Update current patch if not specified
      if (!patch && fetchPatch) {
        this.currentPatch = fetchPatch;
      }
      
      return {
        data: teamComps,
        source: fetchSource || DataSource.COMBINED,
        timestamp: this.lastFetchTimestamp[cacheKey],
        patch: fetchPatch,
        error
      };
    } catch (error) {
      console.error('Error fetching team compositions:', error);
      
      return {
        data: [],
        source: source || DataSource.COMBINED,
        timestamp: Date.now(),
        patch: patch || this.currentPatch,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Fetch items from external APIs
   * @param options Fetch options
   * @returns Fetch result with items
   */
  public async fetchItems(options: FetchOptions = {}): Promise<FetchResult<Item>> {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    const { source, patch, forceRefresh } = mergedOptions;
    
    // Check if we need to fetch new data
    const cacheKey = `items:${source}:${patch || 'latest'}`;
    if (!forceRefresh && this.isCacheValid(cacheKey)) {
      return {
        data: [],
        source: source || DataSource.COMBINED,
        timestamp: this.lastFetchTimestamp[cacheKey] || Date.now(),
        patch: patch || this.currentPatch,
        error: 'Using cached data'
      };
    }
    
    try {
      // TODO: Implement item fetching from external APIs
      // This is a placeholder implementation
      
      // Update cache timestamp
      this.lastFetchTimestamp[cacheKey] = Date.now();
      
      return {
        data: [],
        source: source || DataSource.COMBINED,
        timestamp: this.lastFetchTimestamp[cacheKey],
        patch: patch || this.currentPatch
      };
    } catch (error) {
      console.error('Error fetching items:', error);
      
      return {
        data: [],
        source: source || DataSource.COMBINED,
        timestamp: Date.now(),
        patch: patch || this.currentPatch,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Fetch augments from external APIs
   * @param options Fetch options
   * @returns Fetch result with augments
   */
  public async fetchAugments(options: FetchOptions = {}): Promise<FetchResult<Augment>> {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    const { source, patch, forceRefresh } = mergedOptions;
    
    // Check if we need to fetch new data
    const cacheKey = `augments:${source}:${patch || 'latest'}`;
    if (!forceRefresh && this.isCacheValid(cacheKey)) {
      return {
        data: [],
        source: source || DataSource.COMBINED,
        timestamp: this.lastFetchTimestamp[cacheKey] || Date.now(),
        patch: patch || this.currentPatch,
        error: 'Using cached data'
      };
    }
    
    try {
      // TODO: Implement augment fetching from external APIs
      // This is a placeholder implementation
      
      // Update cache timestamp
      this.lastFetchTimestamp[cacheKey] = Date.now();
      
      return {
        data: [],
        source: source || DataSource.COMBINED,
        timestamp: this.lastFetchTimestamp[cacheKey],
        patch: patch || this.currentPatch
      };
    } catch (error) {
      console.error('Error fetching augments:', error);
      
      return {
        data: [],
        source: source || DataSource.COMBINED,
        timestamp: Date.now(),
        patch: patch || this.currentPatch,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Check if the cache is still valid
   * @param cacheKey Cache key
   * @returns True if cache is valid, false otherwise
   */
  private isCacheValid(cacheKey: string): boolean {
    const lastFetch = this.lastFetchTimestamp[cacheKey];
    if (!lastFetch) return false;
    
    const now = Date.now();
    const cacheAge = now - lastFetch;
    
    // Cache is valid for 1 hour
    return cacheAge < 60 * 60 * 1000;
  }

  /**
   * Fetch team compositions from Meta TFT
   * @param patch Optional patch version
   * @returns Team compositions and patch
   */
  private async fetchFromMetaTft(patch?: string): Promise<{
    teamComps: TeamComp[];
    patch?: string;
    error?: string;
  }> {
    try {
      const response = await metaTftClient.getTeamComps(patch);
      
      if (!response.success || !response.data) {
        return {
          teamComps: [],
          error: response.error || 'Failed to fetch from Meta TFT'
        };
      }
      
      // Convert Meta TFT team comps to our format
      const teamComps = this.convertMetaTftTeamComps(response.data);
      
      return {
        teamComps,
        patch: response.data.patch
      };
    } catch (error) {
      console.error('Error fetching from Meta TFT:', error);
      
      return {
        teamComps: [],
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Fetch team compositions from Tactics.Tools
   * @param patch Optional patch version
   * @returns Team compositions and patch
   */
  private async fetchFromTacticsTools(patch?: string): Promise<{
    teamComps: TeamComp[];
    patch?: string;
    error?: string;
  }> {
    try {
      const response = await tacticsToolsClient.getTeamComps(patch);
      
      if (!response.success || !response.data) {
        return {
          teamComps: [],
          error: response.error || 'Failed to fetch from Tactics.Tools'
        };
      }
      
      // Convert Tactics.Tools team comps to our format
      const teamComps = this.convertTacticsToolsTeamComps(response.data);
      
      return {
        teamComps,
        patch: response.data.patch
      };
    } catch (error) {
      console.error('Error fetching from Tactics.Tools:', error);
      
      return {
        teamComps: [],
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Fetch team compositions from both sources and combine them
   * @param patch Optional patch version
   * @returns Combined team compositions and patch
   */
  private async fetchCombined(patch?: string): Promise<{
    teamComps: TeamComp[];
    patch?: string;
    source: DataSource;
    error?: string;
  }> {
    try {
      // Try Meta TFT first
      const metaResult = await this.fetchFromMetaTft(patch);
      
      // If Meta TFT succeeded, return the result
      if (metaResult.teamComps.length > 0) {
        return {
          teamComps: metaResult.teamComps,
          patch: metaResult.patch,
          source: DataSource.META_TFT
        };
      }
      
      // Otherwise, try Tactics.Tools
      const tacticsResult = await this.fetchFromTacticsTools(patch);
      
      return {
        teamComps: tacticsResult.teamComps,
        patch: tacticsResult.patch,
        source: DataSource.TACTICS_TOOLS,
        error: metaResult.error
      };
    } catch (error) {
      console.error('Error fetching combined data:', error);
      
      return {
        teamComps: [],
        source: DataSource.COMBINED,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Convert Meta TFT team compositions to our format
   * @param response Meta TFT API response
   * @returns Converted team compositions
   */
  private convertMetaTftTeamComps(response: MetaTftApi.TeamCompsResponse): TeamComp[] {
    if (!response.comps) return [];
    
    return response.comps.map(comp => ({
      id: comp.id,
      name: comp.name,
      units: comp.units.map(unit => ({
        id: unit.id,
        name: unit.name,
        cost: unit.cost,
        items: unit.items
      })),
      traits: comp.traits.map(trait => trait.name),
      items: comp.items.flatMap(item => item.items.map(itemId => ({
        id: itemId,
        name: itemId // We'll need to look up the actual name
      }))),
      avgPlacement: comp.avgPlacement,
      playRate: comp.playRate,
      winRate: comp.winRate
    }));
  }

  /**
   * Convert Tactics.Tools team compositions to our format
   * @param response Tactics.Tools API response
   * @returns Converted team compositions
   */
  private convertTacticsToolsTeamComps(response: TacticsToolsApi.TeamCompsResponse): TeamComp[] {
    if (!response.comps) return [];
    
    return response.comps.map(comp => ({
      id: comp.id,
      name: comp.name,
      units: comp.champions.map(champion => ({
        id: champion.id,
        name: champion.name,
        cost: champion.cost,
        items: champion.items.map(item => item.id)
      })),
      traits: comp.traits.map(trait => trait.name),
      items: comp.champions.flatMap(champion => 
        champion.items.map(item => ({
          id: item.id,
          name: item.name
        }))
      ),
      avgPlacement: comp.avgPlacement,
      playRate: comp.frequency,
      winRate: comp.winRate
    }));
  }
}

// Export a singleton instance
export default new DataFetchingService();
