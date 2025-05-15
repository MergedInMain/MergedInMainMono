import { API_ENDPOINTS, STORAGE_KEYS } from '../../shared/constants';
import { TeamComp, ApiResponse, Item, Augment, Unit } from '../../shared/types';
import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

// Initialize database
const dbPath = path.join(os.homedir(), '.tft-overlay', 'data.db');
let db: Database.Database | null = null;

// Ensure the directory exists
if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

// Initialize the database
const initDatabase = () => {
  if (!db) {
    db = new Database(dbPath);

    // Create tables if they don't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS team_comps (
        id TEXT PRIMARY KEY,
        name TEXT,
        tier TEXT,
        data TEXT,
        updated_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY,
        name TEXT,
        type TEXT,
        data TEXT,
        updated_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS augments (
        id TEXT PRIMARY KEY,
        name TEXT,
        tier TEXT,
        data TEXT,
        updated_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS meta_data (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at INTEGER
      );
    `);
  }

  return db;
};

// Fetch team compositions from API
export const fetchTeamComps = async (): Promise<ApiResponse<TeamComp[]>> => {
  try {
    // Check if we need to refresh the data
    const lastUpdate = localStorage.getItem(STORAGE_KEYS.LAST_UPDATE);
    const now = Date.now();

    // If data is fresh (less than 24 hours old), use cached data
    if (lastUpdate && now - parseInt(lastUpdate, 10) < 24 * 60 * 60 * 1000) {
      const cachedData = await getTeamCompsFromCache();
      if (cachedData && cachedData.length > 0) {
        return { success: true, data: cachedData };
      }
    }

    // Fetch fresh data from API
    const response = await fetch(`${API_ENDPOINTS.META_TFT}/comps`);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Transform API data to our format
    const teamComps: TeamComp[] = data.map((comp: any) => ({
      id: comp.id,
      name: comp.name,
      tier: comp.tier,
      units: comp.units,
      traits: comp.traits,
      augments: comp.augments,
      items: comp.items,
      placement: comp.avgPlacement,
      winRate: comp.winRate,
      playRate: comp.playRate,
      difficulty: comp.difficulty,
    }));

    // Cache the data
    await cacheTeamComps(teamComps);

    // Update last update timestamp
    localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, now.toString());

    return { success: true, data: teamComps };
  } catch (error) {
    console.error('Error fetching team comps:', error);

    // Try to get data from cache as fallback
    const cachedData = await getTeamCompsFromCache();
    if (cachedData && cachedData.length > 0) {
      return { success: true, data: cachedData };
    }

    return {
      success: false,
      error: `Failed to fetch team compositions: ${(error as Error).message}`
    };
  }
};

// Get team compositions from cache
const getTeamCompsFromCache = async (): Promise<TeamComp[] | null> => {
  try {
    const database = initDatabase();
    const stmt = database.prepare('SELECT data FROM team_comps');
    const rows = stmt.all();

    if (rows.length === 0) {
      return null;
    }

    return rows.map((row: any) => JSON.parse(row.data));
  } catch (error) {
    console.error('Error getting team comps from cache:', error);
    return null;
  }
};

// Cache team compositions
const cacheTeamComps = async (teamComps: TeamComp[]): Promise<void> => {
  try {
    const database = initDatabase();
    const stmt = database.prepare(
      'INSERT OR REPLACE INTO team_comps (id, name, tier, data, updated_at) VALUES (?, ?, ?, ?, ?)'
    );

    const now = Date.now();

    // Begin transaction
    const transaction = database.transaction((comps: TeamComp[]) => {
      for (const comp of comps) {
        stmt.run(comp.id, comp.name, comp.tier, JSON.stringify(comp), now);
      }
    });

    transaction(teamComps);
  } catch (error) {
    console.error('Error caching team comps:', error);
  }
};

// Similar functions for items, augments, etc.
export const fetchItems = async (): Promise<ApiResponse<Item[]>> => {
  // Implementation similar to fetchTeamComps
  return { success: true, data: [] };
};

export const fetchAugments = async (): Promise<ApiResponse<Augment[]>> => {
  try {
    // Check if we need to refresh the data
    const lastUpdate = localStorage.getItem(STORAGE_KEYS.LAST_UPDATE);
    const now = Date.now();

    // If data is fresh (less than 24 hours old), use cached data
    if (lastUpdate && now - parseInt(lastUpdate, 10) < 24 * 60 * 60 * 1000) {
      const cachedData = await getAugmentsFromCache();
      if (cachedData && cachedData.length > 0) {
        return { success: true, data: cachedData };
      }
    }

    // Fetch fresh data from tactics.tools API
    // Note: This is a mock endpoint, replace with actual tactics.tools API when available
    const response = await fetch(`${API_ENDPOINTS.TACTICS_TOOLS}/augments`);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Transform API data to our format
    const augments: Augment[] = data.augments.map((augment: any) => ({
      id: augment.id || augment.name.replace(/\s+/g, '_').toLowerCase(),
      name: augment.name,
      description: augment.description || '',
      tier: augment.tier || 'silver', // silver, gold, prismatic
      synergies: augment.synergies || [],
    }));

    // Cache the data
    await cacheAugments(augments);

    // Update last update timestamp
    localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, now.toString());

    return { success: true, data: augments };
  } catch (error) {
    console.error('Error fetching augments:', error);

    // Try to get data from cache as fallback
    const cachedData = await getAugmentsFromCache();
    if (cachedData && cachedData.length > 0) {
      return { success: true, data: cachedData };
    }

    // If API fails and no cache, return mock data for development
    return {
      success: true,
      data: getMockAugments()
    };
  }
};

// Get augments from cache
const getAugmentsFromCache = async (): Promise<Augment[] | null> => {
  try {
    const database = initDatabase();
    const stmt = database.prepare('SELECT data FROM augments');
    const rows = stmt.all();

    if (rows.length === 0) {
      return null;
    }

    return rows.map((row: any) => JSON.parse(row.data));
  } catch (error) {
    console.error('Error getting augments from cache:', error);
    return null;
  }
};

// Cache augments
const cacheAugments = async (augments: Augment[]): Promise<void> => {
  try {
    const database = initDatabase();
    const stmt = database.prepare(
      'INSERT OR REPLACE INTO augments (id, name, tier, data, updated_at) VALUES (?, ?, ?, ?, ?)'
    );

    const now = Date.now();

    // Begin transaction
    const transaction = database.transaction((items: Augment[]) => {
      for (const item of items) {
        stmt.run(item.id, item.name, item.tier, JSON.stringify(item), now);
      }
    });

    transaction(augments);
  } catch (error) {
    console.error('Error caching augments:', error);
  }
};

// Mock augments for development
const getMockAugments = (): Augment[] => {
  return [
    {
      id: 'spirit_heart',
      name: 'Spirit Heart',
      description: 'Your team counts as having 1 additional Spirit.',
      tier: 'silver',
      synergies: ['Spirit'],
    },
    {
      id: 'spell_sword',
      name: 'Spell Sword',
      description: 'Your units gain 20% Attack Speed and 20 Ability Power.',
      tier: 'gold',
      synergies: ['Sorcerer', 'Duelist'],
    },
    {
      id: 'sorcerer_soul',
      name: 'Sorcerer Soul',
      description: 'Your team counts as having 2 additional Sorcerers.',
      tier: 'silver',
      synergies: ['Sorcerer'],
    },
    {
      id: 'built_different_3',
      name: 'Built Different III',
      description: 'Your units with no traits active gain 400 Health and 60% Attack Speed.',
      tier: 'prismatic',
      synergies: [],
    },
    {
      id: 'celestial_blessing_2',
      name: 'Celestial Blessing II',
      description: 'Your units heal for 25% of the damage they deal.',
      tier: 'gold',
      synergies: [],
    },
    {
      id: 'cybernetic_implants_1',
      name: 'Cybernetic Implants I',
      description: 'Units with at least 1 item gain 150 Health and 10 Attack Damage.',
      tier: 'silver',
      synergies: [],
    },
  ];
};

// Clean up resources
export const cleanup = () => {
  if (db) {
    db.close();
    db = null;
  }
};
