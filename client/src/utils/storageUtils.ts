/**
 * Browser storage utilities for caching and persisting data
 * 
 * This module provides a standardized interface for working with
 * localStorage and sessionStorage with features like:
 * - Automatic expiration
 * - JSON serialization/deserialization
 * - Type safety
 * - Namespacing
 */

// Namespace for all storage keys to avoid conflicts
const STORAGE_NAMESPACE = 'app';

/**
 * Storage item with metadata
 */
interface StorageItem<T> {
  /** The stored data */
  data: T;
  /** Timestamp when the item expires (0 = never) */
  expires: number;
  /** Version for data structure migrations */
  version: number;
}

/**
 * Storage options
 */
interface StorageOptions {
  /** Time to live in milliseconds (0 = never expires) */
  ttl?: number;
  /** Whether to use session storage instead of local storage */
  session?: boolean;
  /** Data structure version */
  version?: number;
}

/**
 * Sets an item in storage with optional expiration
 * @param key Storage key
 * @param data Data to store
 * @param options Storage options
 */
export function setStorageItem<T>(
  key: string,
  data: T,
  options: StorageOptions = {}
): void {
  try {
    const { ttl = 0, session = false, version = 1 } = options;
    
    // Calculate expiration time
    const expires = ttl > 0 ? Date.now() + ttl : 0;
    
    // Create storage item with metadata
    const item: StorageItem<T> = {
      data,
      expires,
      version
    };
    
    // Namespace the key
    const namespacedKey = `${STORAGE_NAMESPACE}:${key}`;
    
    // Serialize and store
    const serializedItem = JSON.stringify(item);
    const storage = session ? sessionStorage : localStorage;
    
    storage.setItem(namespacedKey, serializedItem);
  } catch (error) {
    console.warn(`Failed to set storage item '${key}':`, error);
  }
}

/**
 * Gets an item from storage if it exists and hasn't expired
 * @param key Storage key
 * @param options Storage options
 * @returns The stored data or null if not found, expired, or invalid
 */
export function getStorageItem<T>(
  key: string,
  options: StorageOptions = {}
): T | null {
  try {
    const { session = false, version = 1 } = options;
    
    // Namespace the key
    const namespacedKey = `${STORAGE_NAMESPACE}:${key}`;
    
    // Get from appropriate storage
    const storage = session ? sessionStorage : localStorage;
    const serializedItem = storage.getItem(namespacedKey);
    
    if (!serializedItem) {
      return null;
    }
    
    // Parse the stored item
    const item = JSON.parse(serializedItem) as StorageItem<T>;
    
    // Check version compatibility
    if (item.version !== version) {
      // Version mismatch - data structure has changed
      removeStorageItem(key, { session });
      return null;
    }
    
    // Check if expired
    if (item.expires > 0 && item.expires < Date.now()) {
      // Expired - clean up and return null
      removeStorageItem(key, { session });
      return null;
    }
    
    return item.data;
  } catch (error) {
    console.warn(`Failed to get storage item '${key}':`, error);
    return null;
  }
}

/**
 * Removes an item from storage
 * @param key Storage key
 * @param options Storage options
 */
export function removeStorageItem(
  key: string,
  options: StorageOptions = {}
): void {
  try {
    const { session = false } = options;
    
    // Namespace the key
    const namespacedKey = `${STORAGE_NAMESPACE}:${key}`;
    
    // Remove from appropriate storage
    const storage = session ? sessionStorage : localStorage;
    storage.removeItem(namespacedKey);
  } catch (error) {
    console.warn(`Failed to remove storage item '${key}':`, error);
  }
}

/**
 * Clears all items in the app's namespace
 * @param options Storage options
 */
export function clearNamespacedStorage(
  options: StorageOptions = {}
): void {
  try {
    const { session = false } = options;
    const storage = session ? sessionStorage : localStorage;
    
    // Get all keys in the namespace
    const namespacedKeys: string[] = [];
    
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith(`${STORAGE_NAMESPACE}:`)) {
        namespacedKeys.push(key);
      }
    }
    
    // Remove each namespaced key
    namespacedKeys.forEach(key => {
      storage.removeItem(key);
    });
  } catch (error) {
    console.warn('Failed to clear namespaced storage:', error);
  }
}

/**
 * Removes all expired items from storage
 * @param options Storage options
 * @returns Number of items removed
 */
export function pruneExpiredItems(
  options: StorageOptions = {}
): number {
  try {
    const { session = false } = options;
    const storage = session ? sessionStorage : localStorage;
    let removedCount = 0;
    
    // Iterate through all storage keys
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      
      // Skip non-app keys
      if (!key || !key.startsWith(`${STORAGE_NAMESPACE}:`)) {
        continue;
      }
      
      try {
        // Check if item is expired
        const serializedItem = storage.getItem(key);
        if (!serializedItem) continue;
        
        const item = JSON.parse(serializedItem) as StorageItem<any>;
        
        if (item.expires > 0 && item.expires < Date.now()) {
          // Remove expired item
          storage.removeItem(key);
          removedCount++;
        }
      } catch {
        // Skip invalid items
      }
    }
    
    return removedCount;
  } catch (error) {
    console.warn('Failed to prune expired items:', error);
    return 0;
  }
}

/**
 * Gets storage usage statistics
 * @returns Object with usage statistics
 */
export function getStorageStats(): { 
  itemCount: number; 
  totalSize: number;
  appItems: number;
} {
  try {
    let totalSize = 0;
    let itemCount = 0;
    let appItems = 0;
    
    // Check localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      
      const value = localStorage.getItem(key) || '';
      totalSize += key.length + value.length;
      itemCount++;
      
      if (key.startsWith(`${STORAGE_NAMESPACE}:`)) {
        appItems++;
      }
    }
    
    // Convert to approximate bytes (2 bytes per character in UTF-16)
    totalSize = totalSize * 2;
    
    return { itemCount, totalSize, appItems };
  } catch (error) {
    console.warn('Failed to get storage stats:', error);
    return { itemCount: 0, totalSize: 0, appItems: 0 };
  }
}