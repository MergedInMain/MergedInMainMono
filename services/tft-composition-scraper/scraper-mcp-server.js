/**
 * TFT Composition Scraper MCP Server
 * 
 * This server provides API endpoints to trigger the scraper using Playwright-MCP.
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { chromium } = require('playwright');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Default port
const PORT = process.env.MCP_PORT || 4000;

// Function to get a random user agent
function getRandomUserAgent() {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59'
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// Function to get a random delay (used in the scrapeCompositions function)
function getRandomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to extract main compositions
async function extractMainCompositions(page) {
  console.log('Extracting main compositions...');
  
  // Wait for compositions to load
  await page.waitForSelector('.composition-list-item', { timeout: 30000 });
  
  // Extract main compositions data
  const compositions = await page.evaluate(() => {
    const comps = [];
    const compElements = document.querySelectorAll('.composition-list-item');
    
    compElements.forEach((element) => {
      // Extract composition name and tier
      const nameElement = element.querySelector('.composition-name');
      const tierElement = element.querySelector('.composition-tier');
      
      // Extract stats
      const statsElement = element.querySelector('.composition-stats');
      let avgPlace = 4.5, winRate = 0, playRate = 0, top4Rate = 0;
      
      if (statsElement) {
        const statsText = statsElement.textContent;
        const avgPlaceMatch = statsText.match(/([\d.]+)\s*avg/i);
        const winRateMatch = statsText.match(/([\d.]+)%\s*win/i);
        const playRateMatch = statsText.match(/([\d.]+)%\s*play/i);
        const top4Match = statsText.match(/([\d.]+)%\s*top4/i);
        
        if (avgPlaceMatch) avgPlace = parseFloat(avgPlaceMatch[1]);
        if (winRateMatch) winRate = parseFloat(winRateMatch[1]);
        if (playRateMatch) playRate = parseFloat(playRateMatch[1]);
        if (top4Match) top4Rate = parseFloat(top4Match[1]);
      }
      
      // Extract playstyle tags
      const playstyleTags = [];
      const playstyleElements = element.querySelectorAll('.playstyle-tag');
      playstyleElements.forEach(tag => {
        playstyleTags.push(tag.textContent.trim());
      });
      
      // Check if composition has variants
      const hasVariants = element.querySelector('.expand-button') !== null;
      
      // Generate a unique ID for the composition
      const id = element.id || `comp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Get team builder URL which contains the team planner code
      const teamBuilderLink = element.querySelector('a[href^="/team-builder/"]');
      const teamPlannerCode = teamBuilderLink ? teamBuilderLink.getAttribute('href').split('/').pop() : '';
      
      // Extract units
      const unitElements = element.querySelectorAll('.champion-icon');
      const units = Array.from(unitElements).map(unitEl => {
        const name = unitEl.getAttribute('alt') || '';
        const costClass = Array.from(unitEl.classList).find(c => c.startsWith('cost-'));
        const cost = costClass ? parseInt(costClass.replace('cost-', '')) : 1;
        const starLevel = unitEl.querySelector('.star-level') ? 
          unitEl.querySelector('.star-level').textContent.length : 1;
        
        // Extract items for this unit
        const itemElements = unitEl.querySelectorAll('.item-icon');
        const items = Array.from(itemElements).map(itemEl => {
          return {
            name: itemEl.getAttribute('alt') || '',
            id: itemEl.getAttribute('alt')?.toLowerCase().replace(/[^a-z0-9]/g, '_') || ''
          };
        });
        
        return { name, cost, starLevel, items };
      });
      
      comps.push({
        id,
        name: nameElement ? nameElement.textContent.trim() : `Composition ${comps.length + 1}`,
        tier: tierElement ? tierElement.textContent.trim() : 'S',
        units,
        stats: {
          averagePlacement: avgPlace,
          winPercentage: winRate,
          playRate: playRate,
          top4Percentage: top4Rate
        },
        playstyle: {
          tags: playstyleTags,
          difficulty: playstyleTags.includes('Easy') ? 'Easy' : 
                     playstyleTags.includes('Medium') ? 'Medium' : 'Hard'
        },
        teamPlannerCode,
        hasVariants
      });
    });
    
    return comps;
  });
  
  console.log(`Extracted ${compositions.length} main compositions`);
  return compositions;
}

// Function to extract variants for a composition
async function extractVariantsForComposition(page, composition, index) {
  if (!composition.hasVariants) {
    return { ...composition, variants: [] };
  }
  
  console.log(`Extracting variants for composition: ${composition.name} (${index + 1})`);
  
  try {
    // Find and click the expand button for this composition
    const expandButtons = await page.$$('.expand-button');
    if (index < expandButtons.length) {
      await expandButtons[index].click();
      
      // Wait for variants to load
      await page.waitForTimeout(1000);
      
      // Extract variants
      const variants = await page.evaluate((compId) => {
        const variantElements = document.querySelectorAll('.subcomp-item');
        const variants = [];
        
        variantElements.forEach((element) => {
          // Extract variant name
          const nameElement = element.querySelector('.composition-name');
          
          // Extract stats
          const statsElement = element.querySelector('.composition-stats');
          let avgPlace = 4.5, winRate = 0, playRate = 0, top4Rate = 0;
          
          if (statsElement) {
            const statsText = statsElement.textContent;
            const avgPlaceMatch = statsText.match(/([\d.]+)\s*avg/i);
            const winRateMatch = statsText.match(/([\d.]+)%\s*win/i);
            const playRateMatch = statsText.match(/([\d.]+)%\s*play/i);
            const top4Match = statsText.match(/([\d.]+)%\s*top4/i);
            
            if (avgPlaceMatch) avgPlace = parseFloat(avgPlaceMatch[1]);
            if (winRateMatch) winRate = parseFloat(winRateMatch[1]);
            if (playRateMatch) playRate = parseFloat(playRateMatch[1]);
            if (top4Match) top4Rate = parseFloat(top4Match[1]);
          }
          
          // Extract playstyle tags
          const playstyleTags = [];
          const playstyleElements = element.querySelectorAll('.playstyle-tag');
          playstyleElements.forEach(tag => {
            playstyleTags.push(tag.textContent.trim());
          });
          
          // Get team builder URL which contains the team planner code
          const teamBuilderLink = element.querySelector('a[href^="/team-builder/"]');
          const teamPlannerCode = teamBuilderLink ? teamBuilderLink.getAttribute('href').split('/').pop() : '';
          
          // Extract units
          const unitElements = element.querySelectorAll('.champion-icon');
          const units = Array.from(unitElements).map(unitEl => {
            const name = unitEl.getAttribute('alt') || '';
            const costClass = Array.from(unitEl.classList).find(c => c.startsWith('cost-'));
            const cost = costClass ? parseInt(costClass.replace('cost-', '')) : 1;
            const starLevel = unitEl.querySelector('.star-level') ? 
              unitEl.querySelector('.star-level').textContent.length : 1;
            
            // Extract items for this unit
            const itemElements = unitEl.querySelectorAll('.item-icon');
            const items = Array.from(itemElements).map(itemEl => {
              return {
                name: itemEl.getAttribute('alt') || '',
                id: itemEl.getAttribute('alt')?.toLowerCase().replace(/[^a-z0-9]/g, '_') || ''
              };
            });
            
            return { name, cost, starLevel, items };
          });
          
          variants.push({
            id: `${compId}-variant-${variants.length + 1}`,
            name: nameElement ? nameElement.textContent.trim() : `Variant ${variants.length + 1}`,
            units,
            stats: {
              averagePlacement: avgPlace,
              winPercentage: winRate,
              playRate: playRate,
              top4Percentage: top4Rate
            },
            playstyle: {
              tags: playstyleTags,
              difficulty: playstyleTags.includes('Easy') ? 'Easy' : 
                         playstyleTags.includes('Medium') ? 'Medium' : 'Hard'
            },
            teamPlannerCode
          });
        });
        
        return variants;
      }, composition.id);
      
      console.log(`Extracted ${variants.length} variants for ${composition.name}`);
      return { ...composition, variants };
    } else {
      console.log(`No expand button found for composition: ${composition.name}`);
      return { ...composition, variants: [] };
    }
  } catch (error) {
    console.error(`Error extracting variants for ${composition.name}:`, error);
    return { ...composition, variants: [] };
  }
}

// Main scraper function
async function scrapeCompositions(page) {
  try {
    // Navigate to tactics.tools
    await page.goto('https://tactics.tools/team-compositions', { waitUntil: 'networkidle' });
    
    // Add random delay to avoid detection
    await page.waitForTimeout(Math.floor(Math.random() * 2000) + 1000);
    
    // Extract main compositions
    const mainCompositions = await extractMainCompositions(page);
    
    // Extract variants for each composition
    const compositionsWithVariants = [];
    for (let i = 0; i < mainCompositions.length; i++) {
      const compWithVariants = await extractVariantsForComposition(page, mainCompositions[i], i);
      compositionsWithVariants.push(compWithVariants);
      
      // Add random delay between processing compositions
      await page.waitForTimeout(Math.floor(Math.random() * 1000) + 500);
    }
    
    return {
      compositions: compositionsWithVariants,
      lastUpdate: new Date().toISOString(),
      patchVersion: await page.evaluate(() => {
        const patchElement = document.querySelector('button:has-text("14.")');
        return patchElement ? patchElement.textContent.trim() : '';
      })
    };
  } catch (error) {
    console.error('Error scraping compositions:', error);
    throw error;
  }
}

// Endpoint to scrape compositions
app.get('/api/scrape-compositions', async (_, res) => {
  let browser;
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, 'data');
    try {
      await fs.mkdir(dataDir, { recursive: true });
    } catch (err) {
      if (err.code !== 'EEXIST') {
        throw err;
      }
    }
    
    browser = await chromium.launch({
      headless: true,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-features=IsolateOrigins,site-per-process'
      ]
    });
    const context = await browser.newContext({
      userAgent: getRandomUserAgent(),
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1,
      hasTouch: false,
      javaScriptEnabled: true,
      locale: 'en-US',
      timezoneId: 'America/New_York'
    });
    await context.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br'
    });
    const page = await context.newPage();
    
    // Run the scraper
    const data = await scrapeCompositions(page);
    
    // Save data to JSON file
    const filePath = path.join(dataDir, 'compositions.json');
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    
    await browser.close();
    
    res.json({ 
      success: true, 
      compositions: data.compositions,
      lastUpdate: data.lastUpdate,
      patchVersion: data.patchVersion
    });
  } catch (error) {
    if (browser) await browser.close();
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`TFT Composition Scraper MCP server running on port ${PORT}`);
});
