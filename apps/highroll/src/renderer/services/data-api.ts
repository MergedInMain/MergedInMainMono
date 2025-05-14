/**
 * Data API Service
 *
 * Provides a unified interface for fetching and caching data from external APIs.
 * Handles data transformation, validation, and caching.
 */

import { TeamComp, Item, Augment } from '../../shared/types';
import { REFRESH_INTERVALS } from '../../shared/constants';
import dataFetchingService, { DataSource, FetchOptions } from './data-fetching-service';
import dataTransformationService from './data-transformation-service';
import cacheManagementService, { CacheOptions } from './cache-management-service';
import {
  TransformationOptions,
  TeamCompModel,
  ItemModel,
  AugmentModel
} from '../../shared/data-models';

/**
 * Service for fetching and caching data from external APIs
 */
class DataApiService {
  private lastRefresh = 0;
  private cachedTeamComps: TeamComp[] = [];
  private cachedItems: Item[] = [];
  private cachedAugments: Augment[] = [];
  private currentPatch?: string;
  private dataSource: DataSource = DataSource.COMBINED;
  private isInitialized = false;

  /**
   * Initialize the data API service
   * @returns Promise that resolves when the service is initialized
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize the cache management service
      await cacheManagementService.initialize();

      // Get the latest cached patch
      const latestPatch = await cacheManagementService.getLatestCachedPatch();
      if (latestPatch) {
        this.currentPatch = latestPatch;
      }

      this.isInitialized = true;
      console.log('Data API service initialized successfully');
    } catch (error) {
      console.error('Error initializing data API service:', error);
      throw error;
    }
  }

  /**
   * Set the data source
   * @param source Data source
   */
  public setDataSource(source: DataSource): void {
    this.dataSource = source;
  }

  /**
   * Set the current patch
   * @param patch Patch version
   */
  public setCurrentPatch(patch: string): void {
    this.currentPatch = patch;
  }

  /**
   * Get the current patch
   * @returns Current patch version
   */
  public getCurrentPatch(): string | undefined {
    return this.currentPatch;
  }

  /**
   * Fetch team compositions from external APIs or cache
   * @param options Fetch options
   * @param transformOptions Transformation options
   * @returns Array of team compositions
   */
  public async getTeamComps(
    options?: Partial<FetchOptions>,
    transformOptions?: Partial<TransformationOptions>
  ): Promise<TeamComp[]> {
    await this.ensureInitialized();

    const fetchOptions: FetchOptions = {
      source: options?.source || this.dataSource,
      patch: options?.patch || this.currentPatch,
      forceRefresh: options?.forceRefresh
    };

    // Check if we can use cached data
    if (!fetchOptions.forceRefresh) {
      const cacheOptions: CacheOptions = {
        source: fetchOptions.source,
        patch: fetchOptions.patch,
        maxAge: REFRESH_INTERVALS.DAILY
      };

      const isCacheValid = await cacheManagementService.isCacheValid(cacheOptions);

      if (isCacheValid) {
        const cachedData = await cacheManagementService.getTeamComps(cacheOptions);

        if (cachedData) {
          this.cachedTeamComps = cachedData.data;
          this.lastRefresh = cachedData.metadata.timestamp;

          if (!this.currentPatch && cachedData.metadata.patch) {
            this.currentPatch = cachedData.metadata.patch;
          }

          return this.cachedTeamComps;
        }
      }
    }

    try {
      // Fetch team compositions from the data fetching service
      const result = await dataFetchingService.fetchTeamComps(fetchOptions);

      // Update current patch if not specified
      if (!this.currentPatch && result.patch) {
        this.currentPatch = result.patch;
      }

      // Transform the data based on the source
      let transformedModel: TeamCompModel | null = null;

      if (result.data.length > 0) {
        const mergedTransformOptions = {
          source: result.source,
          ...transformOptions
        };

        // Apply appropriate transformation based on data source
        if (result.source === DataSource.META_TFT && 'comps' in result.data[0]) {
          // Transform Meta TFT data
          const metaTftData = {
            comps: result.data,
            patch: result.patch || '',
            updatedAt: new Date(result.timestamp).toISOString()
          };
          transformedModel = dataTransformationService.transformMetaTftTeamComps(
            metaTftData,
            mergedTransformOptions
          );
        } else if (result.source === DataSource.TACTICS_TOOLS && 'champions' in result.data[0]) {
          // Transform Tactics.Tools data
          const tacticsToolsData = {
            comps: result.data,
            patch: result.patch || '',
            updatedAt: new Date(result.timestamp).toISOString()
          };
          transformedModel = dataTransformationService.transformTacticsToolsTeamComps(
            tacticsToolsData,
            mergedTransformOptions
          );
        } else {
          // Data is already in the correct format
          transformedModel = {
            data: result.data,
            metadata: {
              source: result.source,
              timestamp: result.timestamp,
              patch: result.patch,
              version: '1.0.0'
            }
          };
        }

        if (transformedModel) {
          // Cache the transformed results
          await cacheManagementService.storeTeamComps(transformedModel);

          // Update in-memory cache
          this.cachedTeamComps = transformedModel.data;
          this.lastRefresh = result.timestamp;
        }
      }

      return this.cachedTeamComps;
    } catch (error) {
      console.error('Error fetching team compositions:', error);

      // Try to get data from cache as fallback
      try {
        const cachedData = await cacheManagementService.getTeamComps({
          source: fetchOptions.source,
          patch: fetchOptions.patch
        });

        if (cachedData) {
          this.cachedTeamComps = cachedData.data;
          return this.cachedTeamComps;
        }
      } catch (cacheError) {
        console.error('Error fetching from cache:', cacheError);
      }

      return this.cachedTeamComps;
    }
  }

