/**
 * Formatting and validation utilities
 * 
 * This module provides functions for consistent data formatting
 * and validation throughout the application.
 */

/**
 * Format a date using the browser's locale
 * @param date Date to format (Date object or ISO string)
 * @param options Formatting options
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | number | null | undefined,
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }
): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'object' ? date : new Date(date);
    return new Intl.DateTimeFormat(undefined, options).format(dateObj);
  } catch (error) {
    console.warn('Failed to format date:', error);
    return '';
  }
}

/**
 * Format a date with time
 * @param date Date to format
 * @returns Formatted date with time
 */
export function formatDateTime(
  date: Date | string | number | null | undefined
): string {
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format a date relative to now (e.g., "2 hours ago")
 * @param date Date to format
 * @returns Relative time string
 */
export function formatRelativeTime(
  date: Date | string | number | null | undefined
): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'object' ? date : new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    
    // Less than a minute
    if (diffMs < 60000) {
      return 'just now';
    }
    
    // Less than an hour
    if (diffMs < 3600000) {
      const minutes = Math.floor(diffMs / 60000);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    
    // Less than a day
    if (diffMs < 86400000) {
      const hours = Math.floor(diffMs / 3600000);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    // Less than a week
    if (diffMs < 604800000) {
      const days = Math.floor(diffMs / 86400000);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
    
    // Less than a month
    if (diffMs < 2592000000) {
      const weeks = Math.floor(diffMs / 604800000);
      return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
    }
    
    // Default to standard date format
    return formatDate(date);
  } catch (error) {
    console.warn('Failed to format relative time:', error);
    return '';
  }
}

/**
 * Format currency value
 * @param value Amount to format
 * @param currency Currency code (default: BRL)
 * @param locale Locale (default: browser locale)
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number | string | null | undefined,
  currency = 'BRL',
  locale?: string
): string {
  if (value === null || value === undefined) return '';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '';
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(numValue);
  } catch (error) {
    console.warn('Failed to format currency:', error);
    return '';
  }
}

/**
 * Format a number with thousands separator
 * @param value Number to format
 * @param options Formatting options
 * @returns Formatted number string
 */
export function formatNumber(
  value: number | string | null | undefined,
  options: Intl.NumberFormatOptions = {}
): string {
  if (value === null || value === undefined) return '';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '';
  
  try {
    return new Intl.NumberFormat(undefined, options).format(numValue);
  } catch (error) {
    console.warn('Failed to format number:', error);
    return '';
  }
}

/**
 * Format a percentage value
 * @param value Value to format as percentage
 * @param fractionDigits Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercent(
  value: number | string | null | undefined,
  fractionDigits = 1
): string {
  if (value === null || value === undefined) return '';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '';
  
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'percent',
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits
    }).format(numValue / 100);
  } catch (error) {
    console.warn('Failed to format percentage:', error);
    return '';
  }
}

/**
 * Format a phone number with appropriate separators
 * @param phone Phone number to format
 * @returns Formatted phone number
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Format Brazilian phone numbers
  if (digits.length === 11) {
    // Mobile with DDD
    return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7)}`;
  } else if (digits.length === 10) {
    // Landline with DDD
    return `(${digits.substring(0, 2)}) ${digits.substring(2, 6)}-${digits.substring(6)}`;
  } else if (digits.length === 9) {
    // Mobile without DDD
    return `${digits.substring(0, 5)}-${digits.substring(5)}`;
  } else if (digits.length === 8) {
    // Landline without DDD
    return `${digits.substring(0, 4)}-${digits.substring(4)}`;
  }
  
  // Other formats or international numbers
  return phone;
}

/**
 * Format CPF with separators
 * @param cpf CPF number (digits only)
 * @returns Formatted CPF
 */
export function formatCPF(cpf: string | null | undefined): string {
  if (!cpf) return '';
  
  // Remove all non-digit characters
  const digits = cpf.replace(/\D/g, '');
  
  if (digits.length !== 11) return cpf;
  
  return `${digits.substring(0, 3)}.${digits.substring(3, 6)}.${digits.substring(6, 9)}-${digits.substring(9)}`;
}

/**
 * Format CNPJ with separators
 * @param cnpj CNPJ number (digits only)
 * @returns Formatted CNPJ
 */
export function formatCNPJ(cnpj: string | null | undefined): string {
  if (!cnpj) return '';
  
  // Remove all non-digit characters
  const digits = cnpj.replace(/\D/g, '');
  
  if (digits.length !== 14) return cnpj;
  
  return `${digits.substring(0, 2)}.${digits.substring(2, 5)}.${digits.substring(5, 8)}/${digits.substring(8, 12)}-${digits.substring(12)}`;
}

/**
 * Format CEP (Brazilian postal code)
 * @param cep Postal code (digits only)
 * @returns Formatted CEP
 */
export function formatCEP(cep: string | null | undefined): string {
  if (!cep) return '';
  
  // Remove all non-digit characters
  const digits = cep.replace(/\D/g, '');
  
  if (digits.length !== 8) return cep;
  
  return `${digits.substring(0, 5)}-${digits.substring(5)}`;
}

/**
 * Validate if a string is a valid email address
 * @param email Email address to validate
 * @returns Whether the email is valid
 */
export function isValidEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  
  // Basic email validation regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validate if a string is a valid CPF
 * @param cpf CPF to validate
 * @returns Whether the CPF is valid
 */
export function isValidCPF(cpf: string | null | undefined): boolean {
  if (!cpf) return false;
  
  // Remove all non-digit characters
  const digits = cpf.replace(/\D/g, '');
  
  if (digits.length !== 11) return false;
  
  // Check for known invalid patterns
  if (/^(\d)\1{10}$/.test(digits)) return false;
  
  // Calculate first verification digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  let firstDigit = remainder >= 10 ? 0 : remainder;
  
  // Calculate second verification digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  let secondDigit = remainder >= 10 ? 0 : remainder;
  
  // Check verification digits
  return (
    parseInt(digits.charAt(9)) === firstDigit && 
    parseInt(digits.charAt(10)) === secondDigit
  );
}

/**
 * Validate if a string is a valid CNPJ
 * @param cnpj CNPJ to validate
 * @returns Whether the CNPJ is valid
 */
export function isValidCNPJ(cnpj: string | null | undefined): boolean {
  if (!cnpj) return false;
  
  // Remove all non-digit characters
  const digits = cnpj.replace(/\D/g, '');
  
  if (digits.length !== 14) return false;
  
  // Check for known invalid patterns
  if (/^(\d)\1{13}$/.test(digits)) return false;
  
  // Calculate first verification digit
  let size = digits.length - 2;
  let numbers = digits.substring(0, size);
  const digits_verification = digits.substring(size);
  let sum = 0;
  let pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits_verification.charAt(0))) return false;
  
  // Calculate second verification digit
  size = size + 1;
  numbers = digits.substring(0, size);
  sum = 0;
  pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  return result === parseInt(digits_verification.charAt(1));
}