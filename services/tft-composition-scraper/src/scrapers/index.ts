import { TacticsScraper } from './tacticsScraper';
import { saveCompositionsData } from '../utils/fileUtils';
import logger from '../utils/logger';
import config from '../config';
import { asyncHandler } from '../utils/errorHandler';

/**
 * Run the scraper and save the results
 */
export const runScraper = asyncHandler(async () => {
  logger.info('Starting TFT composition scraper...');
  
  const scraper = new TacticsScraper();
  
  try {
    // Initialize the scraper
    await scraper.initialize();
    
    // Scrape the compositions
    const compositions = await scraper.scrapeTeamCompositions();
    logger.info(`Successfully scraped ${compositions.length} team compositions`);
    
    // Save the compositions to a file
    const patchVersion = config.scraper.patchVersion;
    const saved = saveCompositionsData(compositions, patchVersion);
    
    if (saved) {
      logger.info('Successfully saved compositions data');
    } else {
      logger.error('Failed to save compositions data');
    }
    
    return compositions;
  } catch (error) {
    logger.error('Error running scraper:', error);
    throw error;
  } finally {
    // Make sure to close the browser
    await scraper.close();
  }
});

// If this file is run directly, execute the scraper
if (require.main === module) {
  runScraper()
    .then(() => {
      logger.info('Scraper completed successfully');
      process.exit(0);
    })
    .catch(error => {
      logger.error('Scraper failed:', error);
      process.exit(1);
    });
}
