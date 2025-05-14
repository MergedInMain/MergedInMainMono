import express from 'express';
import cors from 'cors';
import routes from './routes';
import logger from '../utils/logger';
import config from '../config';
import { ScraperError } from '../utils/errorHandler';

// Create Express server
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// API routes
app.use('/api', routes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Error handling request:', err);
  
  if (err instanceof ScraperError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }
  
  return res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start the server
export function startServer(): void {
  const { port, host } = config.server;
  
  app.listen(port, () => {
    logger.info(`Server running at http://${host}:${port}`);
  });
}

export default app;
