import { startServer } from './api/server';
import { startScheduler } from './utils/scheduler';
import { runScraper } from './scrapers';
import { ensureDataDirExists, loadCompositionsData } from './utils/fileUtils';
import logger from './utils/logger';
import config from './config';

/**
 * Initialize the service
 */
async function initialize(): Promise<void> {
  try {
    // Ensure data directory exists
    ensureDataDirExists();
    
    // Check if we have existing data
    const data = loadCompositionsData();
    
    // If no data exists or it's older than a day, run the scraper
    if (!data || isDataStale(data.timestamp)) {
      logger.info('No data found or data is stale, running initial scrape...');
      await runScraper();
    } else {
      logger.info(`Loaded existing data with ${data.compositions.length} compositions`);
    }
    
    // Start the scheduler
    if (config.scheduler.enabled) {
      startScheduler();
    }
    
    // Start the API server
    startServer();
    
    logger.info('TFT Composition Scraper service initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize service:', error);
    process.exit(1);
  }
}

/**
 * Check if the data is stale (older than 24 hours)
 * @param timestamp The timestamp to check
 * @returns True if the data is stale
 */
function isDataStale(timestamp: string): boolean {
  const dataDate = new Date(timestamp);
  const now = new Date();
  const oneDayMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  return now.getTime() - dataDate.getTime() > oneDayMs;
}

// Handle process termination
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down...');
  process.exit(0);
});

// Start the service
initialize();
