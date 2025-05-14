/**
 * Meta TFT API Client
 * 
 * Provides methods for fetching data from the Meta TFT API.
 */

import { API_ENDPOINTS } from '../../../shared/constants';
import { MetaTftApi, ApiResponse, ApiError } from '../../../shared/api-types';
import { createRequestQueue } from '../request-queue';

/**
 * Meta TFT API client options
 */
interface MetaTftClientOptions {
  baseUrl?: string;
  apiKey?: string;
  maxRetries?: number;
  retryDelay?: number;
  requestsPerMinute?: number;
}

/**
 * Default client options
 */
const DEFAULT_OPTIONS: MetaTftClientOptions = {
  baseUrl: API_ENDPOINTS.META_TFT,
  maxRetries: 3,
  retryDelay: 1000,
  requestsPerMinute: 30
};

/**
 * Meta TFT API client
 */
class MetaTftClient {
  private options: MetaTftClientOptions;
  private requestQueue: ReturnType<typeof createRequestQueue>;

  /**
   * Create a new Meta TFT API client
   * @param options Client options
   */
  constructor(options: MetaTftClientOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.requestQueue = createRequestQueue({
      requestsPerMinute: this.options.requestsPerMinute || 30
    });
  }

  /**
   * Fetch team compositions from Meta TFT
   * @param patch Optional patch version
   * @returns Team compositions response
   */
  public async getTeamComps(patch?: string): Promise<ApiResponse<MetaTftApi.TeamCompsResponse>> {
    const endpoint = '/comps';
    const params = patch ? { patch } : {};
    
    return this.request<MetaTftApi.TeamCompsResponse>(endpoint, params);
  }

  /**
   * Fetch augments from Meta TFT
   * @param patch Optional patch version
   * @returns Augments response
   */
  public async getAugments(patch?: string): Promise<ApiResponse<MetaTftApi.AugmentsResponse>> {
    const endpoint = '/augments';
    const params = patch ? { patch } : {};
    
    return this.request<MetaTftApi.AugmentsResponse>(endpoint, params);
  }

  /**
   * Fetch items from Meta TFT
   * @param patch Optional patch version
   * @returns Items response
   */
  public async getItems(patch?: string): Promise<ApiResponse<any>> {
    const endpoint = '/items';
    const params = patch ? { patch } : {};
    
    return this.request<any>(endpoint, params);
  }

  /**
   * Make a request to the Meta TFT API
   * @param endpoint API endpoint
   * @param params Query parameters
   * @returns API response
   */
  private async request<T>(endpoint: string, params: Record<string, any> = {}): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.options.baseUrl);
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
    
    // Add API key if provided
    if (this.options.apiKey) {
      url.searchParams.append('apiKey', this.options.apiKey);
    }
    
    let retries = 0;
    
    while (retries <= (this.options.maxRetries || 0)) {
      try {
        // Queue the request to respect rate limits
        const response = await this.requestQueue.add(() => fetch(url.toString()));
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new ApiError(
            `Meta TFT API error: ${errorText}`,
            response.status
          );
        }
        
        const data = await response.json();
        
        return {
          data,
          status: response.status,
          success: true
        };
      } catch (error) {
        retries++;
        
        // If we've reached max retries, throw the error
        if (retries > (this.options.maxRetries || 0)) {
          return {
            error: error instanceof Error ? error.message : String(error),
            status: error instanceof ApiError ? error.status : 500,
            success: false
          };
        }
        
        // Otherwise, wait and retry
        const delay = (this.options.retryDelay || 1000) * Math.pow(2, retries - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // This should never be reached due to the return in the catch block
    return {
      error: 'Unknown error',
      status: 500,
      success: false
    };
  }
}

// Export a singleton instance
export default new MetaTftClient();
