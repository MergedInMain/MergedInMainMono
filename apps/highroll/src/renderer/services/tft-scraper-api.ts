import { TeamComp, ApiResponse } from '../../shared/types';

// Constants
const TFT_SCRAPER_API_URL = process.env.TFT_SCRAPER_API_URL || 'http://localhost:3000/api';
const STORAGE_KEYS = {
  LAST_UPDATE: 'tft_data_last_update',
  COMPOSITIONS_CACHE: 'tft_compositions_cache'
};

/**
 * Fetch team compositions from the TFT composition scraper service
 * @param options Optional parameters for filtering and sorting
 * @returns Promise with the team compositions
 */
export const fetchTeamCompositions = async (options: {
  type?: string;
  minWinRate?: number;
  maxAvgPlace?: number;
  sortBy?: 'winRate' | 'avgPlace' | 'playRate' | 'top4';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
} = {}): Promise<ApiResponse<TeamComp[]>> => {
  try {
    // Check if we need to refresh the data
    const lastUpdate = localStorage.getItem(STORAGE_KEYS.LAST_UPDATE);
    const now = Date.now();

    // If data is fresh (less than 24 hours old), use cached data
    if (lastUpdate && now - parseInt(lastUpdate, 10) < 24 * 60 * 60 * 1000) {
      const cachedData = localStorage.getItem(STORAGE_KEYS.COMPOSITIONS_CACHE);
      if (cachedData) {
        return { success: true, data: JSON.parse(cachedData) };
      }
    }

    // Fetch fresh data from the TFT composition scraper service
    const response = await fetch(`${TFT_SCRAPER_API_URL}/compositions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(options)
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Transform API data to our format
    const teamComps: TeamComp[] = data.compositions.map((comp: any) => ({
      id: comp.id,
      name: comp.name,
      tier: comp.tier || 'S',
      units: comp.units.map((unit: any) => ({
        name: unit.name,
        cost: unit.cost || 1,
        starLevel: unit.starLevel || 1,
        items: unit.items?.map((item: any) => ({
          name: item.name,
          id: item.id || item.name.toLowerCase().replace(/[^a-z0-9]/g, '_')
        })) || []
      })),
      traits: comp.traits.map((trait: any) => ({
        name: trait.name,
        activeLevel: trait.activeLevel || 1,
        totalLevel: trait.totalLevel || 1
      })),
      augments: comp.augments?.map((augment: any) => ({
        name: augment.name,
        id: augment.id || augment.name.toLowerCase().replace(/[^a-z0-9]/g, '_')
      })) || [],
      items: comp.items?.map((item: any) => ({
        name: item.name,
        id: item.id || item.name.toLowerCase().replace(/[^a-z0-9]/g, '_')
      })) || [],
      placement: comp.stats?.averagePlacement || 4.5,
      winRate: comp.stats?.winPercentage || 0,
      playRate: comp.stats?.playRate || 0,
      difficulty: comp.playstyle?.difficulty || 'Medium',
      teamPlannerCode: comp.teamPlannerCode || ''
    }));

    // Cache the data
    localStorage.setItem(STORAGE_KEYS.COMPOSITIONS_CACHE, JSON.stringify(teamComps));
    localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, now.toString());

    return { success: true, data: teamComps };
  } catch (error) {
    console.error('Error fetching team compositions:', error);

    // Try to get data from cache as fallback
    const cachedData = localStorage.getItem(STORAGE_KEYS.COMPOSITIONS_CACHE);
    if (cachedData) {
      return { success: true, data: JSON.parse(cachedData) };
    }

    return {
      success: false,
      error: `Failed to fetch team compositions: ${(error as Error).message}`
    };
  }
};

/**
 * Search for team compositions by name or champion
 * @param query Search query
 * @returns Promise with the search results
 */
export const searchTeamCompositions = async (query: string): Promise<ApiResponse<TeamComp[]>> => {
  try {
    const response = await fetch(`${TFT_SCRAPER_API_URL}/compositions/search?q=${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Transform API data to our format (same as fetchTeamCompositions)
    const teamComps: TeamComp[] = data.compositions.map((comp: any) => ({
      id: comp.id,
      name: comp.name,
      tier: comp.tier || 'S',
      units: comp.units.map((unit: any) => ({
        name: unit.name,
        cost: unit.cost || 1,
        starLevel: unit.starLevel || 1,
        items: unit.items?.map((item: any) => ({
          name: item.name,
          id: item.id || item.name.toLowerCase().replace(/[^a-z0-9]/g, '_')
        })) || []
      })),
      traits: comp.traits.map((trait: any) => ({
        name: trait.name,
        activeLevel: trait.activeLevel || 1,
        totalLevel: trait.totalLevel || 1
      })),
      augments: comp.augments?.map((augment: any) => ({
        name: augment.name,
        id: augment.id || augment.name.toLowerCase().replace(/[^a-z0-9]/g, '_')
      })) || [],
      items: comp.items?.map((item: any) => ({
        name: item.name,
        id: item.id || item.name.toLowerCase().replace(/[^a-z0-9]/g, '_')
      })) || [],
      placement: comp.stats?.averagePlacement || 4.5,
      winRate: comp.stats?.winPercentage || 0,
      playRate: comp.stats?.playRate || 0,
      difficulty: comp.playstyle?.difficulty || 'Medium',
      teamPlannerCode: comp.teamPlannerCode || ''
    }));

    return { success: true, data: teamComps };
  } catch (error) {
    console.error('Error searching team compositions:', error);

    return {
      success: false,
      error: `Failed to search team compositions: ${(error as Error).message}`
    };
  }
};

/**
 * Manually trigger the scraper to update the data
 * @returns Promise with the result
 */
export const triggerScraper = async (): Promise<ApiResponse<{ message: string; count: number }>> => {
  try {
    const response = await fetch(`${TFT_SCRAPER_API_URL}/scrape`, {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    return { success: true, data: { message: data.message, count: data.count } };
  } catch (error) {
    console.error('Error triggering scraper:', error);

    return {
      success: false,
      error: `Failed to trigger scraper: ${(error as Error).message}`
    };
  }
};

/**
 * Get the status of the scraper service
 * @returns Promise with the status
 */
export const getScraperStatus = async (): Promise<ApiResponse<{
  status: string;
  lastUpdate: string | null;
  patchVersion: string | null;
  compositionCount: number;
  nextScheduledRun: string | null;
}>> => {
  try {
    const response = await fetch(`${TFT_SCRAPER_API_URL}/status`);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    return { success: true, data };
  } catch (error) {
    console.error('Error getting scraper status:', error);

    return {
      success: false,
      error: `Failed to get scraper status: ${(error as Error).message}`
    };
  }
};