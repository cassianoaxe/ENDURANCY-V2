/**
 * Custom hook for working with URL query parameters
 * 
 * This hook provides a clean interface for reading and updating
 * query parameters without full page refreshes.
 */
import { useState, useCallback, useEffect } from 'react';
import { useLocation, useRouter } from 'wouter';

/**
 * Options for the useQueryParams hook
 */
interface UseQueryParamsOptions {
  /** Whether to update the URL when params change */
  updateUrl?: boolean;
  /** Whether to parse numbers in query params */
  parseNumbers?: boolean;
  /** Whether to parse booleans in query params */
  parseBooleans?: boolean;
}

/**
 * Type definitions for query parameter values
 */
type QueryParamValue = string | number | boolean | null;
type QueryParams = Record<string, QueryParamValue>;

/**
 * Hook for working with URL query parameters
 * @param initialParams Default parameter values
 * @param options Configuration options
 * @returns [params, setParams, resetParams] tuple
 */
export function useQueryParams(
  initialParams: QueryParams = {},
  options: UseQueryParamsOptions = {}
): [
  QueryParams,
  (params: QueryParams, replace?: boolean) => void,
  () => void
] {
  const [location] = useLocation();
  const [, navigate] = useRouter();
  
  // Default options
  const { 
    updateUrl = true,
    parseNumbers = true,
    parseBooleans = true
  } = options;
  
  // Initialize state from URL and initial params
  const [params, setParamsState] = useState<QueryParams>(() => {
    const urlParams = parseQueryString(window.location.search, { parseNumbers, parseBooleans });
    return { ...initialParams, ...urlParams };
  });
  
  // Parse query string from URL when location changes
  useEffect(() => {
    const urlParams = parseQueryString(window.location.search, { parseNumbers, parseBooleans });
    setParamsState(prevParams => ({ ...prevParams, ...urlParams }));
  }, [location, parseNumbers, parseBooleans]);
  
  // Update params and optionally update URL
  const setParams = useCallback((newParams: QueryParams, replace = false) => {
    setParamsState(prevParams => {
      // Merge with previous params
      const updatedParams = { ...prevParams, ...newParams };
      
      // Remove null/undefined values
      Object.keys(updatedParams).forEach(key => {
        if (updatedParams[key] === null || updatedParams[key] === undefined) {
          delete updatedParams[key];
        }
      });
      
      // Update URL if needed
      if (updateUrl) {
        const queryString = stringifyQueryParams(updatedParams);
        const newUrl = location.split('?')[0] + (queryString ? `?${queryString}` : '');
        
        if (replace) {
          navigate(newUrl, { replace: true });
        } else {
          navigate(newUrl);
        }
      }
      
      return updatedParams;
    });
  }, [location, navigate, updateUrl]);
  
  // Reset params to initial values
  const resetParams = useCallback(() => {
    setParams(initialParams, true);
  }, [initialParams, setParams]);
  
  return [params, setParams, resetParams];
}

/**
 * Parse a query string into an object
 * @param queryString Query string to parse
 * @param options Parsing options
 * @returns Parsed query parameters
 */
function parseQueryString(
  queryString: string,
  options: { parseNumbers: boolean; parseBooleans: boolean }
): QueryParams {
  const { parseNumbers, parseBooleans } = options;
  
  // Remove leading '?' if present
  const normalizedQueryString = queryString.startsWith('?')
    ? queryString.slice(1)
    : queryString;
  
  if (!normalizedQueryString) return {};
  
  return normalizedQueryString.split('&').reduce((params, param) => {
    const [key, rawValue] = param.split('=');
    if (!key) return params;
    
    // Decode the value
    const decodedKey = decodeURIComponent(key);
    const decodedValue = rawValue ? decodeURIComponent(rawValue) : '';
    
    // Parse value based on options
    let parsedValue: QueryParamValue = decodedValue;
    
    if (parseNumbers && !isNaN(Number(decodedValue)) && decodedValue.trim() !== '') {
      parsedValue = Number(decodedValue);
    } else if (parseBooleans) {
      if (decodedValue === 'true') parsedValue = true;
      if (decodedValue === 'false') parsedValue = false;
    }
    
    return { ...params, [decodedKey]: parsedValue };
  }, {} as QueryParams);
}

/**
 * Convert a params object to a query string
 * @param params Parameters to stringify
 * @returns Query string (without leading '?')
 */
function stringifyQueryParams(params: QueryParams): string {
  return Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined)
    .map(([key, value]) => {
      const encodedKey = encodeURIComponent(key);
      const encodedValue = encodeURIComponent(String(value));
      return `${encodedKey}=${encodedValue}`;
    })
    .join('&');
}