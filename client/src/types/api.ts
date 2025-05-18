/**
 * API and data fetching related type definitions
 */

/**
 * Standard API response structure
 */
export interface ApiResponse<T = any> {
  /** Whether the request was successful */
  success: boolean;
  /** Response message */
  message?: string;
  /** Response data */
  data?: T;
  /** Error details if any */
  error?: string | object;
  /** Pagination metadata if applicable */
  pagination?: PaginationMeta;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  /** Current page number */
  page: number;
  /** Number of items per page */
  limit: number;
  /** Total number of items */
  total: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there is a next page */
  hasNextPage: boolean;
  /** Whether there is a previous page */
  hasPrevPage: boolean;
}

/**
 * Query parameters for paginated requests
 */
export interface PaginationParams {
  /** Page number (1-based) */
  page?: number;
  /** Number of items per page */
  limit?: number;
  /** Sort field */
  sortBy?: string;
  /** Sort direction */
  sortDirection?: 'asc' | 'desc';
  /** Search query */
  search?: string;
  /** Filter parameters */
  filters?: Record<string, any>;
}

/**
 * Cache configuration for requests
 */
export interface CacheConfig {
  /** Whether to enable caching */
  enabled: boolean;
  /** Cache duration in milliseconds */
  ttl: number;
  /** Cache key */
  key?: string;
  /** Whether to invalidate cache on mutation */
  invalidateOnMutation?: boolean;
  /** Cache group for batch invalidation */
  group?: string;
}

/**
 * Error details for API requests
 */
export interface ApiError {
  /** HTTP status code */
  status?: number;
  /** Error code */
  code?: string;
  /** Error message */
  message: string;
  /** Detailed error information */
  details?: any;
  /** Request ID for tracing */
  requestId?: string;
  /** Field-specific validation errors */
  validationErrors?: Record<string, string>;
}

/**
 * Request options for API calls
 */
export interface ApiRequestOptions {
  /** HTTP method */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Request data */
  data?: any;
  /** Request headers */
  headers?: Record<string, string>;
  /** Whether to include credentials */
  includeCredentials?: boolean;
  /** Abort controller for cancellation */
  signal?: AbortSignal;
  /** Cache settings */
  cache?: CacheConfig;
  /** Request timeout in milliseconds */
  timeout?: number;
}