  /**
   * Fetch items from external APIs or cache
   * @param options Fetch options
   * @param transformOptions Transformation options
   * @returns Array of items
   */
  public async getItems(
    options?: Partial<FetchOptions>,
    transformOptions?: Partial<TransformationOptions>
  ): Promise<Item[]> {
    await this.ensureInitialized();

    const fetchOptions: FetchOptions = {
      source: options?.source || this.dataSource,
      patch: options?.patch || this.currentPatch,
      forceRefresh: options?.forceRefresh
    };

    // Check if we can use cached data
    if (!fetchOptions.forceRefresh) {
      const cacheOptions: CacheOptions = {
        source: fetchOptions.source,
        patch: fetchOptions.patch,
        maxAge: REFRESH_INTERVALS.DAILY
      };

      const isCacheValid = await cacheManagementService.isCacheValid(cacheOptions);

      if (isCacheValid) {
        const cachedData = await cacheManagementService.getItems(cacheOptions);

        if (cachedData) {
          this.cachedItems = cachedData.data;
          this.lastRefresh = cachedData.metadata.timestamp;

          if (!this.currentPatch && cachedData.metadata.patch) {
            this.currentPatch = cachedData.metadata.patch;
          }

          return this.cachedItems;
        }
      }
    }

    try {
      // Fetch items from the data fetching service
      const result = await dataFetchingService.fetchItems(fetchOptions);

      // Transform the data based on the source
      let transformedModel: ItemModel | null = null;

      if (result.data.length > 0) {
        const mergedTransformOptions = {
          source: result.source,
          ...transformOptions
        };

        // Apply appropriate transformation based on data source
        if (result.source === DataSource.META_TFT) {
          // Transform Meta TFT data
          const metaTftData = {
            items: result.data,
            patch: result.patch || '',
            updatedAt: new Date(result.timestamp).toISOString()
          };
          transformedModel = dataTransformationService.transformMetaTftItems(
            metaTftData,
            mergedTransformOptions
          );
        } else if (result.source === DataSource.TACTICS_TOOLS) {
          // Transform Tactics.Tools data
          const tacticsToolsData = {
            items: result.data,
            patch: result.patch || '',
            updatedAt: new Date(result.timestamp).toISOString()
          };
          transformedModel = dataTransformationService.transformTacticsToolsItems(
            tacticsToolsData,
            mergedTransformOptions
          );
        } else {
          // Data is already in the correct format
          transformedModel = {
            data: result.data,
            metadata: {
              source: result.source,
              timestamp: result.timestamp,
              patch: result.patch,
              version: '1.0.0'
            }
          };
        }

        if (transformedModel) {
          // Cache the transformed results
          await cacheManagementService.storeItems(transformedModel);

          // Update in-memory cache
          this.cachedItems = transformedModel.data;
          this.lastRefresh = result.timestamp;
        }
      }

      return this.cachedItems;
    } catch (error) {
      console.error('Error fetching items:', error);

      // Try to get data from cache as fallback
      try {
        const cachedData = await cacheManagementService.getItems({
          source: fetchOptions.source,
          patch: fetchOptions.patch
        });

        if (cachedData) {
          this.cachedItems = cachedData.data;
          return this.cachedItems;
        }
      } catch (cacheError) {
        console.error('Error fetching from cache:', cacheError);
      }

      return this.cachedItems;
    }
  }

