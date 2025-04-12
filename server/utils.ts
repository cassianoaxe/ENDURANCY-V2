// Utility functions for the server

/**
 * Generates a random string of specified length
 * @param length Length of the string to generate
 * @returns Random string
 */
export function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return result;
}

/**
 * Formats a date to a locale string (PT-BR by default)
 * @param date Date to format
 * @param locale Locale to use
 * @returns Formatted date string
 */
export function formatDate(date: Date, locale: string = 'pt-BR'): string {
  return date.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Formats a date with time to a locale string (PT-BR by default)
 * @param date Date to format
 * @param locale Locale to use
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date, locale: string = 'pt-BR'): string {
  return date.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Truncates a string to a specified length
 * @param str String to truncate
 * @param maxLength Maximum length
 * @returns Truncated string
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
}

/**
 * Converts first letter of each word to uppercase
 * @param str String to capitalize
 * @returns Capitalized string
 */
export function toTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    txt => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
}

/**
 * Returns differences between two objects
 * @param obj1 First object
 * @param obj2 Second object
 * @returns Object containing only the differences
 */
export function objectDiff(obj1: any, obj2: any): any {
  const diff: any = {};
  
  // Check keys from obj1
  Object.keys(obj1).forEach(key => {
    if (obj2[key] !== obj1[key]) {
      diff[key] = obj2[key];
    }
  });
  
  // Check for new keys in obj2
  Object.keys(obj2).forEach(key => {
    if (obj1[key] === undefined) {
      diff[key] = obj2[key];
    }
  });
  
  return diff;
}

/**
 * Deep clone an object
 * @param obj Object to clone
 * @returns Cloned object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Validates if a string is a valid UUID
 * @param uuid String to validate
 * @returns True if valid UUID
 */
export function isValidUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Generates a simple hash code from a string
 * @param str String to hash
 * @returns Hash code
 */
export function simpleHash(str: string): number {
  let hash = 0;
  if (str.length === 0) return hash;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash);
}

/**
 * Creates a sleep function that returns a promise
 * @param ms Milliseconds to sleep
 * @returns Promise that resolves after specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Formats a number as currency
 * @param value Number to format
 * @param locale Locale to use
 * @param currency Currency code
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, locale: string = 'pt-BR', currency: string = 'BRL'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(value);
}