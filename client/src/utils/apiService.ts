/**
 * API service for standardized HTTP requests
 * 
 * This module provides a consistent interface for making API requests
 * with automatic error handling, retries, and caching.
 */
import { ApiRequestOptions, ApiResponse, ApiError } from '../types/api';
import { getStorageItem, setStorageItem } from './storageUtils';
import { processError, ErrorCategory } from './errorHandling';

// Default request timeout in milliseconds
const DEFAULT_TIMEOUT = 30000; // 30 seconds

// Default number of retry attempts for failed requests
const DEFAULT_RETRY_ATTEMPTS = 1;

// Default backoff factor for retries (in milliseconds)
const DEFAULT_RETRY_BACKOFF = 300;

/**
 * Extended options for API requests
 */
interface RequestOptions extends ApiRequestOptions {
  /** Number of retry attempts for failed requests */
  retries?: number;
  /** Whether to show loading indicator */
  showLoading?: boolean;
  /** Whether to handle errors automatically */
  handleErrors?: boolean;
  /** Whether to use session-based cache */
  sessionCache?: boolean;
}

/**
 * Make an API request with standardized error handling and retries
 * @param url API endpoint URL
 * @param options Request options
 * @returns Promise resolving to the API response
 */
export async function apiRequest<T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    data,
    headers = {},
    includeCredentials = true,
    signal,
    cache,
    timeout = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRY_ATTEMPTS,
    showLoading = true,
    handleErrors = true,
    sessionCache = false
  } = options;

  // Use cache if enabled and it's a GET request
  if (cache?.enabled && method === 'GET') {
    const cacheKey = cache.key || `api:${url}`;
    const cachedData = getStorageItem<T>(cacheKey, {
      session: sessionCache,
      ttl: cache.ttl
    });

    if (cachedData) {
      return cachedData;
    }
  }

  // Show loading indicator if enabled
  if (showLoading) {
    // TODO: Implement global loading state management
    // Could use a store like Redux/Zustand or a simple context
  }

  // Create abort controller for timeout if none provided
  let timeoutId: number | null = null;
  const controller = signal ? undefined : new AbortController();
  const requestSignal = signal || controller?.signal;

  // Set up timeout
  if (controller && timeout > 0) {
    timeoutId = window.setTimeout(() => {
      controller.abort();
    }, timeout);
  }

  // Prepare request headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...headers
  };

  // Function to perform the request attempt
  const performRequest = async (attempt: number): Promise<T> => {
    try {
      // Prepare request options
      const requestOptions: RequestInit = {
        method,
        headers: requestHeaders,
        credentials: includeCredentials ? 'include' : 'omit',
        signal: requestSignal
      };

      // Add request body for non-GET requests
      if (method !== 'GET' && data !== undefined) {
        requestOptions.body = JSON.stringify(data);
      }

      // Make the request
      const response = await fetch(url, requestOptions);

      // Clear timeout if set
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      // Handle HTTP error responses
      if (!response.ok) {
        let errorData: ApiError = {
          status: response.status,
          message: response.statusText || 'Request failed'
        };

        // Try to parse error details from response
        try {
          const contentType = response.headers.get('content-type');
          if (contentType?.includes('application/json')) {
            const errorJson = await response.json();
            errorData = {
              ...errorData,
              ...errorJson,
              message: errorJson.message || errorJson.error || errorData.message
            };
          }
        } catch {
          // Ignore parsing errors
        }

        // Special handling for 401 Unauthorized (authentication)
        if (response.status === 401 && handleErrors) {
          // TODO: Handle authentication error (redirect to login, etc.)
          // For now, we just throw the error
          throw errorData;
        }

        throw errorData;
      }

      // No content responses (204)
      if (response.status === 204) {
        return {} as T;
      }

      // Parse JSON response
      const contentType = response.headers.get('content-type');
      let responseData: T;

      if (contentType?.includes('application/json')) {
        responseData = await response.json();
      } else {
        // For non-JSON responses, return empty object
        responseData = {} as T;
      }

      // Cache response if enabled for GET requests
      if (cache?.enabled && method === 'GET') {
        const cacheKey = cache.key || `api:${url}`;
        setStorageItem(cacheKey, responseData, {
          ttl: cache.ttl,
          session: sessionCache
        });
      }

      return responseData;
    } catch (error: any) {
      // Handle aborted requests (timeout or user cancellation)
      if (error.name === 'AbortError') {
        throw {
          message: 'Request timed out',
          status: 0,
          code: 'TIMEOUT'
        };
      }

      // Retry logic for network failures or 5xx errors
      const shouldRetry = 
        attempt < retries && 
        (error.status === undefined || error.status >= 500 || error.status === 0);

      if (shouldRetry) {
        // Calculate backoff delay using exponential backoff
        const delay = DEFAULT_RETRY_BACKOFF * Math.pow(2, attempt);
        
        // Wait for the backoff period
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Try again
        return performRequest(attempt + 1);
      }

      // No more retries, throw the error
      throw error;
    } finally {
      // Hide loading indicator if this was the last attempt
      if (showLoading && (!retries || retries <= 0)) {
        // TODO: Hide global loading state
      }
    }
  };

  try {
    // Start the request with attempt 0
    return await performRequest(0);
  } catch (error) {
    const appError = processError(error);
    
    // For network errors, provide a more user-friendly message
    if (appError.category === ErrorCategory.NETWORK) {
      appError.message = 'Unable to connect to the server. Please check your internet connection.';
    }

    // Rethrow the processed error
    throw appError;
  }
}

/**
 * Convenience method for GET requests
 * @param url API endpoint URL
 * @param options Request options
 * @returns Promise resolving to the API response
 */
export function get<T = any>(
  url: string,
  options: Omit<RequestOptions, 'method'> = {}
): Promise<T> {
  return apiRequest<T>(url, { ...options, method: 'GET' });
}

/**
 * Convenience method for POST requests
 * @param url API endpoint URL
 * @param data Request body data
 * @param options Request options
 * @returns Promise resolving to the API response
 */
export function post<T = any>(
  url: string,
  data?: any,
  options: Omit<RequestOptions, 'method' | 'data'> = {}
): Promise<T> {
  return apiRequest<T>(url, { ...options, method: 'POST', data });
}

/**
 * Convenience method for PUT requests
 * @param url API endpoint URL
 * @param data Request body data
 * @param options Request options
 * @returns Promise resolving to the API response
 */
export function put<T = any>(
  url: string,
  data?: any,
  options: Omit<RequestOptions, 'method' | 'data'> = {}
): Promise<T> {
  return apiRequest<T>(url, { ...options, method: 'PUT', data });
}

/**
 * Convenience method for PATCH requests
 * @param url API endpoint URL
 * @param data Request body data
 * @param options Request options
 * @returns Promise resolving to the API response
 */
export function patch<T = any>(
  url: string,
  data?: any,
  options: Omit<RequestOptions, 'method' | 'data'> = {}
): Promise<T> {
  return apiRequest<T>(url, { ...options, method: 'PATCH', data });
}

/**
 * Convenience method for DELETE requests
 * @param url API endpoint URL
 * @param options Request options
 * @returns Promise resolving to the API response
 */
export function del<T = any>(
  url: string,
  options: Omit<RequestOptions, 'method'> = {}
): Promise<T> {
  return apiRequest<T>(url, { ...options, method: 'DELETE' });
}