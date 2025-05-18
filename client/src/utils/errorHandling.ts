/**
 * Error handling utilities for API requests and application errors
 * 
 * This module provides centralized error handling functions to standardize
 * how errors are processed, logged, and presented to users.
 */
import { ApiError } from '../types/api';

/**
 * Error categories for better error handling
 */
export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  SERVER = 'server',
  CLIENT = 'client',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown'
}

/**
 * Standardized error structure for application use
 */
export interface AppError {
  /** Error message for display */
  message: string;
  /** Original error */
  originalError?: any;
  /** Error category */
  category: ErrorCategory;
  /** HTTP status code if applicable */
  statusCode?: number;
  /** Whether error has been handled */
  handled: boolean;
  /** Field-specific validation errors */
  fieldErrors?: Record<string, string>;
  /** Error code for programmatic handling */
  code?: string;
  /** Additional error details */
  details?: any;
}

/**
 * Maps HTTP status codes to error categories
 * @param statusCode HTTP status code
 * @returns Appropriate error category
 */
export function mapStatusToCategory(statusCode?: number): ErrorCategory {
  if (!statusCode) return ErrorCategory.UNKNOWN;
  
  if (statusCode === 0 || statusCode >= 600) {
    return ErrorCategory.NETWORK;
  }
  
  // Map status codes to categories
  switch (statusCode) {
    case 401:
      return ErrorCategory.AUTHENTICATION;
    case 403:
      return ErrorCategory.AUTHORIZATION;
    case 400:
    case 422:
      return ErrorCategory.VALIDATION;
    case 408:
    case 504:
      return ErrorCategory.TIMEOUT;
    default:
      // Server errors (5xx)
      if (statusCode >= 500) {
        return ErrorCategory.SERVER;
      }
      // Client errors (4xx)
      if (statusCode >= 400) {
        return ErrorCategory.CLIENT;
      }
      return ErrorCategory.UNKNOWN;
  }
}

/**
 * Converts any error to a standardized AppError
 * @param error The error to process
 * @returns Standardized AppError object
 */
export function processError(error: any): AppError {
  // Already processed error
  if (error && error.category) {
    return error as AppError;
  }
  
  // Handle API errors
  if (error && (error.status || error.statusCode)) {
    const statusCode = error.status || error.statusCode;
    const category = mapStatusToCategory(statusCode);
    
    return {
      message: error.message || getDefaultMessageForCategory(category),
      originalError: error,
      category,
      statusCode,
      handled: false,
      fieldErrors: error.validationErrors || error.fieldErrors,
      code: error.code,
      details: error.details
    };
  }
  
  // Handle network errors
  if (error instanceof TypeError && error.message.includes('network')) {
    return {
      message: 'Network error. Please check your internet connection.',
      originalError: error,
      category: ErrorCategory.NETWORK,
      handled: false
    };
  }
  
  // Handle timeout errors
  if (error && error.name === 'AbortError') {
    return {
      message: 'The request timed out. Please try again.',
      originalError: error,
      category: ErrorCategory.TIMEOUT,
      handled: false
    };
  }
  
  // Default error handling
  return {
    message: error?.message || 'An unexpected error occurred',
    originalError: error,
    category: ErrorCategory.UNKNOWN,
    handled: false
  };
}

/**
 * Gets a user-friendly default message for an error category
 * @param category Error category
 * @returns User-friendly error message
 */
export function getDefaultMessageForCategory(category: ErrorCategory): string {
  switch (category) {
    case ErrorCategory.NETWORK:
      return 'Network error. Please check your internet connection.';
    case ErrorCategory.AUTHENTICATION:
      return 'You need to log in to access this resource.';
    case ErrorCategory.AUTHORIZATION:
      return 'You do not have permission to access this resource.';
    case ErrorCategory.VALIDATION:
      return 'The provided data is invalid. Please check your inputs.';
    case ErrorCategory.SERVER:
      return 'The server encountered an error. Please try again later.';
    case ErrorCategory.CLIENT:
      return 'There was an error with the request. Please try again.';
    case ErrorCategory.TIMEOUT:
      return 'The request timed out. Please try again.';
    case ErrorCategory.UNKNOWN:
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Logs an error with appropriate level and details
 * @param error Error to log
 * @param context Additional context information
 */
export function logError(error: AppError, context?: any): void {
  // Determine log level based on error category
  const isSevere = [
    ErrorCategory.SERVER,
    ErrorCategory.UNKNOWN
  ].includes(error.category);
  
  const logMethod = isSevere ? console.error : console.warn;
  
  // Log the error with context
  logMethod(
    `[${error.category.toUpperCase()}] ${error.statusCode ? `${error.statusCode}: ` : ''}${error.message}`,
    {
      error: error.originalError,
      details: error.details,
      fieldErrors: error.fieldErrors,
      code: error.code,
      context
    }
  );
  
  // Mark error as handled
  error.handled = true;
}

/**
 * Handles an API error and returns a user-friendly error message
 * @param error Error from API request
 * @param context Additional context for logging
 * @returns User-friendly error message
 */
export function handleApiError(error: any, context?: any): string {
  const appError = processError(error);
  logError(appError, context);
  
  // Return user-friendly message
  if (appError.category === ErrorCategory.VALIDATION && appError.fieldErrors) {
    // For validation errors, return the first field error
    const firstFieldError = Object.values(appError.fieldErrors)[0];
    return firstFieldError || appError.message;
  }
  
  return appError.message;
}