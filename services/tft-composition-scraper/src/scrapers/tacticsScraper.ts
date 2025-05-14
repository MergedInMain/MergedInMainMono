import puppeteer, { Browser, Page } from 'puppeteer';
import cheerio from 'cheerio';
import { 
  TeamComposition, 
  ChampionInfo, 
  ItemInfo, 
  TraitInfo, 
  CompositionStats,
  CompositionPlaystyle,
  ScraperConfig
} from '../models/types';
import logger from '../utils/logger';
import { ScraperError, retry } from '../utils/errorHandler';
import config from '../config';

/**
 * Scraper class for tactics.tools
 */
export class TacticsScraper {
  private browser: Browser | null = null;
  private config: ScraperConfig;
  
  constructor(customConfig?: Partial<ScraperConfig>) {
    this.config = {
      ...config.scraper,
      ...customConfig
    };
  }
  
  /**
   * Initialize the browser
   */
  async initialize(): Promise<void> {
    try {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      logger.info('Browser initialized');
    } catch (error) {
      logger.error('Failed to initialize browser:', error);
      throw new ScraperError('Failed to initialize browser', 500);
    }
  }
  
  /**
   * Close the browser
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      logger.info('Browser closed');
    }
  }
  
  /**
   * Scrape team compositions from tactics.tools
   * @returns Array of team compositions
   */
  async scrapeTeamCompositions(): Promise<TeamComposition[]> {
    if (!this.browser) {
      await this.initialize();
    }
    
    if (!this.browser) {
      throw new ScraperError('Browser not initialized', 500);
    }
    
    try {
      const page = await this.browser.newPage();
      await page.setUserAgent(this.config.userAgent);
      
      // Navigate to the team compositions page
      logger.info(`Navigating to ${this.config.baseUrl}`);
      await page.goto(this.config.baseUrl, { waitUntil: 'networkidle2' });
      
      // Wait for the compositions to load
      await page.waitForSelector('.team-comp-row', { timeout: 10000 });
      
      // Get the list of team compositions
      const compositionUrls = await this.getCompositionUrls(page);
      logger.info(`Found ${compositionUrls.length} team compositions`);
      
      // Limit the number of compositions to scrape
      const limitedUrls = compositionUrls.slice(0, this.config.maxCompositions);
      
      // Scrape each composition
      const compositions: TeamComposition[] = [];
      for (let i = 0; i < limitedUrls.length; i++) {
        const url = limitedUrls[i];
        logger.info(`Scraping composition ${i + 1}/${limitedUrls.length}: ${url}`);
        
        try {
          // Use retry mechanism for each composition
          const composition = await retry(
            () => this.scrapeComposition(url),
            this.config.maxRetries,
            this.config.requestDelay
          );
          
          compositions.push(composition);
          
          // Add delay between requests to avoid rate limiting
          if (i < limitedUrls.length - 1) {
            await new Promise(resolve => setTimeout(resolve, this.config.requestDelay));
          }
        } catch (error) {
          logger.error(`Failed to scrape composition ${url}:`, error);
          // Continue with the next composition
        }
      }
      
      return compositions;
    } catch (error) {
      logger.error('Error scraping team compositions:', error);
      throw new ScraperError('Failed to scrape team compositions', 500);
    } finally {
      await this.close();
    }
  }
  
