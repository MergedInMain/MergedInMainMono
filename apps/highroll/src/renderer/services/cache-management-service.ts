/**
 * Cache Management Service
 * 
 * Provides functionality for managing the local data cache.
 * Handles storing and retrieving data, cache invalidation, and offline support.
 */

import { 
  TeamCompModel, 
  ItemModel, 
  AugmentModel, 
  ChampionModel,
  TraitModel,
  DataSource,
  DataVersion
} from '../../shared/data-models';
import { TeamComp, Item, Augment, Champion } from '../../shared/types';
import { REFRESH_INTERVALS } from '../../shared/constants';
import databaseService from './database-service';

/**
 * Cache options
 */
export interface CacheOptions {
  source?: DataSource;
  patch?: string;
  forceRefresh?: boolean;
  maxAge?: number;
}

/**
 * Default cache options
 */
const DEFAULT_OPTIONS: CacheOptions = {
  source: DataSource.COMBINED,
  forceRefresh: false,
  maxAge: REFRESH_INTERVALS.DAILY
};

/**
 * Cache status
 */
export interface CacheStatus {
  isAvailable: boolean;
  lastUpdated?: number;
  patch?: string;
  version?: string;
  dataTypes: {
    teamComps: boolean;
    items: boolean;
    augments: boolean;
    champions: boolean;
    traits: boolean;
  };
}

/**
 * Cache management service
 */
class CacheManagementService {
  private isInitialized: boolean = false;

  /**
   * Initialize the cache management service
   * @returns Promise that resolves when the service is initialized
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize the database service
      await databaseService.initialize();
      this.isInitialized = true;
      console.log('Cache management service initialized successfully');
    } catch (error) {
      console.error('Error initializing cache management service:', error);
      throw error;
    }
  }

  /**
   * Store team compositions in the cache
   * @param model Team composition model
   * @returns Promise that resolves when the data is stored
   */
  public async storeTeamComps(model: TeamCompModel): Promise<void> {
    await this.ensureInitialized();
    await databaseService.saveTeamComps(model);
  }

  /**
   * Get team compositions from the cache
   * @param options Cache options
   * @returns Promise that resolves with the team composition model
   */
  public async getTeamComps(options: CacheOptions = {}): Promise<TeamCompModel | null> {
    await this.ensureInitialized();
    
    const { source, patch } = { ...DEFAULT_OPTIONS, ...options };
    
    return databaseService.getTeamComps(source || DataSource.COMBINED, patch);
  }

  /**
   * Store items in the cache
   * @param model Item model
   * @returns Promise that resolves when the data is stored
   */
  public async storeItems(model: ItemModel): Promise<void> {
    await this.ensureInitialized();
    await databaseService.saveItems(model);
  }

  /**
   * Get items from the cache
   * @param options Cache options
   * @returns Promise that resolves with the item model
   */
  public async getItems(options: CacheOptions = {}): Promise<ItemModel | null> {
    await this.ensureInitialized();
    
    const { source, patch } = { ...DEFAULT_OPTIONS, ...options };
    
    return databaseService.getItems(source || DataSource.COMBINED, patch);
  }

  /**
   * Store augments in the cache
   * @param model Augment model
   * @returns Promise that resolves when the data is stored
   */
  public async storeAugments(model: AugmentModel): Promise<void> {
    await this.ensureInitialized();
    await databaseService.saveAugments(model);
  }

  /**
   * Get augments from the cache
   * @param options Cache options
   * @returns Promise that resolves with the augment model
   */
  public async getAugments(options: CacheOptions = {}): Promise<AugmentModel | null> {
    await this.ensureInitialized();
    
    const { source, patch } = { ...DEFAULT_OPTIONS, ...options };
    
    return databaseService.getAugments(source || DataSource.COMBINED, patch);
  }

  /**
   * Check if cache is valid
   * @param options Cache options
   * @returns Promise that resolves with a boolean indicating if the cache is valid
   */
  public async isCacheValid(options: CacheOptions = {}): Promise<boolean> {
    await this.ensureInitialized();
    
    const { source, patch, maxAge } = { ...DEFAULT_OPTIONS, ...options };
    
    // Get version information
    const versionInfo = await databaseService.getVersionInfo(patch);
    
    if (!versionInfo) {
      return false;
    }
    
    // Check if cache is too old
    if (maxAge) {
      const now = Date.now();
      const cacheAge = now - versionInfo.timestamp;
      
      if (cacheAge > maxAge) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Get cache status
   * @param patch Patch version
   * @returns Promise that resolves with the cache status
   */
  public async getCacheStatus(patch?: string): Promise<CacheStatus> {
    await this.ensureInitialized();
    
    // Get version information
    const versionInfo = await databaseService.getVersionInfo(patch);
    
    if (!versionInfo) {
      return {
        isAvailable: false,
        dataTypes: {
          teamComps: false,
          items: false,
          augments: false,
          champions: false,
          traits: false
        }
      };
    }
    
    return {
      isAvailable: true,
      lastUpdated: versionInfo.timestamp,
      patch: versionInfo.patch,
      version: versionInfo.version,
      dataTypes: {
        teamComps: versionInfo.models.teamComps || false,
        items: versionInfo.models.items || false,
        augments: versionInfo.models.augments || false,
        champions: versionInfo.models.champions || false,
        traits: versionInfo.models.traits || false
      }
    };
  }

  /**
   * Clear all cached data
   * @returns Promise that resolves when the cache is cleared
   */
  public async clearCache(): Promise<void> {
    await this.ensureInitialized();
    await databaseService.clearAllData();
  }

  /**
   * Clear cached data for a specific patch
   * @param patch Patch version
   * @returns Promise that resolves when the cache is cleared
   */
  public async clearPatchCache(patch: string): Promise<void> {
    await this.ensureInitialized();
    await databaseService.clearPatchData(patch);
  }

  /**
   * Ensure the service is initialized
   * @returns Promise that resolves when the service is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * Get all available patches
   * @returns Promise that resolves with an array of available patches
   */
  public async getAvailablePatches(): Promise<string[]> {
    await this.ensureInitialized();
    
    // TODO: Implement this method
    // This is a placeholder implementation
    return [];
  }

  /**
   * Check if data is available for offline use
   * @param patch Patch version
   * @returns Promise that resolves with a boolean indicating if data is available
   */
  public async isOfflineDataAvailable(patch?: string): Promise<boolean> {
    await this.ensureInitialized();
    
    if (patch) {
      return databaseService.isDataAvailable(patch);
    }
    
    // Check if any data is available
    const status = await this.getCacheStatus();
    return status.isAvailable;
  }

  /**
   * Get the latest cached patch
   * @returns Promise that resolves with the latest patch
   */
  public async getLatestCachedPatch(): Promise<string | null> {
    await this.ensureInitialized();
    
    const status = await this.getCacheStatus();
    return status.patch || null;
  }

  /**
   * Get cache size information
   * @returns Promise that resolves with the cache size information
   */
  public async getCacheSize(): Promise<{ totalSize: number; itemCount: number }> {
    await this.ensureInitialized();
    
    // TODO: Implement this method
    // This is a placeholder implementation
    return {
      totalSize: 0,
      itemCount: 0
    };
  }
}

// Export a singleton instance
export default new CacheManagementService();
