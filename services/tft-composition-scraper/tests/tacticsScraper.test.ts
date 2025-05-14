import { TacticsScraper } from '../src/scrapers/tacticsScraper';
import { TeamComposition } from '../src/models/types';

// Mock puppeteer
jest.mock('puppeteer', () => {
  return {
    launch: jest.fn().mockImplementation(() => {
      return {
        newPage: jest.fn().mockImplementation(() => {
          return {
            setUserAgent: jest.fn(),
            goto: jest.fn(),
            waitForSelector: jest.fn(),
            content: jest.fn().mockReturnValue('<html><body><div class="comp-name">Test Composition</div></body></html>'),
            evaluate: jest.fn().mockReturnValue(['https://tactics.tools/team-builder/test']),
            click: jest.fn(),
            close: jest.fn()
          };
        }),
        close: jest.fn()
      };
    })
  };
});

// Mock cheerio
jest.mock('cheerio', () => {
  return {
    load: jest.fn().mockImplementation(() => {
      return {
        // Mock the cheerio selectors and methods
        $('.comp-name'): { text: jest.fn().mockReturnValue('Test Composition') },
        $('.stat-value:contains("Play Rate") + .stat-value'): { text: jest.fn().mockReturnValue('0.5') },
        $('.stat-value:contains("Place") + .stat-value'): { text: jest.fn().mockReturnValue('4.2') },
        $('.stat-value:contains("Top 4") + .stat-value'): { text: jest.fn().mockReturnValue('55.0') },
        $('.stat-value:contains("Win") + .stat-value'): { text: jest.fn().mockReturnValue('10.0') },
        $('.playstyle'): { text: jest.fn().mockReturnValue('Level 6 Reroll\nConsistent') },
        $('.unit-row'): {
          each: jest.fn().mockImplementation((callback) => {
            // Mock a single unit
            callback(0, {
              find: (selector: string) => {
                if (selector === '.unit-name') {
                  return { text: jest.fn().mockReturnValue('Test Champion') };
                }
                if (selector === '.star-level') {
                  return { text: jest.fn().mockReturnValue('★★★') };
                }
                if (selector === '.play-rate') {
                  return { text: jest.fn().mockReturnValue('80.0') };
                }
                if (selector === '.avg-place') {
                  return { text: jest.fn().mockReturnValue('4.0') };
                }
                return { text: jest.fn().mockReturnValue('') };
              },
              find: (selector: string) => {
                if (selector === '.item-container') {
                  return {
                    each: jest.fn().mockImplementation((callback) => {
                      // Mock a single item
                      callback(0, {
                        attr: jest.fn().mockReturnValue('Test Item'),
                        find: (selector: string) => {
                          if (selector === '.item-play-rate') {
                            return { text: jest.fn().mockReturnValue('70.0') };
                          }
                          if (selector === '.item-avg-place') {
                            return { text: jest.fn().mockReturnValue('3.8') };
                          }
                          if (selector === '.placement-delta') {
                            return { text: jest.fn().mockReturnValue('-0.2') };
                          }
                          return { text: jest.fn().mockReturnValue('') };
                        }
                      });
                    })
                  };
                }
                return { text: jest.fn().mockReturnValue('') };
              }
            };
          })
        },
        $('.trait-row'): {
          each: jest.fn().mockImplementation((callback) => {
            // Mock a single trait
            callback(0, {
              find: (selector: string) => {
                if (selector === '.trait-name') {
                  return { text: jest.fn().mockReturnValue('Test Trait') };
                }
                if (selector === '.trait-level') {
                  return { text: jest.fn().mockReturnValue('4/6') };
                }
                if (selector === '.trait-play-rate') {
                  return { text: jest.fn().mockReturnValue('90.0') };
                }
                if (selector === '.trait-avg-place') {
                  return { text: jest.fn().mockReturnValue('4.1') };
                }
                return { text: jest.fn().mockReturnValue('') };
              }
            });
          })
        }
      };
    })
  };
});

describe('TacticsScraper', () => {
  let scraper: TacticsScraper;
  
  beforeEach(() => {
    scraper = new TacticsScraper({
      baseUrl: 'https://tactics.tools/team-compositions',
      requestDelay: 0,
      maxRetries: 1,
      userAgent: 'test-agent'
    });
  });
  
  afterEach(async () => {
    await scraper.close();
  });
  
  test('should initialize and close browser', async () => {
    await scraper.initialize();
    expect(scraper['browser']).not.toBeNull();
    
    await scraper.close();
    expect(scraper['browser']).toBeNull();
  });
  
  test('should scrape team compositions', async () => {
    const compositions = await scraper.scrapeTeamCompositions();
    
    expect(compositions).toBeInstanceOf(Array);
    expect(compositions.length).toBeGreaterThan(0);
    
    const composition = compositions[0];
    expect(composition).toHaveProperty('id');
    expect(composition).toHaveProperty('name');
    expect(composition).toHaveProperty('type');
    expect(composition).toHaveProperty('stats');
    expect(composition).toHaveProperty('playstyle');
    expect(composition).toHaveProperty('units');
    expect(composition).toHaveProperty('traits');
    expect(composition).toHaveProperty('lastUpdated');
  });
});