  /**
   * Get the URLs of all team compositions
   * @param page The Puppeteer page
   * @returns Array of composition URLs
   */
  private async getCompositionUrls(page: Page): Promise<string[]> {
    try {
      // Extract the URLs from the team composition rows
      const urls = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('.team-comp-row a[href*="/team-builder/"]'));
        return links.map(link => (link as HTMLAnchorElement).href);
      });
      
      return urls;
    } catch (error) {
      logger.error('Error getting composition URLs:', error);
      throw new ScraperError('Failed to get composition URLs', 500);
    }
  }
  
  /**
   * Scrape a single team composition
   * @param url The URL of the team composition
   * @returns The scraped team composition
   */
  private async scrapeComposition(url: string): Promise<TeamComposition> {
    if (!this.browser) {
      throw new ScraperError('Browser not initialized', 500);
    }
    
    const page = await this.browser.newPage();
    await page.setUserAgent(this.config.userAgent);
    
    try {
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      // Wait for the composition details to load
      await page.waitForSelector('.comp-details', { timeout: 10000 });
      
      // Get the HTML content
      const content = await page.content();
      const $ = cheerio.load(content);
      
      // Extract composition name and type
      const compositionName = $('.comp-name').text().trim();
      const compositionType = this.extractCompositionType(compositionName);
      
      // Extract stats
      const stats = this.extractStats($);
      
      // Extract playstyle
      const playstyle = this.extractPlaystyle($);
      
      // Extract units
      const units = await this.extractUnits(page);
      
      // Extract traits
      const traits = this.extractTraits($);
      
      // Create the team composition object
      const composition: TeamComposition = {
        id: this.generateId(compositionName),
        name: compositionName,
        type: compositionType,
        stats,
        playstyle,
        units,
        traits,
        lastUpdated: new Date().toISOString(),
        teamBuilderUrl: url
      };
      
      return composition;
    } catch (error) {
      logger.error(`Error scraping composition ${url}:`, error);
      throw new ScraperError(`Failed to scrape composition ${url}`, 500);
    } finally {
      await page.close();
    }
  }
  
  /**
   * Extract the composition type from the name
   * @param name The composition name
   * @returns The composition type
   */
  private extractCompositionType(name: string): string {
    // Extract the trait or champion name from the composition name
    const parts = name.split(' ');
    return parts[0] || 'Unknown';
  }
  
  /**
   * Extract the composition stats
   * @param $ The Cheerio instance
   * @returns The composition stats
   */
  private extractStats($: cheerio.CheerioAPI): CompositionStats {
    try {
      const playRate = parseFloat($('.stat-value:contains("Play Rate") + .stat-value').text().trim()) || 0;
      const averagePlacement = parseFloat($('.stat-value:contains("Place") + .stat-value').text().trim()) || 0;
      const top4Percentage = parseFloat($('.stat-value:contains("Top 4") + .stat-value').text().trim()) || 0;
      const winPercentage = parseFloat($('.stat-value:contains("Win") + .stat-value').text().trim()) || 0;
      
      return {
        playRate,
        averagePlacement,
        top4Percentage,
        winPercentage
      };
    } catch (error) {
      logger.error('Error extracting stats:', error);
      return {
        playRate: 0,
        averagePlacement: 0,
        top4Percentage: 0,
        winPercentage: 0
      };
    }
  }
  
  /**
   * Extract the composition playstyle
   * @param $ The Cheerio instance
   * @returns The composition playstyle
   */
  private extractPlaystyle($: cheerio.CheerioAPI): CompositionPlaystyle {
    try {
      const playstyleText = $('.playstyle').text().trim();
      const parts = playstyleText.split('\n').map(part => part.trim()).filter(Boolean);
      
      return {
        type: parts[0] || 'Unknown',
        description: parts[1] || undefined
      };
    } catch (error) {
      logger.error('Error extracting playstyle:', error);
      return {
        type: 'Unknown'
      };
    }
  }
  
  /**
   * Extract the units (champions) in the composition
   * @param page The Puppeteer page
   * @returns Array of champion info
   */
  private async extractUnits(page: Page): Promise<ChampionInfo[]> {
    try {
      // Click on the Units tab
      await page.click('button[role="tab"]:has-text("Units")');
      await page.waitForSelector('.unit-row', { timeout: 5000 });
      
      // Get the HTML content after clicking the tab
      const content = await page.content();
      const $ = cheerio.load(content);
      
      const units: ChampionInfo[] = [];
      
      $('.unit-row').each((_, element) => {
        const name = $(element).find('.unit-name').text().trim();
        const starLevelText = $(element).find('.star-level').text().trim();
        const starLevel = starLevelText.length || 1; // Count the number of stars
        const playRate = parseFloat($(element).find('.play-rate').text().trim()) || 0;
        const averagePlacement = parseFloat($(element).find('.avg-place').text().trim()) || 0;
        const isCore = playRate > 50; // Assume core units have high play rates
        
        // Extract items
        const items: ItemInfo[] = [];
        $(element).find('.item-container').each((_, itemElement) => {
          const itemName = $(itemElement).attr('alt') || 'Unknown Item';
          const itemPlayRate = parseFloat($(itemElement).find('.item-play-rate').text().trim()) || 0;
          const itemAvgPlace = parseFloat($(itemElement).find('.item-avg-place').text().trim()) || 0;
          const placementDelta = parseFloat($(itemElement).find('.placement-delta').text().trim()) || 0;
          
          items.push({
            name: itemName,
            playRate: itemPlayRate,
            averagePlacement: itemAvgPlace,
            placementDelta
          });
        });
        
        units.push({
          name,
          starLevel,
          isCore,
          items,
          playRate,
          averagePlacement
        });
      });
      
      return units;
    } catch (error) {
      logger.error('Error extracting units:', error);
      return [];
    }
  }
  
  /**
   * Extract the traits in the composition
   * @param $ The Cheerio instance
   * @returns Array of trait info
   */
  private extractTraits($: cheerio.CheerioAPI): TraitInfo[] {
    try {
      const traits: TraitInfo[] = [];
      
      $('.trait-row').each((_, element) => {
        const name = $(element).find('.trait-name').text().trim();
        const levelText = $(element).find('.trait-level').text().trim();
        const [activeLevel, totalLevel] = levelText.split('/').map(level => parseInt(level.trim(), 10));
        const playRate = parseFloat($(element).find('.trait-play-rate').text().trim()) || 0;
        const averagePlacement = parseFloat($(element).find('.trait-avg-place').text().trim()) || 0;
        
        traits.push({
          name,
          activeLevel: activeLevel || 0,
          totalLevel: totalLevel || 0,
          playRate,
          averagePlacement
        });
      });
      
      return traits;
    } catch (error) {
      logger.error('Error extracting traits:', error);
      return [];
    }
  }
  
  /**
   * Generate a unique ID for a composition
   * @param name The composition name
   * @returns The generated ID
   */
  private generateId(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
