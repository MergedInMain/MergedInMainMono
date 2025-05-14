/**
 * Database Service
 * 
 * Provides functionality for managing the SQLite database.
 * Handles database initialization, connection, and CRUD operations.
 */

import sqlite3 from 'sqlite3';
import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { 
  TeamCompModel, 
  ItemModel, 
  AugmentModel, 
  ChampionModel,
  TraitModel,
  DataVersion
} from '../../shared/data-models';
import { APP_PATHS } from '../../shared/constants';

// Enable verbose mode for debugging in development
if (process.env.NODE_ENV === 'development') {
  sqlite3.verbose();
}

/**
 * Database service class
 */
class DatabaseService {
  private db: sqlite3.Database | null = null;
  private dbPath: string = '';
  private isInitialized: boolean = false;

  /**
   * Initialize the database
   * @returns Promise that resolves when the database is initialized
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Get the user data path
      const userDataPath = app.getPath('userData');
      const dbDir = path.join(userDataPath, APP_PATHS.DATA_DIR);

      // Create the data directory if it doesn't exist
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Set the database path
      this.dbPath = path.join(dbDir, 'highroll.db');

      // Open the database
      this.db = await this.openDatabase();

      // Create tables if they don't exist
      await this.createTables();

      this.isInitialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  /**
   * Open the database
   * @returns Promise that resolves with the database
   */
  private openDatabase(): Promise<sqlite3.Database> {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(db);
        }
      });
    });
  }

  /**
   * Create database tables
   * @returns Promise that resolves when tables are created
   */
  private async createTables(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    // Create versions table
    await this.run(`
      CREATE TABLE IF NOT EXISTS versions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version TEXT NOT NULL,
        patch TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        team_comps_updated INTEGER DEFAULT 0,
        items_updated INTEGER DEFAULT 0,
        augments_updated INTEGER DEFAULT 0,
        champions_updated INTEGER DEFAULT 0,
        traits_updated INTEGER DEFAULT 0
      )
    `);

    // Create team_comps table
    await this.run(`
      CREATE TABLE IF NOT EXISTS team_comps (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        data TEXT NOT NULL,
        source TEXT NOT NULL,
        patch TEXT,
        timestamp INTEGER NOT NULL,
        version TEXT
      )
    `);

    // Create items table
    await this.run(`
      CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        data TEXT NOT NULL,
        source TEXT NOT NULL,
        patch TEXT,
        timestamp INTEGER NOT NULL,
        version TEXT
      )
    `);

    // Create augments table
    await this.run(`
      CREATE TABLE IF NOT EXISTS augments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        data TEXT NOT NULL,
        source TEXT NOT NULL,
        patch TEXT,
        timestamp INTEGER NOT NULL,
        version TEXT
      )
    `);

    // Create champions table
    await this.run(`
      CREATE TABLE IF NOT EXISTS champions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        data TEXT NOT NULL,
        source TEXT NOT NULL,
        patch TEXT,
        timestamp INTEGER NOT NULL,
        version TEXT
      )
    `);

    // Create traits table
    await this.run(`
      CREATE TABLE IF NOT EXISTS traits (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        data TEXT NOT NULL,
        source TEXT NOT NULL,
        patch TEXT,
        timestamp INTEGER NOT NULL,
        version TEXT
      )
    `);

    // Create indexes
    await this.run('CREATE INDEX IF NOT EXISTS idx_team_comps_source ON team_comps(source)');
    await this.run('CREATE INDEX IF NOT EXISTS idx_team_comps_patch ON team_comps(patch)');
    await this.run('CREATE INDEX IF NOT EXISTS idx_items_source ON items(source)');
    await this.run('CREATE INDEX IF NOT EXISTS idx_items_patch ON items(patch)');
    await this.run('CREATE INDEX IF NOT EXISTS idx_augments_source ON augments(source)');
    await this.run('CREATE INDEX IF NOT EXISTS idx_augments_patch ON augments(patch)');
    await this.run('CREATE INDEX IF NOT EXISTS idx_champions_source ON champions(source)');
    await this.run('CREATE INDEX IF NOT EXISTS idx_champions_patch ON champions(patch)');
    await this.run('CREATE INDEX IF NOT EXISTS idx_traits_source ON traits(source)');
    await this.run('CREATE INDEX IF NOT EXISTS idx_traits_patch ON traits(patch)');
  }

  /**
   * Run a SQL query
   * @param sql SQL query
   * @param params Query parameters
   * @returns Promise that resolves when the query is executed
   */
  private run(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Get a single row from the database
   * @param sql SQL query
   * @param params Query parameters
   * @returns Promise that resolves with the row
   */
  private get<T>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as T);
        }
      });
    });
  }

  /**
   * Get multiple rows from the database
   * @param sql SQL query
   * @param params Query parameters
   * @returns Promise that resolves with the rows
   */
  private all<T>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as T[]);
        }
      });
    });
  }

  /**
   * Close the database connection
   * @returns Promise that resolves when the connection is closed
   */
  public async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve();
        return;
      }

      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          this.db = null;
          this.isInitialized = false;
          resolve();
        }
      });
    });
  }

  // Database operations for team compositions

  /**
   * Save team compositions to the database
   * @param model Team composition model
   * @returns Promise that resolves when the data is saved
   */
  public async saveTeamComps(model: TeamCompModel): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const { data, metadata } = model;
    const { source, timestamp, patch, version } = metadata;

    // Begin transaction
    await this.run('BEGIN TRANSACTION');

    try {
      // Save each team composition
      for (const comp of data) {
        await this.run(
          `INSERT OR REPLACE INTO team_comps (id, name, data, source, patch, timestamp, version)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [comp.id, comp.name, JSON.stringify(comp), source, patch, timestamp, version]
        );
      }

      // Update version information
      await this.updateVersionInfo(patch || 'unknown', version || '1.0.0', timestamp, { teamComps: true });

      // Commit transaction
      await this.run('COMMIT');
    } catch (error) {
      // Rollback transaction on error
      await this.run('ROLLBACK');
      throw error;
    }
  }

  /**
   * Get team compositions from the database
   * @param source Data source
   * @param patch Patch version
   * @returns Promise that resolves with the team composition model
   */
  public async getTeamComps(source: string, patch?: string): Promise<TeamCompModel | null> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    let sql = 'SELECT * FROM team_comps WHERE source = ?';
    const params: any[] = [source];

    if (patch) {
      sql += ' AND patch = ?';
      params.push(patch);
    } else {
      // Get the latest patch if not specified
      sql += ' ORDER BY timestamp DESC LIMIT 1';
    }

    const rows = await this.all<any>(sql, params);

    if (rows.length === 0) {
      return null;
    }

    // Parse the data
    const teamComps = rows.map(row => JSON.parse(row.data));

    // Create the model
    return {
      data: teamComps,
      metadata: {
        source: rows[0].source,
        timestamp: rows[0].timestamp,
        patch: rows[0].patch,
        version: rows[0].version
      }
    };
  }

  // Database operations for items

  /**
   * Save items to the database
   * @param model Item model
   * @returns Promise that resolves when the data is saved
   */
  public async saveItems(model: ItemModel): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const { data, metadata } = model;
    const { source, timestamp, patch, version } = metadata;

    // Begin transaction
    await this.run('BEGIN TRANSACTION');

    try {
      // Save each item
      for (const item of data) {
        await this.run(
          `INSERT OR REPLACE INTO items (id, name, data, source, patch, timestamp, version)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [item.id, item.name, JSON.stringify(item), source, patch, timestamp, version]
        );
      }

      // Update version information
      await this.updateVersionInfo(patch || 'unknown', version || '1.0.0', timestamp, { items: true });

      // Commit transaction
      await this.run('COMMIT');
    } catch (error) {
      // Rollback transaction on error
      await this.run('ROLLBACK');
      throw error;
    }
  }

  /**
   * Get items from the database
   * @param source Data source
   * @param patch Patch version
   * @returns Promise that resolves with the item model
   */
  public async getItems(source: string, patch?: string): Promise<ItemModel | null> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    let sql = 'SELECT * FROM items WHERE source = ?';
    const params: any[] = [source];

    if (patch) {
      sql += ' AND patch = ?';
      params.push(patch);
    } else {
      // Get the latest patch if not specified
      sql += ' ORDER BY timestamp DESC LIMIT 1';
    }

    const rows = await this.all<any>(sql, params);

    if (rows.length === 0) {
      return null;
    }

    // Parse the data
    const items = rows.map(row => JSON.parse(row.data));

    // Create the model
    return {
      data: items,
      metadata: {
        source: rows[0].source,
        timestamp: rows[0].timestamp,
        patch: rows[0].patch,
        version: rows[0].version
      }
    };
  }

  // Database operations for augments

  /**
   * Save augments to the database
   * @param model Augment model
   * @returns Promise that resolves when the data is saved
   */
  public async saveAugments(model: AugmentModel): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const { data, metadata } = model;
    const { source, timestamp, patch, version } = metadata;

    // Begin transaction
    await this.run('BEGIN TRANSACTION');

    try {
      // Save each augment
      for (const augment of data) {
        await this.run(
          `INSERT OR REPLACE INTO augments (id, name, data, source, patch, timestamp, version)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [augment.id, augment.name, JSON.stringify(augment), source, patch, timestamp, version]
        );
      }

      // Update version information
      await this.updateVersionInfo(patch || 'unknown', version || '1.0.0', timestamp, { augments: true });

      // Commit transaction
      await this.run('COMMIT');
    } catch (error) {
      // Rollback transaction on error
      await this.run('ROLLBACK');
      throw error;
    }
  }

  /**
   * Get augments from the database
   * @param source Data source
   * @param patch Patch version
   * @returns Promise that resolves with the augment model
   */
  public async getAugments(source: string, patch?: string): Promise<AugmentModel | null> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    let sql = 'SELECT * FROM augments WHERE source = ?';
    const params: any[] = [source];

    if (patch) {
      sql += ' AND patch = ?';
      params.push(patch);
    } else {
      // Get the latest patch if not specified
      sql += ' ORDER BY timestamp DESC LIMIT 1';
    }

    const rows = await this.all<any>(sql, params);

    if (rows.length === 0) {
      return null;
    }

    // Parse the data
    const augments = rows.map(row => JSON.parse(row.data));

    // Create the model
    return {
      data: augments,
      metadata: {
        source: rows[0].source,
        timestamp: rows[0].timestamp,
        patch: rows[0].patch,
        version: rows[0].version
      }
    };
  }

  // Version management

  /**
   * Update version information
   * @param patch Patch version
   * @param version Data version
   * @param timestamp Timestamp
   * @param models Updated models
   * @returns Promise that resolves when the version is updated
   */
  private async updateVersionInfo(
    patch: string,
    version: string,
    timestamp: number,
    models: {
      teamComps?: boolean;
      items?: boolean;
      augments?: boolean;
      champions?: boolean;
      traits?: boolean;
    }
  ): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    // Check if version exists
    const existingVersion = await this.get<any>(
      'SELECT * FROM versions WHERE version = ? AND patch = ?',
      [version, patch]
    );

    if (existingVersion) {
      // Update existing version
      let sql = 'UPDATE versions SET timestamp = ?';
      const params: any[] = [timestamp];

      if (models.teamComps) {
        sql += ', team_comps_updated = 1';
      }
      if (models.items) {
        sql += ', items_updated = 1';
      }
      if (models.augments) {
        sql += ', augments_updated = 1';
      }
      if (models.champions) {
        sql += ', champions_updated = 1';
      }
      if (models.traits) {
        sql += ', traits_updated = 1';
      }

      sql += ' WHERE version = ? AND patch = ?';
      params.push(version, patch);

      await this.run(sql, params);
    } else {
      // Insert new version
      await this.run(
        `INSERT INTO versions (
          version, patch, timestamp,
          team_comps_updated, items_updated, augments_updated,
          champions_updated, traits_updated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          version,
          patch,
          timestamp,
          models.teamComps ? 1 : 0,
          models.items ? 1 : 0,
          models.augments ? 1 : 0,
          models.champions ? 1 : 0,
          models.traits ? 1 : 0
        ]
      );
    }
  }

  /**
   * Get version information
   * @param patch Patch version
   * @returns Promise that resolves with the version information
   */
  public async getVersionInfo(patch?: string): Promise<DataVersion | null> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    let sql = 'SELECT * FROM versions';
    const params: any[] = [];

    if (patch) {
      sql += ' WHERE patch = ?';
      params.push(patch);
    }

    sql += ' ORDER BY timestamp DESC LIMIT 1';

    const row = await this.get<any>(sql, params);

    if (!row) {
      return null;
    }

    return {
      version: row.version,
      patch: row.patch,
      timestamp: row.timestamp,
      models: {
        teamComps: row.team_comps_updated === 1,
        items: row.items_updated === 1,
        augments: row.augments_updated === 1,
        champions: row.champions_updated === 1,
        traits: row.traits_updated === 1
      }
    };
  }

  /**
   * Check if data is available for a specific patch
   * @param patch Patch version
   * @returns Promise that resolves with a boolean indicating if data is available
   */
  public async isDataAvailable(patch: string): Promise<boolean> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const version = await this.getVersionInfo(patch);
    return version !== null;
  }

  /**
   * Clear all data from the database
   * @returns Promise that resolves when the data is cleared
   */
  public async clearAllData(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    // Begin transaction
    await this.run('BEGIN TRANSACTION');

    try {
      // Clear all tables
      await this.run('DELETE FROM team_comps');
      await this.run('DELETE FROM items');
      await this.run('DELETE FROM augments');
      await this.run('DELETE FROM champions');
      await this.run('DELETE FROM traits');
      await this.run('DELETE FROM versions');

      // Commit transaction
      await this.run('COMMIT');
    } catch (error) {
      // Rollback transaction on error
      await this.run('ROLLBACK');
      throw error;
    }
  }

  /**
   * Clear data for a specific patch
   * @param patch Patch version
   * @returns Promise that resolves when the data is cleared
   */
  public async clearPatchData(patch: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    // Begin transaction
    await this.run('BEGIN TRANSACTION');

    try {
      // Clear data for the specified patch
      await this.run('DELETE FROM team_comps WHERE patch = ?', [patch]);
      await this.run('DELETE FROM items WHERE patch = ?', [patch]);
      await this.run('DELETE FROM augments WHERE patch = ?', [patch]);
      await this.run('DELETE FROM champions WHERE patch = ?', [patch]);
      await this.run('DELETE FROM traits WHERE patch = ?', [patch]);
      await this.run('DELETE FROM versions WHERE patch = ?', [patch]);

      // Commit transaction
      await this.run('COMMIT');
    } catch (error) {
      // Rollback transaction on error
      await this.run('ROLLBACK');
      throw error;
    }
  }
}

// Export a singleton instance
export default new DatabaseService();
