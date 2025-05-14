import { CronJob } from 'cron';
import logger from './logger';
import config from '../config';
import { runScraper } from '../scrapers';

let job: CronJob | null = null;

/**
 * Start the scheduler for periodic updates
 */
export function startScheduler(): void {
  if (!config.scheduler.enabled) {
    logger.info('Scheduler is disabled');
    return;
  }
  
  if (job) {
    logger.warn('Scheduler is already running');
    return;
  }
  
  try {
    job = new CronJob(
      config.scheduler.cronExpression,
      async () => {
        logger.info('Running scheduled scraper job');
        try {
          await runScraper();
          logger.info('Scheduled scraper job completed successfully');
        } catch (error) {
          logger.error('Scheduled scraper job failed:', error);
        }
      },
      null, // onComplete
      true, // start
      config.scheduler.timezone
    );
    
    logger.info(`Scheduler started with cron expression: ${config.scheduler.cronExpression}`);
    logger.info(`Next run scheduled for: ${job.nextDate().toLocaleString()}`);
  } catch (error) {
    logger.error('Failed to start scheduler:', error);
  }
}

/**
 * Stop the scheduler
 */
export function stopScheduler(): void {
  if (job) {
    job.stop();
    job = null;
    logger.info('Scheduler stopped');
  }
}

/**
 * Get the next scheduled run time
 * @returns The next scheduled run time as a string, or null if the scheduler is not running
 */
export function getNextRunTime(): string | null {
  if (job) {
    return job.nextDate().toLocaleString();
  }
  return null;
}
