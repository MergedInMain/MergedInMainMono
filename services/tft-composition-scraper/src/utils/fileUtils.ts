import fs from 'fs';
import path from 'path';
import logger from './logger';
import config from '../config';
import { TeamComposition, ScraperResult } from '../models/types';

/**
 * Ensures that the data directory exists
 */
export function ensureDataDirExists(): void {
  const { dataDir, backupDir } = config.storage;
  
  if (!fs.existsSync(dataDir)) {
    logger.info(`Creating data directory: ${dataDir}`);
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  if (!fs.existsSync(backupDir)) {
    logger.info(`Creating backup directory: ${backupDir}`);
    fs.mkdirSync(backupDir, { recursive: true });
  }
}

/**
 * Saves the compositions data to a JSON file
 * @param compositions The team compositions to save
 * @param patchVersion The current patch version
 * @returns True if the save was successful
 */
export function saveCompositionsData(
  compositions: TeamComposition[],
  patchVersion: string
): boolean {
  try {
    ensureDataDirExists();
    
    const filePath = path.join(config.storage.dataDir, config.storage.compositionsFile);
    const timestamp = new Date().toISOString();
    
    const data: ScraperResult = {
      compositions,
      timestamp,
      patchVersion,
      success: true
    };
    
    // Create a backup of the existing file if it exists
    if (fs.existsSync(filePath)) {
      createBackup(filePath);
    }
    
    // Write the new data
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    logger.info(`Saved ${compositions.length} compositions to ${filePath}`);
    
    return true;
  } catch (error) {
    logger.error('Error saving compositions data:', error);
    return false;
  }
}

/**
 * Loads the compositions data from the JSON file
 * @returns The loaded compositions data or null if the file doesn't exist
 */
export function loadCompositionsData(): ScraperResult | null {
  try {
    const filePath = path.join(config.storage.dataDir, config.storage.compositionsFile);
    
    if (!fs.existsSync(filePath)) {
      logger.warn(`Compositions file not found: ${filePath}`);
      return null;
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data) as ScraperResult;
  } catch (error) {
    logger.error('Error loading compositions data:', error);
    return null;
  }
}

/**
 * Creates a backup of the specified file
 * @param filePath The path to the file to back up
 */
function createBackup(filePath: string): void {
  try {
    const fileName = path.basename(filePath);
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupFileName = `${path.parse(fileName).name}.${timestamp}${path.parse(fileName).ext}`;
    const backupFilePath = path.join(config.storage.backupDir, backupFileName);
    
    fs.copyFileSync(filePath, backupFilePath);
    logger.info(`Created backup: ${backupFilePath}`);
    
    // Clean up old backups if we have too many
    cleanupOldBackups();
  } catch (error) {
    logger.error('Error creating backup:', error);
  }
}

/**
 * Cleans up old backups, keeping only the most recent ones
 */
function cleanupOldBackups(): void {
  try {
    const { backupDir, maxBackups } = config.storage;
    const files = fs.readdirSync(backupDir)
      .filter(file => file.startsWith(path.parse(config.storage.compositionsFile).name))
      .map(file => ({
        name: file,
        path: path.join(backupDir, file),
        time: fs.statSync(path.join(backupDir, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time); // Sort by modification time, newest first
    
    // Remove excess backups
    if (files.length > maxBackups) {
      const filesToRemove = files.slice(maxBackups);
      for (const file of filesToRemove) {
        fs.unlinkSync(file.path);
        logger.info(`Removed old backup: ${file.path}`);
      }
    }
  } catch (error) {
    logger.error('Error cleaning up old backups:', error);
  }
}