  /**
   * Fetch augments from external APIs or cache
   * @param options Fetch options
   * @param transformOptions Transformation options
   * @returns Array of augments
   */
  public async getAugments(
    options?: Partial<FetchOptions>,
    transformOptions?: Partial<TransformationOptions>
  ): Promise<Augment[]> {
    await this.ensureInitialized();

    const fetchOptions: FetchOptions = {
      source: options?.source || this.dataSource,
      patch: options?.patch || this.currentPatch,
      forceRefresh: options?.forceRefresh
    };

    // Check if we can use cached data
    if (!fetchOptions.forceRefresh) {
      const cacheOptions: CacheOptions = {
        source: fetchOptions.source,
        patch: fetchOptions.patch,
        maxAge: REFRESH_INTERVALS.DAILY
      };

      const isCacheValid = await cacheManagementService.isCacheValid(cacheOptions);

      if (isCacheValid) {
        const cachedData = await cacheManagementService.getAugments(cacheOptions);

        if (cachedData) {
          this.cachedAugments = cachedData.data;
          this.lastRefresh = cachedData.metadata.timestamp;

          if (!this.currentPatch && cachedData.metadata.patch) {
            this.currentPatch = cachedData.metadata.patch;
          }

          return this.cachedAugments;
        }
      }
    }

    try {
      // Fetch augments from the data fetching service
      const result = await dataFetchingService.fetchAugments(fetchOptions);

      // Transform the data based on the source
      let transformedModel: AugmentModel | null = null;

      if (result.data.length > 0) {
        const mergedTransformOptions = {
          source: result.source,
          ...transformOptions
        };

        // Apply appropriate transformation based on data source
        if (result.source === DataSource.META_TFT) {
          // Transform Meta TFT data
          const metaTftData = {
            augments: result.data,
            patch: result.patch || '',
            updatedAt: new Date(result.timestamp).toISOString()
          };
          transformedModel = dataTransformationService.transformMetaTftAugments(
            metaTftData,
            mergedTransformOptions
          );
        } else if (result.source === DataSource.TACTICS_TOOLS) {
          // Transform Tactics.Tools data
          const tacticsToolsData = {
            augments: result.data,
            patch: result.patch || '',
            updatedAt: new Date(result.timestamp).toISOString()
          };
          transformedModel = dataTransformationService.transformTacticsToolsAugments(
            tacticsToolsData,
            mergedTransformOptions
          );
        } else {
          // Data is already in the correct format
          transformedModel = {
            data: result.data,
            metadata: {
              source: result.source,
              timestamp: result.timestamp,
              patch: result.patch,
              version: '1.0.0'
            }
          };
        }

        if (transformedModel) {
          // Cache the transformed results
          await cacheManagementService.storeAugments(transformedModel);

          // Update in-memory cache
          this.cachedAugments = transformedModel.data;
          this.lastRefresh = result.timestamp;
        }
      }

      return this.cachedAugments;
    } catch (error) {
      console.error('Error fetching augments:', error);

      // Try to get data from cache as fallback
      try {
        const cachedData = await cacheManagementService.getAugments({
          source: fetchOptions.source,
          patch: fetchOptions.patch
        });

        if (cachedData) {
          this.cachedAugments = cachedData.data;
          return this.cachedAugments;
        }
      } catch (cacheError) {
        console.error('Error fetching from cache:', cacheError);
      }

      return this.cachedAugments;
    }
  }

  /**
   * Force refresh all cached data
   * @param options Fetch options
   * @param transformOptions Transformation options
   */
  public async refreshData(
    options?: Partial<FetchOptions>,
    transformOptions?: Partial<TransformationOptions>
  ): Promise<void> {
    await this.ensureInitialized();

    try {
      const fetchOptions: FetchOptions = {
        source: options?.source || this.dataSource,
        patch: options?.patch || this.currentPatch,
        forceRefresh: true
      };

      await Promise.all([
        this.getTeamComps(fetchOptions, transformOptions),
        this.getItems(fetchOptions, transformOptions),
        this.getAugments(fetchOptions, transformOptions),
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }

  /**
   * Get cache status
   * @param patch Patch version
   * @returns Promise that resolves with the cache status
   */
  public async getCacheStatus(patch?: string): Promise<any> {
    await this.ensureInitialized();
    return cacheManagementService.getCacheStatus(patch);
  }

  /**
   * Clear all cached data
   * @returns Promise that resolves when the cache is cleared
   */
  public async clearCache(): Promise<void> {
    await this.ensureInitialized();
    await cacheManagementService.clearCache();

    // Clear in-memory cache
    this.cachedTeamComps = [];
    this.cachedItems = [];
    this.cachedAugments = [];
    this.lastRefresh = 0;
  }

  /**
   * Clear cached data for a specific patch
   * @param patch Patch version
   * @returns Promise that resolves when the cache is cleared
   */
  public async clearPatchCache(patch: string): Promise<void> {
    await this.ensureInitialized();
    await cacheManagementService.clearPatchCache(patch);

    // Clear in-memory cache if it's for the current patch
    if (this.currentPatch === patch) {
      this.cachedTeamComps = [];
      this.cachedItems = [];
      this.cachedAugments = [];
      this.lastRefresh = 0;
    }
  }

  /**
   * Check if offline data is available
   * @param patch Patch version
   * @returns Promise that resolves with a boolean indicating if offline data is available
   */
  public async isOfflineDataAvailable(patch?: string): Promise<boolean> {
    await this.ensureInitialized();
    return cacheManagementService.isOfflineDataAvailable(patch);
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
}

export default new DataApiService();
