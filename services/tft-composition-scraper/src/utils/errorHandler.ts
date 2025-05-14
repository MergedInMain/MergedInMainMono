import logger from './logger';

/**
 * Custom error class for scraper-related errors
 */
export class ScraperError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = 'ScraperError';
    this.statusCode = statusCode;
    
    // This is needed because we're extending a built-in class
    Object.setPrototypeOf(this, ScraperError.prototype);
  }
}

/**
 * Handles errors in async functions
 * @param fn The async function to wrap with error handling
 * @returns A function that handles errors
 */
export function asyncHandler<T>(
  fn: (...args: any[]) => Promise<T>
): (...args: any[]) => Promise<T> {
  return async function(...args: any[]): Promise<T> {
    try {
      return await fn(...args);
    } catch (error) {
      logger.error('Error in async handler:', error);
      throw error;
    }
  };
}

/**
 * Retry a function with exponential backoff
 * @param fn The function to retry
 * @param maxRetries Maximum number of retry attempts
 * @param initialDelay Initial delay in milliseconds
 * @returns The result of the function
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  initialDelay: number
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt);
        logger.warn(`Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`, { error });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new ScraperError(
    `Failed after ${maxRetries} retries: ${lastError?.message || 'Unknown error'}`,
    503
  );
}
