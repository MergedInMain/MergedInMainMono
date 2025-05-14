/**
 * Request Queue
 * 
 * Utility for managing API request rates and preventing rate limiting.
 */

/**
 * Request queue options
 */
interface RequestQueueOptions {
  requestsPerMinute: number;
  maxConcurrent?: number;
}

/**
 * Default queue options
 */
const DEFAULT_OPTIONS: RequestQueueOptions = {
  requestsPerMinute: 60,
  maxConcurrent: 5
};

/**
 * Create a request queue for rate limiting
 * @param options Queue options
 * @returns Request queue methods
 */
export function createRequestQueue(options: RequestQueueOptions = DEFAULT_OPTIONS) {
  const { requestsPerMinute, maxConcurrent } = { ...DEFAULT_OPTIONS, ...options };
  
  // Calculate delay between requests in milliseconds
  const minDelay = 60000 / requestsPerMinute;
  
  // Queue of pending requests
  const queue: Array<{
    fn: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
  }> = [];
  
  // Timestamps of recent requests
  const recentRequests: number[] = [];
  
  // Number of active requests
  let activeRequests = 0;
  
  // Whether the queue processor is running
  let isProcessing = false;
  
  /**
   * Process the next request in the queue
   */
  async function processQueue() {
    if (isProcessing || queue.length === 0 || activeRequests >= (maxConcurrent || 1)) {
      return;
    }
    
    isProcessing = true;
    
    try {
      // Check if we need to wait due to rate limiting
      const now = Date.now();
      
      // Remove timestamps older than 1 minute
      while (recentRequests.length > 0 && recentRequests[0] < now - 60000) {
        recentRequests.shift();
      }
      
      // If we've reached the rate limit, wait until we can make another request
      if (recentRequests.length >= requestsPerMinute) {
        const oldestRequest = recentRequests[0];
        const waitTime = oldestRequest + 60000 - now;
        
        if (waitTime > 0) {
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
      
      // Get the next request from the queue
      const request = queue.shift();
      
      if (request) {
        activeRequests++;
        
        try {
          // Add timestamp for rate limiting
          recentRequests.push(Date.now());
          
          // Execute the request
          const result = await request.fn();
          request.resolve(result);
        } catch (error) {
          request.reject(error);
        } finally {
          activeRequests--;
        }
      }
    } finally {
      isProcessing = false;
      
      // Process the next request if there are any in the queue
      if (queue.length > 0) {
        // Add a small delay between requests
        setTimeout(() => processQueue(), minDelay);
      }
    }
  }
  
  /**
   * Add a request to the queue
   * @param fn Function that returns a promise
   * @returns Promise that resolves with the result of the function
   */
  function add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      // Add the request to the queue
      queue.push({ fn, resolve, reject });
      
      // Start processing the queue if it's not already running
      if (!isProcessing && activeRequests < (maxConcurrent || 1)) {
        processQueue();
      }
    });
  }
  
  /**
   * Get the current queue length
   * @returns Number of requests in the queue
   */
  function getQueueLength(): number {
    return queue.length;
  }
  
  /**
   * Get the number of active requests
   * @returns Number of active requests
   */
  function getActiveRequests(): number {
    return activeRequests;
  }
  
  /**
   * Clear the queue
   */
  function clear(): void {
    // Reject all pending requests
    queue.forEach(request => {
      request.reject(new Error('Queue cleared'));
    });
    
    // Clear the queue
    queue.length = 0;
  }
  
  return {
    add,
    getQueueLength,
    getActiveRequests,
    clear
  };
}
