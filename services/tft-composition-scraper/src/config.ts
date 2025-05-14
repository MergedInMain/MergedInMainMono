import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
  },
  
  // Scraper configuration
  scraper: {
    baseUrl: 'https://tactics.tools/team-compositions',
    patchVersion: process.env.TFT_PATCH_VERSION || 'current', // 'current' will use the latest patch
    rankFilter: process.env.TFT_RANK_FILTER || 'Diamond+', // Options: 'All', 'Diamond+', 'Master+', etc.
    maxCompositions: parseInt(process.env.MAX_COMPOSITIONS || '20', 10),
    requestDelay: parseInt(process.env.REQUEST_DELAY || '2000', 10), // 2 seconds between requests
    maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  },
  
  // Data storage configuration
  storage: {
    dataDir: process.env.DATA_DIR || path.join(__dirname, '../data'),
    compositionsFile: 'compositions.json',
    backupDir: path.join(__dirname, '../data/backups'),
    maxBackups: parseInt(process.env.MAX_BACKUPS || '5', 10),
  },
  
  // Scheduler configuration
  scheduler: {
    enabled: process.env.SCHEDULER_ENABLED === 'true',
    cronExpression: process.env.CRON_EXPRESSION || '0 0 * * *', // Default: daily at midnight
    timezone: process.env.TIMEZONE || 'UTC',
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || path.join(__dirname, '../logs/scraper.log'),
  },
};

export default config;
