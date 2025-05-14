import express, { Request, Response } from 'express';
import { loadCompositionsData } from '../utils/fileUtils';
import { runScraper } from '../scrapers';
import { asyncHandler } from '../utils/errorHandler';
import { getNextRunTime, startScheduler, stopScheduler } from '../utils/scheduler';
import logger from '../utils/logger';
import { TeamComposition } from '../models/types';

const router = express.Router();

/**
 * GET /api/compositions
 * Get all team compositions
 */
router.get('/compositions', asyncHandler(async (req: Request, res: Response) => {
  const data = loadCompositionsData();
  
  if (!data) {
    return res.status(404).json({ 
      success: false, 
      message: 'No compositions data found' 
    });
  }
  
  // Apply filters if provided
  let compositions = data.compositions;
  
  // Filter by composition type
  if (req.query.type) {
    const type = req.query.type as string;
    compositions = compositions.filter(comp => 
      comp.type.toLowerCase() === type.toLowerCase()
    );
  }
  
  // Filter by minimum win rate
  if (req.query.minWinRate) {
    const minWinRate = parseFloat(req.query.minWinRate as string);
    compositions = compositions.filter(comp => 
      comp.stats.winPercentage >= minWinRate
    );
  }
  
  // Filter by maximum average placement
  if (req.query.maxAvgPlace) {
    const maxAvgPlace = parseFloat(req.query.maxAvgPlace as string);
    compositions = compositions.filter(comp => 
      comp.stats.averagePlacement <= maxAvgPlace
    );
  }
  
  // Sort by specified field
  if (req.query.sortBy) {
    const sortBy = req.query.sortBy as string;
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    
    compositions = compositions.sort((a, b) => {
      let valueA: number;
      let valueB: number;
      
      switch (sortBy) {
        case 'winRate':
          valueA = a.stats.winPercentage;
          valueB = b.stats.winPercentage;
          break;
        case 'avgPlace':
          valueA = a.stats.averagePlacement;
          valueB = b.stats.averagePlacement;
          break;
        case 'playRate':
          valueA = a.stats.playRate;
          valueB = b.stats.playRate;
          break;
        case 'top4':
          valueA = a.stats.top4Percentage;
          valueB = b.stats.top4Percentage;
          break;
        default:
          valueA = a.stats.averagePlacement;
          valueB = b.stats.averagePlacement;
      }
      
      return (valueA - valueB) * sortOrder;
    });
  }
  
  // Limit the number of results
  if (req.query.limit) {
    const limit = parseInt(req.query.limit as string, 10);
    compositions = compositions.slice(0, limit);
  }
  
  return res.json({
    success: true,
    timestamp: data.timestamp,
    patchVersion: data.patchVersion,
    count: compositions.length,
    compositions
  });
}));

/**
 * GET /api/compositions/:id
 * Get a specific team composition by ID
 */
router.get('/compositions/:id', asyncHandler(async (req: Request, res: Response) => {
  const data = loadCompositionsData();
  
  if (!data) {
    return res.status(404).json({ 
      success: false, 
      message: 'No compositions data found' 
    });
  }
  
  const composition = data.compositions.find(comp => comp.id === req.params.id);
  
  if (!composition) {
    return res.status(404).json({ 
      success: false, 
      message: `Composition with ID ${req.params.id} not found` 
    });
  }
  
  return res.json({
    success: true,
    composition
  });
}));

/**
 * GET /api/compositions/search
 * Search for team compositions by name or champion
 */
router.get('/compositions/search', asyncHandler(async (req: Request, res: Response) => {
  const data = loadCompositionsData();
  
  if (!data) {
    return res.status(404).json({ 
      success: false, 
      message: 'No compositions data found' 
    });
  }
  
  if (!req.query.q) {
    return res.status(400).json({ 
      success: false, 
      message: 'Search query is required' 
    });
  }
  
  const query = (req.query.q as string).toLowerCase();
  let results: TeamComposition[] = [];
  
  // Search by composition name
  const nameResults = data.compositions.filter(comp => 
    comp.name.toLowerCase().includes(query)
  );
  
  // Search by champion name
  const championResults = data.compositions.filter(comp => 
    comp.units.some(unit => unit.name.toLowerCase().includes(query))
  );
  
  // Combine results and remove duplicates
  results = [...nameResults];
  
  for (const comp of championResults) {
    if (!results.some(r => r.id === comp.id)) {
      results.push(comp);
    }
  }
  
  return res.json({
    success: true,
    count: results.length,
    compositions: results
  });
}));

/**
 * POST /api/scrape
 * Manually trigger the scraper
 */
router.post('/scrape', asyncHandler(async (req: Request, res: Response) => {
  logger.info('Manual scraper run triggered');
  
  try {
    const compositions = await runScraper();
    
    return res.json({
      success: true,
      message: 'Scraper run completed successfully',
      count: compositions.length
    });
  } catch (error) {
    logger.error('Manual scraper run failed:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Scraper run failed',
      error: (error as Error).message
    });
  }
}));

/**
 * GET /api/status
 * Get the status of the scraper service
 */
router.get('/status', (req: Request, res: Response) => {
  const data = loadCompositionsData();
  const nextRun = getNextRunTime();
  
  return res.json({
    success: true,
    status: 'running',
    lastUpdate: data?.timestamp || null,
    patchVersion: data?.patchVersion || null,
    compositionCount: data?.compositions.length || 0,
    nextScheduledRun: nextRun
  });
});

/**
 * POST /api/scheduler/start
 * Start the scheduler
 */
router.post('/scheduler/start', (req: Request, res: Response) => {
  startScheduler();
  const nextRun = getNextRunTime();
  
  return res.json({
    success: true,
    message: 'Scheduler started',
    nextScheduledRun: nextRun
  });
});

/**
 * POST /api/scheduler/stop
 * Stop the scheduler
 */
router.post('/scheduler/stop', (req: Request, res: Response) => {
  stopScheduler();
  
  return res.json({
    success: true,
    message: 'Scheduler stopped'
  });
});

export default router;
